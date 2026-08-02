import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

import { detectCriticalError, evaluateCaseAnswer } from "./_generated/deterministic.ts";
import { mergeTutorResults } from "./_generated/merge.ts";
import { validateLlmPayload } from "./_generated/schema.ts";
import type { TutorResult } from "./_generated/schema.ts";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-v4-pro";
const UPSTREAM_TIMEOUT_MS = 20_000;
const RATE_LIMIT_PER_HOUR = 40;
const MAX_ANSWER_CHARS = 8_000;
const GROUNDING_TTL_MS = 600_000;

/**
 * The grounding pack is published as a static asset alongside the app rather
 * than embedded here, so editing a rubric or a concept and pushing updates the
 * tutor without redeploying this function.
 */
const GROUNDING_URL =
  Deno.env.get("TUTOR_GROUNDING_URL") ??
  "https://jaster860-dot.github.io/oncort-academy/tutor-grounding.json";

type GroundingPack = {
  site: string;
  rubric: string;
  concepts: string;
  sources: string;
  allowedIds: string[];
};

let groundingCache: { at: number; packs: Record<string, GroundingPack> } | null = null;

async function loadGrounding(): Promise<Record<string, GroundingPack> | null> {
  if (groundingCache && Date.now() - groundingCache.at < GROUNDING_TTL_MS) {
    return groundingCache.packs;
  }
  try {
    const response = await fetch(GROUNDING_URL, { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return groundingCache?.packs ?? null;
    const body = await response.json();
    const packs = body?.packs;
    if (!packs || typeof packs !== "object") return groundingCache?.packs ?? null;
    groundingCache = { at: Date.now(), packs };
    return packs;
  } catch {
    // Serve a stale pack rather than degrading, if we ever had one.
    return groundingCache?.packs ?? null;
  }
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

/**
 * The schema is described in the prompt rather than enforced by the provider:
 * deepseek-v4-pro does not support `response_format: json_schema`, only
 * `json_object`. Local validation is therefore mandatory, not a nicety.
 */
const SCHEMA_TXT = `{
  "verdict": "correct" | "partial" | "unsafe",
  "criticalError": boolean,
  "criticalErrorReason": string,
  "outOfScope": boolean,
  "outOfScopeNote": string,
  "axes": [
    {
      "id": "finalAnswerAccuracy" | "missingDataDetection" | "mechanismUnderstanding" | "treatmentToolMatching" | "confidenceCalibration",
      "score": 0 | 1 | 2,
      "rationale": string,
      "citations": string[]
    }
  ]
}`;

function buildSystemPrompt(pack: GroundingPack): string {
  return `Tu es examinateur en oncologie-radiothérapie. Tu notes le raisonnement clinique d'un interne, en français.
Tu évalues un raisonnement pédagogique ; tu ne délivres jamais de conseil médical à un patient.

RÈGLE D'ANCRAGE — LA PLUS IMPORTANTE :
Tu évalues EXCLUSIVEMENT à partir du CONTENU PÉDAGOGIQUE et des SOURCES fournis ci-dessous.
N'invoque JAMAIS tes connaissances générales, ni une recommandation, un essai ou un chiffre
absent de ce contenu.
Chaque "rationale" doit citer au moins un identifiant dans "citations", pris STRICTEMENT dans
les listes conceptId/sourceId fournies. N'invente jamais d'identifiant : un identifiant inconnu
invalide toute ta réponse.
Si l'interne aborde un point que le contenu ne couvre pas, mets outOfScope=true, explique-le
dans outOfScopeNote, et n'invente pas d'évaluation sur ce point.

Si la réponse contient une erreur critique listée dans la grille, criticalError=true et
verdict="unsafe", quelle que soit la qualité du reste.
Utilise toute l'échelle : 2 = maîtrisé, 1 = partiel, 0 = absent ou faux.

Réponds UNIQUEMENT par un objet JSON conforme à ce schéma, sans texte autour :
${SCHEMA_TXT}

Le tableau "axes" doit contenir exactement les 5 identifiants, une seule fois chacun.

========== GRILLE ==========
${pack.rubric}

========== CONTENU PÉDAGOGIQUE (seule base autorisée) ==========
${pack.concepts}

========== SOURCES AUTORISÉES ==========
${pack.sources}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");

  // Identify the learner from their own JWT rather than trusting the body.
  const asUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await asUser.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  let body: { siteId?: string; caseId?: string; phase?: string; answer?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const siteId = String(body.siteId ?? "");
  const caseId = String(body.caseId ?? "");
  const answer = String(body.answer ?? "");
  const phase = body.phase === "retest" ? "retest" : "case";

  if (!answer.trim()) return json({ error: "empty_answer" }, 400);
  if (answer.length > MAX_ANSWER_CHARS) return json({ error: "answer_too_long" }, 413);

  const packs = await loadGrounding();
  // A genuinely unknown site is a client error; an unreachable grounding asset
  // is not, and must still yield a grade through the deterministic engine.
  if (packs && !packs[siteId]) return json({ error: "unknown_site", siteId }, 400);
  const pack = packs?.[siteId] ?? null;

  const admin = createClient(supabaseUrl, serviceKey);

  // Per-user rate limit. Counting rows is cheap here and needs no extra state.
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await admin
    .from("tutor_evaluations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json({ error: "rate_limited", retryAfterMinutes: 60 }, 429);
  }

  // The deterministic engine always runs: it is both the safety net and the
  // fallback, so it is computed before the model is ever consulted.
  const deterministic = evaluateCaseAnswer(answer);
  const netCriticalError = detectCriticalError(answer);

  let result: TutorResult;
  let llmRaw: unknown = null;
  let fallbackReason: string | null = null;

  if (!deepseekKey || !pack) {
    fallbackReason = !deepseekKey ? "missing_api_key" : "grounding_unavailable";
    result = { ...deterministic, source: "deterministic_fallback" };
  } else {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    try {
      const upstream = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: buildSystemPrompt(pack) },
            {
              role: "user",
              content: `CAS : ${caseId}\n\nRÉPONSE DE L'INTERNE :\n${answer}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0,
        }),
        signal: controller.signal,
      });

      if (!upstream.ok) {
        fallbackReason = `upstream_${upstream.status}`;
        result = { ...deterministic, source: "deterministic_fallback" };
      } else {
        const completion = await upstream.json();
        const content = completion?.choices?.[0]?.message?.content;
        llmRaw = content ?? null;

        let parsed: unknown;
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = null;
        }

        const validation: ReturnType<typeof validateLlmPayload> =
          parsed === null
            ? { ok: false, reason: "not_an_object" }
            : validateLlmPayload(parsed, new Set(pack.allowedIds));

        if (!validation.ok) {
          // Includes the citation whitelist check: a fabricated reference
          // rejects the whole grading rather than reaching the learner.
          fallbackReason = validation.detail
            ? `${validation.reason}:${validation.detail}`
            : validation.reason;
          result = { ...deterministic, source: "deterministic_fallback" };
        } else {
          result = mergeTutorResults(validation, netCriticalError);
        }
      }
    } catch (error) {
      fallbackReason = error instanceof Error && error.name === "AbortError" ? "timeout" : "network";
      result = { ...deterministic, source: "deterministic_fallback" };
    } finally {
      clearTimeout(timer);
    }
  }

  // Log every grading. Disagreement or out-of-scope stays in the review queue.
  const { error: logError } = await admin.from("tutor_evaluations").insert({
    user_id: user.id,
    site_id: siteId,
    case_id: caseId,
    phase,
    answer_text: answer,
    llm_result: llmRaw,
    deterministic_result: deterministic,
    final_result: result,
    source: result.source ?? "deterministic_fallback",
    fallback_reason: fallbackReason,
    disagreement: result.disagreement ?? false,
    out_of_scope: result.outOfScope ?? false,
    citations: [...new Set((result.axes ?? []).flatMap((a) => a.citations ?? []))],
    status: "needs_review",
  });
  // A logging failure must not deny the learner their grade.
  if (logError) console.error("tutor_evaluations insert failed", logError.message);

  return json({ result });
});
