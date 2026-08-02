"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { calculateBlockPercent, emptyProgress, progressKey, readProgress, type ProgressStore } from "../lib/academy/progress";
import { createBrowserSupabaseClient } from "../lib/supabase/browser";

type DashboardBlock = {
  id: string;
  number: number;
  title: string;
  level: string;
  lessonCount: number;
  estimatedMinutes: number;
};

type DashboardSite = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  blocks: DashboardBlock[];
};

const levelLabels: Record<string, string> = {
  foundations: "Fondations",
  clinical_competence: "Compétence clinique",
  expert_rcp: "RCP expert",
};

export function LearnerDashboard({
  primarySite,
  upcomingSites,
}: {
  primarySite: DashboardSite;
  upcomingSites: Array<{ id: string; title: string; phase: string }>;
}) {
  const [progress, setProgress] = useState<ProgressStore>({});
  const [identity, setIdentity] = useState<{ name: string; email?: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refresh = () => setProgress(readProgress());
    refresh();
    window.addEventListener("oncort:progress", refresh);
    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      void supabase.auth.getUser().then(({ data }) => {
        const email = data.user?.email;
        if (email) setIdentity({ name: email.split("@")[0], email });
      });
    }
    setHydrated(true);
    return () => window.removeEventListener("oncort:progress", refresh);
  }, []);

  const blocks = useMemo(
    () => primarySite.blocks.map((block) => {
      const record = progress[progressKey(primarySite.id, block.id)] ?? emptyProgress(primarySite.id, block.id);
      return { ...block, percent: calculateBlockPercent(record, block.lessonCount), completedLessons: record.completedLessonIds.length };
    }),
    [primarySite, progress],
  );
  const resumeIndex = Math.max(0, blocks.findIndex((block) => block.percent < 100));
  const resumeBlock = blocks[resumeIndex] ?? blocks[0];
  const totalLessons = blocks.reduce((sum, block) => sum + block.lessonCount, 0);
  const completedLessons = blocks.reduce((sum, block) => sum + block.completedLessons, 0);
  const overallPercent = Math.round((completedLessons / totalLessons) * 100);
  const completedBlocks = blocks.filter((block) => block.percent === 100).length;
  /**
   * A new learner should be invited, not scored. Counting what someone has not
   * done yet turns the first screen into an empty scoreboard.
   */
  const isFirstRun = completedLessons === 0;

  /**
   * Days of the current week that carry real activity.
   *
   * Progress records a single `updatedAt` per block, so a true consecutive-day
   * streak is not derivable and is not claimed. Untouched blocks carry the
   * epoch timestamp and are excluded.
   */
  const weekActivity = useMemo(() => {
    const active = new Set(
      Object.values(progress)
        .map((record) => record.updatedAt)
        .filter((stamp) => stamp && !stamp.startsWith("1970"))
        .map((stamp) => new Date(stamp).toDateString()),
    );
    const today = new Date();
    // Monday-first week, matching the L M M J V S D row.
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    return Array.from({ length: 7 }, (_, offset) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + offset);
      return {
        label: ["L", "M", "M", "J", "V", "S", "D"][offset],
        isToday: day.toDateString() === today.toDateString(),
        wasActive: active.has(day.toDateString()),
      };
    });
  }, [progress]);
  const activeDaysThisWeek = weekActivity.filter((day) => day.wasActive).length;
  const firstName = identity?.name ? identity.name.charAt(0).toUpperCase() + identity.name.slice(1) : "Docteur";
  const todayLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  // A skeleton of the layout that is about to appear. The previous full-screen
  // dark panel flashed, then swapped to a light dashboard, which read as slow.
  if (!hydrated) {
    return (
      <div className="dashboardSkeleton" aria-busy="true" aria-label="Chargement du tableau de bord">
        <div className="skelLine" style={{ width: "180px" }} />
        <div className="skelLine" style={{ width: "320px", height: "30px" }} />
        <div className="skelHero" />
        <div className="skelRow">
          <div className="skelTile" /><div className="skelTile" /><div className="skelTile" /><div className="skelTile" />
        </div>
      </div>
    );
  }

  return (
    <main className="learnerApp">
      <aside className="appSidebar">
        <Link className="academyBrand light" href="/" aria-label="Accueil OncoRT Academy">
          <span className="brandGlyph">O</span>
          <span><strong>OncoRT</strong><small>Academy</small></span>
        </Link>
        <nav aria-label="Navigation de l’application">
          <Link className="active" href="/"><AppIcon name="home" /><span>Accueil</span></Link>
          <Link href="/parcours/prostate"><AppIcon name="path" /><span>Parcours</span></Link>
          <Link href="/cas/prostate"><AppIcon name="case" /><span>Cas RCP</span></Link>
          <Link href="/bibliotheque/prostate"><AppIcon name="source" /><span>Sources</span></Link>
        </nav>
        <div className="sidebarAccount">
          <span className="avatar">{identity?.name?.[0]?.toUpperCase() ?? "D"}</span>
          <div><strong>{firstName}</strong><small>{identity ? "Compte synchronisé" : "Mode invité"}</small></div>
          <Link href="/connexion" aria-label="Gérer le compte">•••</Link>
        </div>
      </aside>

      <section className="appMain">
        <header className="mobileAppHeader">
          <Link className="academyBrand" href="/"><span className="brandGlyph">O</span><span><strong>OncoRT</strong><small>Academy</small></span></Link>
          <Link className="avatar" href="/connexion">{identity?.name?.[0]?.toUpperCase() ?? "D"}</Link>
        </header>

        <div className="dashboardHeading">
          <div>
            <p className="eyebrow">{todayLabel}</p>
            <h1>Bonjour {firstName}.</h1>
            <p>{isFirstRun ? "On part des mécanismes, pas des recommandations. Une session suffit pour commencer." : "Prêt pour ta prochaine session ?"}</p>
          </div>
          <div className="headingActions">
            {/* A cold case is the wrong first move: PRODUCT_SPEC puts the guided
                course before the expert case. Surface it once there is footing. */}
            {!isFirstRun && <Link href="/cas/prostate" className="quickAction"><AppIcon name="case" /><span><strong>Cas rapide</strong><small>10 minutes</small></span></Link>}
            <Link href="/connexion" className="notificationButton" aria-label="Profil et synchronisation"><span className="avatar small">{identity?.name?.[0]?.toUpperCase() ?? "D"}</span></Link>
          </div>
        </div>

        <section className="continueCard">
          <div className="continueVisual" aria-hidden="true">
            <div className="doseMap">
              <span className="doseOrbit orbitOne" /><span className="doseOrbit orbitTwo" /><span className="doseOrbit orbitThree" />
              <i className="beam beamOne" /><i className="beam beamTwo" /><i className="beam beamThree" />
              <b><small>01</small><strong>PROSTATE</strong></b>
            </div>
            <span className="visualLabel">CARTE DE MAÎTRISE · PARCOURS 01</span>
          </div>
          <div className="continueContent">
            <div className="continueMeta"><span>{isFirstRun ? "Commencer ici" : "Continuer"}</span>{!isFirstRun && <b>{resumeBlock.percent}% terminé</b>}</div>
            <p>{primarySite.shortTitle} · Bloc {resumeBlock.number}</p>
            <h2>{resumeBlock.title}</h2>
            {!isFirstRun && <div className="continueProgress"><i style={{ width: `${resumeBlock.percent}%` }} /></div>}
            <div className="continueFooter">
              <span>{resumeBlock.completedLessons}/{resumeBlock.lessonCount} leçons · {resumeBlock.estimatedMinutes} min</span>
              <Link href={`/parcours/${primarySite.id}/${resumeBlock.id}`} className="resumeButton">
                {resumeBlock.percent ? "Reprendre" : "Commencer"}<span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="dashboardSection">
          <div className="dashboardSectionHeader">
            <span className="sectionIndex">02</span>
            <div><h2>Choisir un parcours</h2><p>Progresse localisation par localisation.</p></div>
            <Link href="/parcours/prostate">Voir le cursus complet →</Link>
          </div>
          <div className="courseCarousel">
            <Link className="courseTile prostateTile" href="/parcours/prostate">
              <div className="tileTop"><span className="tileIcon">P</span><span className="availableTag">Disponible</span></div>
              <div className="tileBody"><span>Oncologie génito-urinaire</span><h3>Cancer de la prostate</h3><p>15 chapitres · 87 leçons</p></div>
              {!isFirstRun && <div className="tileProgress"><i style={{ width: `${overallPercent}%` }} /><span>{overallPercent}%</span></div>}
            </Link>
            {upcomingSites.slice(0, 3).map((site, index) => (
              <article className={`courseTile upcomingTile upcoming${index + 1}`} key={site.id}>
                <div className="tileTop"><span className="tileIcon">{site.title.charAt(0)}</span><span className="soonTag">Bientôt</span></div>
                <div className="tileBody"><span>{index === 0 ? "Oncologie mammaire" : index === 1 ? "Oncologie thoracique" : "Oncologie digestive"}</span><h3>{site.title}</h3><p>Nouveau parcours en préparation</p></div>
                <span className="lockedLabel">Parcours verrouillé</span>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboardSection skillSection">
          <div className="dashboardSectionHeader"><span className="sectionIndex">03</span><div><h2>Ta progression</h2><p>Une vue claire de ce que tu maîtrises.</p></div></div>
          <div className="skillGrid">
            {[
              ["Fondations", blocks.filter((block) => block.level === "foundations"), "mint"],
              ["Compétence clinique", blocks.filter((block) => block.level === "clinical_competence"), "lime"],
              ["Raisonnement RCP", blocks.filter((block) => block.level === "expert_rcp"), "forest"],
            ].map(([label, scopedBlocks, tone]) => {
              const group = scopedBlocks as typeof blocks;
              const value = group.length ? Math.round(group.reduce((sum, block) => sum + block.percent, 0) / group.length) : 0;
              // A 0% meter measures nothing; name the ground still to cover instead.
              return <article className="skillCard" key={label as string}><div><span className={`skillIcon ${tone}`}>{(label as string).charAt(0)}</span><b>{isFirstRun ? "—" : `${value}%`}</b></div><h3>{label as string}</h3><div className="skillBar"><i className={tone as string} style={{ width: `${value}%` }} /></div><p>{isFirstRun ? `${group.length} ${group.length > 1 ? "blocs à parcourir" : "bloc à parcourir"}` : `${group.filter((block) => block.percent === 100).length}/${group.length} blocs maîtrisés`}</p></article>;
            })}
          </div>
        </section>
      </section>

      <aside className="dailyRail">
        {/* The old ring counted minutes the app never measured. Nothing tracks
            time, so it claimed "5 / 15 min" for any learner past lesson one. */}
        <section className="dailyGoalCard">
          {isFirstRun ? (
            <>
              <div className="goalHeader"><span><AppIcon name="target" /></span><div><strong>Comment ça marche</strong><small>La boucle d’apprentissage</small></div></div>
              <ol className="loopSteps">
                <li><b>Une leçon</b><span>Le mécanisme avant la recommandation.</span></li>
                <li><b>Un cas</b><span>Tu raisonnes, le tuteur cherche la lacune.</span></li>
                <li><b>Une capsule</b><span>Elle répare la lacune, puis on te reteste ailleurs.</span></li>
              </ol>
              <p>Commence par le bloc de gauche : tout part de là.</p>
            </>
          ) : (
            <>
              <div className="goalHeader"><span><AppIcon name="target" /></span><div><strong>Ta session</strong><small>Reprendre où tu en es</small></div></div>
              <p className="railFigure"><b>{completedLessons}</b> {completedLessons > 1 ? "leçons terminées" : "leçon terminée"}{completedBlocks ? ` · ${completedBlocks} ${completedBlocks > 1 ? "blocs" : "bloc"}` : ""}</p>
              <p>Bloc {resumeBlock.number} · {resumeBlock.title}</p>
              <Link href={`/parcours/${primarySite.id}/${resumeBlock.id}`}>Reprendre ma session</Link>
            </>
          )}
        </section>

        <section className="streakCard" hidden={isFirstRun}>
          <div><span className="flame">◆</span><strong>{activeDaysThisWeek}</strong><small>{activeDaysThisWeek > 1 ? "jours actifs cette semaine" : "jour actif cette semaine"}</small></div>
          <div className="weekRow">{weekActivity.map((day, index) => <span className={day.isToday ? "today" : ""} key={`${day.label}-${index}`}><b>{day.label}</b><i>{day.wasActive ? "✓" : ""}</i></span>)}</div>
        </section>

        {/* Hidden on first run: three zero readouts on one screen read as failure. */}
        {!isFirstRun && (
          <section className="masterySummary">
            <div><span>Progression globale</span><strong>{overallPercent}%</strong></div>
            <div className="masteryBar"><i style={{ width: `${overallPercent}%` }} /></div>
            <p><b>{completedBlocks}</b> blocs terminés · <b>{completedLessons}</b> leçons maîtrisées</p>
          </section>
        )}

        <section className="reviewQueueCard">
          <span className="reviewMiniIcon">↻</span>
          {/* No scheduling backend yet: state that plainly rather than showing a count we cannot honour. */}
          <div><strong>Révision espacée</strong><p>Bientôt disponible. Les cartes des leçons terminées te seront reproposées au bon moment.</p></div>
          <button disabled>Réviser</button>
        </section>

        <p className="clinicalNotice">Formation pédagogique. Les contenus cliniques restent soumis à validation et ne constituent pas une aide à la décision.</p>
      </aside>

      <nav className="mobileBottomNav" aria-label="Navigation mobile">
        <Link className="active" href="/"><AppIcon name="home" /><span>Accueil</span></Link>
        <Link href="/parcours/prostate"><AppIcon name="path" /><span>Parcours</span></Link>
        <Link href="/cas/prostate"><AppIcon name="case" /><span>Cas</span></Link>
        <Link href="/connexion"><span className="avatar tiny">{identity?.name?.[0]?.toUpperCase() ?? "D"}</span><span>Profil</span></Link>
      </nav>
    </main>
  );
}

function AppIcon({ name }: { name: "home" | "path" | "case" | "source" | "target" }) {
  const paths = {
    home: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    path: "M5 4h10a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h10M5 4l3-3M5 4l3 3M19 20l-3-3M19 20l-3 3",
    case: "M5 7h14v14H5zM9 7V4h6v3M9 12h6M12 9v6",
    source: "M6 3h10l3 3v15H6zM9 9h6M9 13h6M9 17h4",
    target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-5a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}
