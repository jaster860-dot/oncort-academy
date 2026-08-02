"use client";

import { createBrowserSupabaseClient } from "../supabase/browser";
import { evaluateCaseAnswer } from "./deterministic";
import type { TutorResult } from "./schema";

const TIMEOUT_MS = 15_000;

export type GradeRequest = {
  siteId: string;
  caseId: string;
  answer: string;
};

/**
 * Grades a case answer through the hosted tutor, falling back to the
 * deterministic engine whenever the hosted path is unavailable.
 *
 * The fallback is not an error path: a learner always receives a grade. Callers
 * read `result.source` to tell which engine answered, and may surface that.
 */
export async function gradeCaseAnswer({
  siteId,
  caseId,
  answer,
}: GradeRequest): Promise<TutorResult> {
  const fallback = (): TutorResult => ({
    ...evaluateCaseAnswer(answer),
    source: "deterministic_fallback",
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = createBrowserSupabaseClient();
  // Guest mode, or a deployment without Supabase configured: stay local.
  if (!supabaseUrl || !supabase) return fallback();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  // The hosted tutor requires a signed-in learner; guests keep the local engine.
  if (!session) return fallback();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/tutor-grade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ siteId, caseId, phase: "case", answer }),
      signal: controller.signal,
    });

    if (!response.ok) return fallback();

    const payload = (await response.json()) as { result?: TutorResult };
    // The function validates before returning; treat a missing body as a failure
    // rather than trusting a partially shaped response.
    if (!payload.result || !Array.isArray(payload.result.axes)) return fallback();

    return payload.result;
  } catch {
    // Timeout, offline, DNS failure, CORS — all resolve to the local engine.
    return fallback();
  } finally {
    clearTimeout(timer);
  }
}
