"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateBlockPercent,
  emptyProgress,
  progressKey,
  readProgress,
  type ProgressStore,
} from "../lib/academy/progress";
import type { SiteModule } from "../lib/academy/types";

const levelLabels: Record<string, string> = {
  foundations: "Fondations",
  clinical_competence: "Compétence clinique",
  expert_rcp: "RCP expert",
};

export function PathwayMap({ site }: { site: SiteModule }) {
  const [store, setStore] = useState<ProgressStore>({});

  useEffect(() => {
    const refresh = () => setStore(readProgress());
    refresh();
    window.addEventListener("oncort:progress", refresh);
    return () => window.removeEventListener("oncort:progress", refresh);
  }, []);

  const blockProgress = useMemo(
    () =>
      site.blocks.map((block) => {
        const document = site.documents[block.id];
        const progress =
          store[progressKey(site.id, block.id)] ?? emptyProgress(site.id, block.id);
        return calculateBlockPercent(progress, document.lessons.length);
      }),
    [site, store],
  );
  const completed = blockProgress.filter((value) => value === 100).length;
  const resumeIndex = Math.min(
    Math.max(0, blockProgress.findIndex((value) => value < 100)),
    site.blocks.length - 1,
  );
  const totalLessons = Object.values(site.documents).reduce(
    (sum, document) => sum + document.lessons.length,
    0,
  );
  const doneLessons = Object.values(store)
    .filter((progress) => progress.siteId === site.id)
    .reduce((sum, progress) => sum + progress.completedLessonIds.length, 0);

  return (
    <div className="pathwayShell">
      <section className="pathwayHero">
        <div>
          <p className="eyebrow">Parcours guidé · localisation 01</p>
          <h1>{site.title}</h1>
          <p>{site.description}</p>
          <div className="pathwayStats">
            <span><strong>{completed}/15</strong> blocs maîtrisés</span>
            <span><strong>{doneLessons}/{totalLessons}</strong> leçons validées</span>
            <span><strong>3</strong> niveaux de profondeur</span>
          </div>
        </div>
        <div className="resumePanel">
          <span>Prochaine étape recommandée</span>
          <strong>{site.blocks[resumeIndex].title}</strong>
          <div className="miniProgress"><i style={{ width: `${blockProgress[resumeIndex]}%` }} /></div>
          <Link className="button buttonPrimary" href={`/parcours/${site.id}/${site.blocks[resumeIndex].id}`}>
            {blockProgress[resumeIndex] ? "Reprendre" : "Commencer"} <span>→</span>
          </Link>
        </div>
      </section>

      <section className="pathwayContent">
        <aside className="levelRail">
          <p className="eyebrow">Progression</p>
          {Object.entries(levelLabels).map(([id, label]) => (
            <a href={`#${id}`} key={id}><span className={`levelDot ${id}`} />{label}</a>
          ))}
          <div className="railNote">
            <strong>Tu pars de zéro ?</strong>
            <p>Suis l’ordre. Chaque bloc réemploie le vocabulaire et les mécanismes précédents.</p>
          </div>
        </aside>

        <div className="pathwayTimeline">
          {site.blocks.map((block, index) => {
            const overview = site.overviews[block.id];
            const document = site.documents[block.id];
            const percent = blockProgress[index];
            const beginsLevel = index === 0 || site.blocks[index - 1].level !== block.level;
            return (
              <div key={block.id} id={beginsLevel ? block.level : undefined}>
                {beginsLevel && (
                  <div className="levelDivider">
                    <span>{levelLabels[block.level] ?? block.level}</span>
                    <p>
                      {block.level === "foundations"
                        ? "Comprendre le langage et les mécanismes indispensables."
                        : block.level === "clinical_competence"
                          ? "Prendre en charge les situations courantes avec une logique explicite."
                          : "Arbitrer les cas complexes, les incertitudes et les stratégies multimodales."}
                    </p>
                  </div>
                )}
                <article className={`pathwayBlock level-${block.level}`}>
                  <div className="blockNumber">
                    <span>{percent === 100 ? "✓" : String(block.number).padStart(2, "0")}</span>
                    <i />
                  </div>
                  <div className="blockCard">
                    <div className="blockCardMeta">
                      <span>{document.lessons.length} leçons · {document.estimatedMinutes} min</span>
                      <b>{percent}%</b>
                    </div>
                    <h2>{block.title}</h2>
                    <p>{overview.summary}</p>
                    <div className="blockOutcomes">
                      {overview.outcomes.slice(0, 3).map((outcome) => <span key={outcome}>{outcome}</span>)}
                    </div>
                    <div className="blockCardFooter">
                      <span>{document.caseStudy ? "Cas intégrateur inclus" : "Synthèse de fondations"}</span>
                      <Link href={`/parcours/${site.id}/${block.id}`}>
                        {percent ? "Reprendre" : "Ouvrir"} <span>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
