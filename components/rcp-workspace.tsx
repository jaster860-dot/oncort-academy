"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TutorResult } from "../lib/tutor";
import { evaluateRetest, gradeCaseAnswer } from "../lib/tutor";

type CaseItem = {
  title: string;
  vignette: string;
  tasks: string[];
  availableData: Record<string, string>;
};

/**
 * Content keys are English by schema; the interface is French. Mapping happens
 * here rather than in content so `CONTENT_SCHEMA.md` stays untouched.
 */
const dossierLabels: Record<string, string> = {
  clinical: "Clinique",
  biology: "Biologie",
  imaging: "Imagerie",
  pathology: "Anatomopathologie",
  multidisciplinary: "Pluridisciplinaire",
};

/** Gap identifiers are English by schema; they are read aloud and shown to a French learner. */
const gapLabels: Record<TutorResult["primaryGap"], string> = {
  risk_gap: "stratification du risque",
  rcp_gap: "raisonnement pluridisciplinaire",
  imaging_gap: "interprétation de l’imagerie",
  medical_oncology_gap: "oncologie médicale",
  patient_gap: "contexte du patient",
};

/** The four moves of a tumour-board argument, offered as headings only. */
const structureSteps = ["Risque", "Données manquantes", "Options", "Décision"] as const;

const MIN_ANSWER = 30;

const capsuleCopy: Record<TutorResult["remediationConcept"], { title: string; body: string }> = {
  psma_pet_limits: {
    title: "Voir mieux ne signifie pas tout exclure",
    body: "Un PSMA-PET négatif ne montre pas de maladie macroscopique détectable. Il n’exclut pas une maladie microscopique : le risque prétest reste construit par le PSA, le stade T, l’ISUP et le contexte clinique.",
  },
  adt_rt_integration: {
    title: "ADT et radiothérapie forment une stratégie oncologique",
    body: "La suppression androgénique ne sert pas seulement à réduire la prostate. Elle agit sur la biologie tumorale et s’intègre, selon le risque, au traitement local avec une durée et des toxicités individualisées.",
  },
  multimodal_curative_options: {
    title: "Comparer des parcours complets",
    body: "La prostatectomie peut ouvrir un parcours multimodal. La radiothérapie définitive est souvent intégrée à un traitement hormonal. La décision compare les parcours, leurs bénéfices et leurs conséquences fonctionnelles.",
  },
  risk_and_patient_context: {
    title: "Le risque tumoral ne choisit pas seul",
    body: "Stade, ISUP et PSA structurent le risque. Espérance de vie, comorbidités, fonctions urinaire et sexuelle et préférences déterminent ensuite la stratégie pertinente.",
  },
};

