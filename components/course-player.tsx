"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  calculateBlockPercent,
  emptyProgress,
  progressKey,
  readProgress,
  syncProgress,
  writeProgress,
} from "../lib/academy/progress";
import type {
  BlockOverview,
  CourseBlock,
  LessonVisual as LessonVisualData,
  LearningDocument,
  Source,
} from "../lib/academy/types";

type PlayerStage = "orientation" | "lesson" | "case" | "complete";

const levelLabels: Record<string, string> = {
  foundations: "Fondations",
  clinical_competence: "Compétence clinique",
  expert_rcp: "RCP expert",
};

export function CoursePlayer({
  site,
  block,
  overview,
  document,
  sources,
}: {
  site: {
    id: string;
    title: string;
    shortTitle: string;
    status: string;
    blocks: CourseBlock[];
  };
  block: CourseBlock;
  overview: BlockOverview;
  document: LearningDocument;
  sources: Record<string, Source>;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState<PlayerStage>("orientation");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [caseOption, setCaseOption] = useState<number | null>(null);
  const [openCards, setOpenCards] = useState<number[]>([]);
  const [syncState, setSyncState] = useState<"local" | "syncing" | "synced" | "error">("local");
  const [progress, setProgress] = useState(() => emptyProgress(site.id, block.id));

  useEffect(() => {
    const stored = readProgress()[progressKey(site.id, block.id)];
    if (stored) setProgress(stored);
    setHydrated(true);
  }, [site.id, block.id]);

  const lesson = document.lessons[lessonIndex];
  const checkpointPassed = selectedOption === lesson?.checkpoint.answerIndex;
  const casePassed = caseOption === document.caseStudy?.checkpoint.answerIndex;
  const percent = calculateBlockPercent(progress, document.lessons.length);
  const activeBlockIndex = site.blocks.findIndex((item) => item.id === block.id);
  const nextBlock = site.blocks[activeBlockIndex + 1];
  const uniqueSourceIds = useMemo(
    () => [...new Set([...block.sourceIds, ...lesson?.sources ?? []])],
    [block.sourceIds, lesson?.sources],
  );

  const persist = async (nextProgress: typeof progress) => {
    setProgress(nextProgress);
    writeProgress(nextProgress);
    setSyncState("syncing");
    const result = await syncProgress(nextProgress);
    setSyncState(result);
  };

  const validateLesson = () => {
    if (!checkpointPassed) return;
    const completedLessonIds = Array.from(
      new Set([...progress.completedLessonIds, lesson.id]),
    );
    void persist({
      ...progress,
      completedLessonIds,
      checkpointAttempts: {
        ...progress.checkpointAttempts,
        [lesson.id]: (progress.checkpointAttempts[lesson.id] ?? 0) + 1,
      },
      updatedAt: new Date().toISOString(),
    });
    setSelectedOption(null);
    setOpenCards([]);
    if (lessonIndex < document.lessons.length - 1) {
      setLessonIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (document.caseStudy) {
      setStage("case");
    } else {
      setStage("complete");
    }
  };

  const validateCase = () => {
    if (!casePassed) return;
    void persist({ ...progress, caseCompleted: true, updatedAt: new Date().toISOString() });
    setStage("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectLesson = (index: number) => {
    setLessonIndex(index);
    setSelectedOption(null);
    setOpenCards([]);
    setStage("lesson");
  };

  if (!hydrated) return <div className="playerLoading">Préparation du parcours…</div>;

  return (
    <main className="coursePlayer">
      <header className="playerHeader">
        <Link className="academyBrand light" href="/">
          <span className="brandGlyph">O</span>
          <span><strong>OncoRT</strong><small>Academy</small></span>
        </Link>
        <div className="playerBreadcrumb">
          <Link href={`/parcours/${site.id}`}>{site.shortTitle}</Link>
          <span>/</span>
          <b>Bloc {block.number}</b>
        </div>
        <div className="playerHeaderMeta">
          <Link href="/connexion">{syncState === "synced" ? "Synchronisé" : "Progression locale"}</Link>
        </div>
      </header>

      <div className="playerLayout">
        <aside className="playerSidebar">
          <Link className="backLink" href={`/parcours/${site.id}`}>← Carte du cursus</Link>
          <p className="eyebrow">Bloc {block.number} sur {site.blocks.length}</p>
          <h1>{document.title}</h1>
          <div className="playerProgress">
            <div><span>Maîtrise du bloc</span><strong>{percent}%</strong></div>
            <div className="progressBar"><i style={{ width: `${percent}%` }} /></div>
          </div>
          <button
            className={stage === "orientation" ? "sidebarStage active" : "sidebarStage"}
            onClick={() => setStage("orientation")}
          >
            <span>00</span><b>Orientation</b><small>Pourquoi ce bloc</small>
          </button>
          <nav className="lessonList" aria-label="Leçons du bloc">
            {document.lessons.map((item, index) => {
              const done = progress.completedLessonIds.includes(item.id);
              return (
                <button
                  className={stage === "lesson" && lessonIndex === index ? "active" : done ? "done" : ""}
                  key={item.id}
                  onClick={() => selectLesson(index)}
                >
                  <span>{done ? "✓" : String(item.number).padStart(2, "0")}</span>
                  <b>{item.title}</b>
                  <small>{item.durationMinutes} min</small>
                </button>
              );
            })}
          </nav>
          {document.caseStudy && (
            <button
              className={stage === "case" ? "sidebarStage active case" : "sidebarStage case"}
              onClick={() => setStage("case")}
            >
              <span>{progress.caseCompleted ? "✓" : "C"}</span><b>Cas intégrateur</b><small>Transférer</small>
            </button>
          )}
          <div className="sidebarFooter">
            <span>{levelLabels[block.level] ?? block.level}</span>
            <small>{syncState === "syncing" ? "Synchronisation…" : syncState === "synced" ? "Compte synchronisé" : "Sauvegardé sur cet appareil"}</small>
          </div>
        </aside>

        <section className="playerWorkspace">
          {stage === "orientation" && (
            <Orientation
              block={block}
              overview={overview}
              document={document}
              onStart={() => selectLesson(Math.min(progress.completedLessonIds.length, document.lessons.length - 1))}
            />
          )}

          {stage === "lesson" && lesson && (
            <article className="lessonExperience">
              <div className="lessonHero">
                <div>
                  <p className="eyebrow">Leçon {lesson.number} sur {document.lessons.length} · {lesson.durationMinutes} min</p>
                  <h2>{lesson.title}</h2>
                </div>
                <span className="lessonToken">{String(block.number).padStart(2, "0")}.{String(lesson.number).padStart(2, "0")}</span>
              </div>

              <section className="lessonObjectives">
                <span>À la fin, tu sauras</span>
                <ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
              </section>

              {lesson.keyTakeaways && (
                <section className="lessonEssentials">
                  <div><span>Lecture 30 secondes</span><strong>L’essentiel avant d’approfondir</strong></div>
                  <ol>{lesson.keyTakeaways.map((item) => <li key={item}>{item}</li>)}</ol>
                </section>
              )}

              {lesson.visual && (lesson.visual.placement ?? "after_takeaways") === "after_takeaways" && (
                <LessonVisual visual={lesson.visual} lessonTitle={lesson.title} />
              )}

              <div className="lessonBody">
                {lesson.sections.map((section, index) => (
                  <Fragment key={section.title}>
                    <section className="lessonSection">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div><h3>{section.title}</h3><p>{section.body}</p></div>
                    </section>
                    {lesson.visual
                      && lesson.visual.placement === "after_section"
                      && lesson.visual.afterSection === index + 1
                      && <LessonVisual visual={lesson.visual} lessonTitle={lesson.title} />}
                  </Fragment>
                ))}
              </div>

              {lesson.visual && lesson.visual.placement === "after_sections" && (
                <LessonVisual visual={lesson.visual} lessonTitle={lesson.title} />
              )}

              {lesson.clinicalLens && (
                <aside className="clinicalLens">
                  <span>Application clinique</span>
                  <h3>{lesson.clinicalLens.title}</h3>
                  <p>{lesson.clinicalLens.body}</p>
                </aside>
              )}

              {lesson.deepDive && (
                <section className="deepDiveZone">
                  <div><p className="eyebrow">Pour aller plus loin</p><h3>Nuances à ouvrir pendant l’audit</h3></div>
                  {lesson.deepDive.map((item) => (
                    <details key={item.title}>
                      <summary>{item.title}<span>+</span></summary>
                      <p>{item.body}</p>
                    </details>
                  ))}
                </section>
              )}

              <section className="causalChain">
                <p className="eyebrow">La chaîne à comprendre</p>
                <div>{lesson.causalChain.map((item, index) => (
                  <span key={item}><b>{item}</b>{index < lesson.causalChain.length - 1 && <i>→</i>}</span>
                ))}</div>
              </section>

              <aside className="trapCard"><span>Piège fréquent</span><p>{lesson.commonTrap}</p></aside>

              {lesson.visual && lesson.visual.placement === "before_checkpoint" && (
                <LessonVisual visual={lesson.visual} lessonTitle={lesson.title} />
              )}

              <section className="checkpointCard">
                <div className="checkpointHeader"><span>Checkpoint</span><small>Une réponse est nécessaire pour continuer</small></div>
                <h3>{lesson.checkpoint.prompt}</h3>
                <div className="answerOptions">
                  {lesson.checkpoint.options.map((option, index) => (
                    <button
                      key={option}
                      className={selectedOption === index ? index === lesson.checkpoint.answerIndex ? "selected correct" : "selected incorrect" : ""}
                      onClick={() => setSelectedOption(index)}
                    ><span>{String.fromCharCode(65 + index)}</span><b>{option}</b></button>
                  ))}
                </div>
                {selectedOption !== null && (
                  <div className={checkpointPassed ? "checkpointFeedback correct" : "checkpointFeedback"}>
                    <strong>{checkpointPassed ? "Concept compris" : "Pas encore — relis le mécanisme"}</strong>
                    <p>{lesson.checkpoint.explanation}</p>
                  </div>
                )}
              </section>

              <section className="flashcardsZone">
                <div><p className="eyebrow">Rappel actif</p><h3>Retourne les trois cartes</h3></div>
                <div className="flashcardGrid">
                  {lesson.flashcards.map((card, index) => {
                    const open = openCards.includes(index);
                    return (
                      <button
                        className={open ? "flashcard open" : "flashcard"}
                        key={card.front}
                        onClick={() => setOpenCards((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])}
                        aria-pressed={open}
                      ><span>{open ? "Réponse" : "Question"}</span><strong>{open ? card.back : card.front}</strong><small>{open ? "Retourner" : "Voir la réponse"} ↻</small></button>
                    );
                  })}
                </div>
              </section>

              <SourceList sourceIds={uniqueSourceIds} sources={sources} />

              <div className="lessonActions">
                <button className="button buttonGhost" disabled={lessonIndex === 0} onClick={() => selectLesson(lessonIndex - 1)}>← Leçon précédente</button>
                <button className="button buttonPrimary" disabled={!checkpointPassed} onClick={validateLesson}>
                  {lessonIndex === document.lessons.length - 1 ? document.caseStudy ? "Passer au cas" : "Terminer le bloc" : "Valider et continuer"} <span>→</span>
                </button>
              </div>
            </article>
          )}

          {stage === "case" && document.caseStudy && (
            <CaseStudy
              item={document.caseStudy}
              selected={caseOption}
              setSelected={setCaseOption}
              passed={casePassed}
              onValidate={validateCase}
              sources={sources}
            />
          )}

          {stage === "complete" && (
            <section className="blockComplete">
              <span className="completeOrb">✓</span>
              <p className="eyebrow">Bloc {block.number} terminé</p>
              <h2>Une nouvelle couche de raisonnement est acquise.</h2>
              <p>{document.learningPromise}</p>
              <div className="completionStats">
                <span><strong>{document.lessons.length}/{document.lessons.length}</strong> leçons</span>
                <span><strong>100%</strong> checkpoints</span>
                <span><strong>{document.caseStudy ? "1/1" : "—"}</strong> cas</span>
              </div>
              <p className="reviewWarning">Maîtrise pédagogique provisoire. Le contenu clinique reste « à valider » jusqu’à une revue nominative.</p>
              <div className="completionActions">
                <button className="button buttonGhost" onClick={() => selectLesson(0)}>Revoir le bloc</button>
                {nextBlock ? (
                  <Link className="button buttonPrimary" href={`/parcours/${site.id}/${nextBlock.id}`}>Bloc suivant <span>→</span></Link>
                ) : (
                  <Link className="button buttonPrimary" href={`/cas/${site.id}`}>Passer au mode RCP <span>→</span></Link>
                )}
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

function LessonVisual({ visual, lessonTitle }: { visual: LessonVisualData; lessonTitle: string }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const visualNodes = (
    <div className="visualCanvas">
      {visual.items.map((item, index) => (
        <article className="visualNode" key={`${item.label}-${index}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item.label}</strong>
          <small>{item.detail}</small>
          {index < visual.items.length - 1 && <i aria-hidden="true">→</i>}
        </article>
      ))}
    </div>
  );

  return (
    <figure className={`lessonVisual lessonVisual-${visual.kind}`} aria-label={visual.altText}>
      <div className="visualHeading">
        <span>{visual.formatLabel ?? "Figure pédagogique"}</span>
        {visual.title !== lessonTitle && <h3>{visual.title}</h3>}
      </div>
      {visual.imageSrc ? (
        <>
          <img
            className="lessonVisualImage"
            src={`${basePath}${visual.imageSrc}`}
            alt={visual.altText}
            width={1376}
            height={768}
            loading="lazy"
            decoding="async"
          />
          <details className="visualTextAlternative">
            <summary>Lire le schéma en version textuelle</summary>
            {visualNodes}
          </details>
        </>
      ) : visualNodes}
      <figcaption>{visual.caption}</figcaption>
    </figure>
  );
}

function Orientation({ block, overview, document, onStart }: {
  block: CourseBlock;
  overview: BlockOverview;
  document: LearningDocument;
  onStart: () => void;
}) {
  return (
    <section className="orientationView">
      <div className="orientationHero">
        <div><p className="eyebrow">Orientation · Bloc {block.number}</p><h2>{overview.title}</h2><p>{overview.summary}</p></div>
        <div className="orientationDuration"><strong>{document.estimatedMinutes}</strong><span>minutes estimées</span><small>{document.lessons.length} micro-leçons</small></div>
      </div>
      <section className="promiseCard"><span>Promesse d’apprentissage</span><p>{document.learningPromise}</p></section>
      <div className="pillarDeck">
        {overview.pillars.map((pillar, index) => <article key={pillar.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{pillar.title}</h3><p>{pillar.body}</p></article>)}
      </div>
      <div className="orientationColumns">
        <section><p className="eyebrow">Ce que tu vas savoir faire</p><ul>{overview.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul></section>
        <aside className="trapCard"><span>Le piège directeur</span><p>{overview.commonTrap}</p></aside>
      </div>
      <div className="orientationStart"><div><span>{levelLabels[block.level] ?? block.level}</span><small>{block.assessment}</small></div><button className="button buttonPrimary" onClick={onStart}>Commencer la première leçon <span>→</span></button></div>
    </section>
  );
}

function CaseStudy({ item, selected, setSelected, passed, onValidate, sources }: {
  item: NonNullable<LearningDocument["caseStudy"]>;
  selected: number | null;
  setSelected: (value: number) => void;
  passed: boolean;
  onValidate: () => void;
  sources: Record<string, Source>;
}) {
  return (
    <section className="caseExperience">
      <div className="caseHero"><div><p className="eyebrow">Cas intégrateur · données synthétiques</p><h2>{item.title}</h2></div><span>RCP</span></div>
      <article className="vignetteCard"><span>Situation clinique</span><p>{item.vignette}</p></article>
      <section className="decisionGrid"><div><p className="eyebrow">Points de décision</p><ol>{item.decisionPoints.map((point) => <li key={point}>{point}</li>)}</ol></div><aside><p className="eyebrow">Erreurs critiques à éviter</p><ul>{item.criticalErrors.map((error) => <li key={error}>{error}</li>)}</ul></aside></section>
      <section className="checkpointCard caseCheckpoint"><div className="checkpointHeader"><span>Synthèse de RCP</span><small>Choisis le raisonnement le plus robuste</small></div><h3>{item.checkpoint.prompt}</h3><div className="answerOptions">{item.checkpoint.options.map((option, index) => <button key={option} className={selected === index ? index === item.checkpoint.answerIndex ? "selected correct" : "selected incorrect" : ""} onClick={() => setSelected(index)}><span>{String.fromCharCode(65 + index)}</span><b>{option}</b></button>)}</div>{selected !== null && <div className={passed ? "checkpointFeedback correct" : "checkpointFeedback"}><strong>{passed ? "Raisonnement cohérent" : "Décision insuffisamment robuste"}</strong><p>{item.checkpoint.explanation}</p></div>}</section>
      {passed && <section className="reasoningReveal"><p className="eyebrow">Raisonnement attendu</p><ol>{item.expectedReasoning.map((reason) => <li key={reason}>{reason}</li>)}</ol></section>}
      <SourceList sourceIds={item.sources} sources={sources} />
      <div className="lessonActions"><span /><button className="button buttonPrimary" disabled={!passed} onClick={onValidate}>Valider le bloc <span>→</span></button></div>
    </section>
  );
}

function SourceList({ sourceIds, sources }: { sourceIds: string[]; sources: Record<string, Source> }) {
  const items = sourceIds.map((id) => sources[id]).filter(Boolean);
  return (
    <details className="sourceDrawer"><summary><span>Sources et traçabilité</span><b>{items.length} références</b></summary><div>{items.map((source) => <a href={source.fullTextUrl ?? source.url} target="_blank" rel="noreferrer" key={source.id}><span>{source.publisher} · {source.year}</span><strong>{source.title}</strong><small>{source.jurisdiction ?? "International"} ↗</small></a>)}</div></details>
  );
}
