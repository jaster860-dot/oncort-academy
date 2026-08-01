"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TutorResult } from "../lib/tutor";
import { evaluateCaseAnswer, evaluateRetest } from "../lib/tutor";

type CaseItem = {
  title: string;
  vignette: string;
  tasks: string[];
  availableData: Record<string, string>;
};

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
  const capsule = useMemo(() => result ? capsuleCopy[result.remediationConcept] : null, [result]);
  const steps = ["case", "analysis", "capsule", "retest", "complete"] as const;
  const currentIndex = steps.indexOf(step);

  const submit = () => {
    if (answer.trim().length < 30) return;
    setResult(evaluateCaseAnswer(answer));
    setStep("analysis");
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
          {step === "case" && <>
            <div className="caseHero"><div><p className="eyebrow">Cas 01 · Niveau fondamental</p><h2>{caseItem.title}</h2></div><span>RCP</span></div>
            <article className="vignetteCard"><span>Situation clinique</span><p>{caseItem.vignette}</p></article>
            <div className="rcpTaskGrid"><section><p className="eyebrow">Ta mission</p><ul>{caseItem.tasks.map((task) => <li key={task}>{task}</li>)}</ul></section><section><p className="eyebrow">Dossier disponible</p><dl>{Object.entries(caseItem.availableData).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section></div>
            <label className="reasoningBox"><span>Construis ton raisonnement</span><textarea rows={9} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Commence par le risque, précise les données manquantes, puis compare les parcours thérapeutiques et leurs incertitudes…"/><small>{answer.length} caractères · minimum 30</small></label>
            <div className="lessonActions"><span>Ta réponse reste sur cet appareil dans cette version.</span><button className="button buttonPrimary" disabled={answer.trim().length < 30} onClick={submit}>Analyser mon raisonnement <span>→</span></button></div>
          </>}

          {step === "analysis" && result && <>
            <div className="analysisHeader"><div><p className="eyebrow">Analyse structurée</p><h2>{result.verdict === "correct" ? "Raisonnement solide" : result.verdict === "unsafe" ? "Automatisme à corriger" : "Fondation à consolider"}</h2></div><div className={`scoreOrb ${result.verdict}`}><strong>{result.score}</strong><span>/10</span></div></div>
            {result.criticalError && <div className="criticalAlert"><strong>Erreur critique détectée</strong><p>Un PSMA-PET négatif ne suffit jamais, isolément, à exclure le risque microscopique ou une composante thérapeutique.</p></div>}
            <div className="axisGridModern">{result.axes.map((axis) => <article key={axis.id}><div><span>{axis.label}</span><strong>{axis.score}/2</strong></div><p>{axis.rationale}</p><i><b style={{ width: `${axis.score * 50}%` }} /></i></article>)}</div>
            <section className="tutorVerdict"><span>N</span><div><p className="eyebrow">Verdict du tuteur</p><h3>Lacune prioritaire : {result.primaryGap.replaceAll("_", " ")}</h3><p>Une seule capsule est proposée. Elle sera immédiatement testée dans une formulation différente.</p></div></section>
            <div className="lessonActions"><button className="button buttonGhost" onClick={() => setStep("case")}>Revoir ma réponse</button><button className="button buttonPrimary" onClick={() => setStep("capsule")}>Ouvrir la capsule ciblée <span>→</span></button></div>
          </>}

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