export function RcpWorkspace({ caseItem, retestPrompt }: { caseItem: CaseItem; retestPrompt: string }) {
  const [step, setStep] = useState<"case" | "analysis" | "capsule" | "retest" | "complete">("case");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<TutorResult | null>(null);
  const [retestAnswer, setRetestAnswer] = useState("");
  const [retestResult, setRetestResult] = useState<ReturnType<typeof evaluateRetest> | null>(null);
  const [grading, setGrading] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const focusPending = useRef(false);

  /** Appends a section heading; focus returns in the effect below. */
  const insertSection = (step: string) => {
    setAnswer((current) => `${current.trimEnd()}${current.trim() ? "\n\n" : ""}${step} : `);
    focusPending.current = true;
  };

  // Runs after commit rather than on an animation frame: requestAnimationFrame
  // never fires while the tab is not compositing, which silently left the caret
  // outside the field.
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    const field = answerRef.current;
    if (!field) return;
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }, [answer]);
  const capsule = useMemo(() => result ? capsuleCopy[result.remediationConcept] : null, [result]);
  const steps = ["case", "analysis", "capsule", "retest", "complete"] as const;
  const currentIndex = steps.indexOf(step);

  const submit = async () => {
    if (answer.trim().length < MIN_ANSWER || grading) return;
    setGrading(true);
    try {
      // Never throws: the hosted tutor falls back to the local engine, so the
      // learner always reaches the analysis step.
      setResult(await gradeCaseAnswer({ siteId: "prostate", caseId: caseItem.title, answer }));
      setStep("analysis");
    } finally {
      setGrading(false);
    }
  };
  const submitRetest = () => {
    const next = evaluateRetest(retestAnswer);
    setRetestResult(next);
    if (next.mastered) setStep("complete");
  };

  return (
    <main className="rcpPage">
      <header className="playerHeader">
        <Link className="academyBrand light" href="/"><span className="brandGlyph">O</span><span><strong>OncoRT</strong><small>Academy</small></span></Link>
        <div className="playerBreadcrumb"><Link href="/parcours/prostate">Prostate</Link><span>/</span><b>Mode RCP</b></div>
        <div className="playerHeaderMeta"><span className="reviewStatus dark">Données synthétiques</span></div>
      </header>
      <div className="rcpLayout">
        <aside className="rcpRail">
          <p className="eyebrow">Boucle adaptative</p>
          <h1>Raisonner sous incertitude</h1>
          <p>Le tuteur recherche la structure du raisonnement, pas seulement la conclusion.</p>
          <ol>{[
            ["Cas clinique", "Construire"], ["Analyse", "Diagnostiquer la lacune"], ["Capsule", "Réparer"], ["Re-test", "Transférer"], ["Maîtrise", "Consolider"],
          ].map(([label, detail], index) => <li className={index === currentIndex ? "active" : index < currentIndex ? "done" : ""} key={label}><span>{index < currentIndex ? "✓" : String(index + 1).padStart(2, "0")}</span><div><b>{label}</b><small>{detail}</small></div></li>)}</ol>
          <Link className="backLink" href="/parcours/prostate">← Retour au cursus</Link>
        </aside>
        <section className="rcpWorkspace">
          {/* Lives outside the step blocks so it survives the transition and can
              announce the outcome, not only that grading started. */}
          <p className="srStatus" role="status" aria-live="polite">
            {grading
              ? "Analyse de ton raisonnement en cours."
              : step === "analysis" && result
                ? `Analyse terminée. Score ${result.score} sur 10. Lacune prioritaire : ${gapLabels[result.primaryGap]}.`
                : ""}
          </p>
          {step === "case" && <>
            <div className="caseHero"><div><p className="eyebrow">Cas 01 · Niveau fondamental</p><h2>{caseItem.title}</h2></div><span>RCP</span></div>
            <article className="vignetteCard"><span>Situation clinique</span><p>{caseItem.vignette}</p></article>
            <section className="dossierPanel"><p className="eyebrow">Dossier disponible</p><dl>{Object.entries(caseItem.availableData).map(([key, value]) => <div key={key}><dt>{dossierLabels[key] ?? key}</dt><dd>{value}</dd></div>)}</dl></section>
            <div className="reasoningLayout">
              <div className="reasoningBox">
                <label htmlFor="rcpAnswer">Construis ton raisonnement</label>
                {/* Structure only, never content: hinting substance would turn the exercise into keyword matching. */}
                <div className="structureChips">
                  <span>Amorcer une section</span>
                  {structureSteps.map((step) => (
                    <button type="button" key={step} onClick={() => insertSection(step)} disabled={answer.includes(`${step} :`)}>{step}</button>
                  ))}
                </div>
                <textarea id="rcpAnswer" ref={answerRef} rows={14} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Pars du risque, dis ce qui manque au dossier, puis compare les parcours et ce qui reste incertain…"/>
                <small>{answer.trim().length < MIN_ANSWER ? "Développe ton raisonnement : le tuteur évalue la structure, pas la longueur." : `${answer.length} caractères`}</small>
              </div>
              <aside className="reasoningGuide">
                <p className="eyebrow">Ce que le tuteur attend</p>
                <ul>{caseItem.tasks.map((task) => <li key={task}>{task}</li>)}</ul>
              </aside>
            </div>
            <div className="lessonActions" aria-busy={grading}>
              <span>Connecté, ta réponse est analysée par le tuteur et conservée pour relecture pédagogique. En mode invité, elle ne quitte pas cet appareil.</span>
              {/* Grading is now a network round trip to the tutor, not a local
                  regex: a changed button label alone was too thin for the wait. */}
              <button className="button buttonPrimary" disabled={answer.trim().length < MIN_ANSWER || grading} onClick={submit}>
                {grading ? <><i className="btnSpinner" aria-hidden="true" />Analyse en cours…</> : <>Analyser mon raisonnement <span>→</span></>}
              </button>
            </div>
          </>}

          {step === "analysis" && result && <div className="stepEnter">
            {result.outOfScope && result.outOfScopeNote && <p className="tutorNotice"><strong>Hors du programme couvert.</strong> {result.outOfScopeNote}</p>}
            {result.source === "deterministic_fallback" && <p className="tutorNotice">Analyse produite par le moteur local : le tuteur ancré n’était pas joignable. Les critères restent les mêmes, les justifications sont plus sommaires.</p>}
            <div className="analysisHeader"><div><p className="eyebrow">Analyse structurée</p><h2>{result.verdict === "correct" ? "Raisonnement solide" : result.verdict === "unsafe" ? "Automatisme à corriger" : "Fondation à consolider"}</h2></div><div className={`scoreOrb ${result.verdict}`}><strong>{result.score}</strong><span>/10</span></div></div>
            {result.criticalError && <div className="criticalAlert"><strong>Erreur critique détectée</strong><p>Un PSMA-PET négatif ne suffit jamais, isolément, à exclure le risque microscopique ou une composante thérapeutique.</p></div>}
            <div className="axisGridModern">{result.axes.map((axis) => <article key={axis.id}><div><span>{axis.label}</span><strong>{axis.score}/2</strong></div><p>{axis.rationale}</p><i><b style={{ width: `${axis.score * 50}%` }} /></i></article>)}</div>
            <section className="tutorVerdict"><span>N</span><div><p className="eyebrow">Verdict du tuteur</p><h3>Lacune prioritaire : {gapLabels[result.primaryGap]}</h3><p>Une seule capsule est proposée. Elle sera immédiatement testée dans une formulation différente.</p></div></section>
            <div className="lessonActions"><button className="button buttonGhost" onClick={() => setStep("case")}>Revoir ma réponse</button><button className="button buttonPrimary" onClick={() => setStep("capsule")}>Ouvrir la capsule ciblée <span>→</span></button></div>
          </div>}

          {step === "capsule" && capsule && <>
            <div className="caseHero"><div><p className="eyebrow">Remédiation · 3 minutes</p><h2>{capsule.title}</h2></div><span>01</span></div>
            <article className="capsuleCard"><span>Le mécanisme à retenir</span><p>{capsule.body}</p></article>
            <div className="mechanismFlow"><article><span>Observation</span><strong>PSMA-PET N0M0</strong><p>Pas de maladie macroscopique détectée.</p></article><i>→</i><article><span>Interprétation</span><strong>Risque résiduel</strong><p>Le prétest clinique et biologique persiste.</p></article><i>→</i><article><span>Décision</span><strong>Parcours multimodal</strong><p>Options locales, systémiques et préférences.</p></article></div>
            <div className="lessonActions"><button className="button buttonGhost" onClick={() => setStep("analysis")}>Retour à l’analyse</button><button className="button buttonPrimary" onClick={() => setStep("retest")}>Passer au re-test <span>→</span></button></div>
          </>}

          {step === "retest" && <>
            <div className="caseHero"><div><p className="eyebrow">Question de transfert · 3/4 requis</p><h2>Applique le principe sans réciter la capsule.</h2></div><span>RT</span></div>
            <article className="retestPrompt"><span>Nouveau contexte</span><p>{retestPrompt}</p></article>
            <label className="reasoningBox"><span>Ta réponse</span><textarea rows={8} value={retestAnswer} onChange={(event) => { setRetestAnswer(event.target.value); setRetestResult(null); }} placeholder="Relie niveau de risque, limites de l’imagerie, traitement systémique et options locales…"/></label>
            {retestResult && !retestResult.mastered && <div className="criticalAlert soft"><strong>Transfert incomplet · {retestResult.score}/4</strong><p>Reformule en reliant les quatre dimensions du cas.</p></div>}
            <div className="lessonActions"><button className="button buttonGhost" onClick={() => setStep("capsule")}>Revoir la capsule</button><button className="button buttonPrimary" disabled={retestAnswer.trim().length < 20} onClick={submitRetest}>Valider le re-test <span>→</span></button></div>
          </>}

          {step === "complete" && retestResult && <section className="blockComplete"><span className="completeOrb">✓</span><p className="eyebrow">Boucle terminée</p><h2>Maîtrise provisoire acquise.</h2><p>Tu as transféré le raisonnement : l’imagerie affine le staging, mais n’efface ni le risque ni la logique multimodale.</p><div className="completionStats"><span><strong>{retestResult.score}/4</strong> transfert</span><span><strong>1</strong> lacune réparée</span><span><strong>Provisoire</strong> statut</span></div><p className="reviewWarning">Le contenu médical reste à valider par un clinicien identifié.</p><button className="button buttonPrimary" onClick={() => { setAnswer(""); setRetestAnswer(""); setResult(null); setRetestResult(null); setStep("case"); }}>Rejouer le cas</button></section>}
        </section>
      </div>
    </main>
  );
}
