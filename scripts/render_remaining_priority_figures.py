#!/usr/bin/env python3
"""Render the remaining priority prostate figures with evidence-bounded semantics."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from matplotlib.patches import Circle, Ellipse, FancyBboxPatch, PathPatch, Polygon
from matplotlib.path import Path as MplPath


P = {
    "paper": "#FFF8E8", "panel": "#FFFCF4", "charcoal": "#24313A",
    "muted": "#5C666D", "grid": "#D8D5C9", "teal": "#007C83",
    "blue": "#2563A6", "coral": "#C85C4A", "orange": "#D97706",
    "green": "#3C7A57", "pale_teal": "#DDF3F1", "pale_blue": "#E5EEF8",
    "pale_coral": "#F8DDD7", "pale_orange": "#FCEBCD", "pale_green": "#E3F0E6",
}


def cli():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    return parser.parse_args()


def setup(title: str, subtitle: str, widths=(1, 1, 1)):
    fig = plt.figure(figsize=(16, 9), facecolor=P["paper"])
    grid = GridSpec(
        2, 3, figure=fig, height_ratios=[0.17, 0.83], width_ratios=widths,
        hspace=0.16, wspace=0.10,
    )
    header = fig.add_subplot(grid[0, :])
    header.set_facecolor("#20323B")
    header.set_xticks([]); header.set_yticks([])
    for spine in header.spines.values(): spine.set_visible(False)
    header.text(0.025, 0.65, title, color="white", fontsize=22.5, weight="bold", va="center")
    header.text(0.025, 0.25, subtitle, color="#BDE7E4", fontsize=11.3, weight="bold", va="center")
    return fig, grid


def panel(fig, spec, title: str, title_size=14.0):
    ax = fig.add_subplot(spec)
    ax.set_facecolor(P["panel"]); ax.set_xticks([]); ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_color(P["grid"]); spine.set_linewidth(1.2)
    ax.text(0.05, 0.94, title, transform=ax.transAxes, fontsize=title_size,
            weight="bold", color=P["charcoal"], va="center")
    return ax


def rect(ax, x, y, w, h, title, body, color, fill, title_fs=10.5, body_fs=8.2):
    ax.add_patch(plt.Rectangle((x, y), w, h, transform=ax.transAxes,
                               facecolor=fill, edgecolor=color, linewidth=1.55))
    ax.text(x + 0.03, y + h - 0.045, title, transform=ax.transAxes,
            fontsize=title_fs, weight="bold", color=color, va="center")
    ax.text(x + 0.03, y + h - 0.085, body, transform=ax.transAxes,
            fontsize=body_fs, color=P["charcoal"], va="top", linespacing=1.3)


def save(fig, out: Path, provenance: dict):
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=160, facecolor=fig.get_facecolor())
    plt.close(fig)
    provenance["schemaVersion"] = 1
    provenance["asset"] = str(out)
    provenance.setdefault("releaseGate", "needs_review")
    provenance.setdefault("namedClinicalReviewer", None)
    out.with_suffix(".provenance.json").write_text(
        json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8"
    )


def render_pirads(root: Path):
    out = root / "public/figures/prostate/detection-diagnosis/03-irm-pirads-v2.png"
    fig, grid = setup(
        "IRM et PI-RADS : localiser une suspicion, pas prononcer un verdict",
        "Architecture zonale · séquence dominante · catégorie de suspicion · décision contextualisée",
        widths=(0.95, 0.85, 1.20),
    )
    zones = panel(fig, grid[1, 0], "1 · LOCALISER PAR ZONE")
    gland = Ellipse((0.50, 0.56), 0.64, 0.49, transform=zones.transAxes,
                    facecolor=P["pale_teal"], edgecolor=P["teal"], linewidth=2.2)
    tz = Ellipse((0.50, 0.58), 0.32, 0.34, transform=zones.transAxes,
                 facecolor=P["pale_orange"], edgecolor=P["orange"], linewidth=2.0)
    zones.add_patch(gland); zones.add_patch(tz)
    zones.text(0.50, 0.58, "ZONE\nTRANSITIONNELLE", transform=zones.transAxes,
               ha="center", va="center", fontsize=9.0, weight="bold", color=P["orange"])
    zones.text(0.50, 0.34, "ZONE PÉRIPHÉRIQUE", transform=zones.transAxes,
               ha="center", fontsize=9.0, weight="bold", color=P["teal"])
    zones.add_patch(Circle((0.30, 0.52), 0.045, transform=zones.transAxes,
                           facecolor=P["coral"], edgecolor="white", linewidth=1.5))
    zones.add_patch(Circle((0.58, 0.66), 0.040, transform=zones.transAxes,
                           facecolor=P["blue"], edgecolor="white", linewidth=1.5))
    zones.text(0.08, 0.22, "PZ : DWI dominante", transform=zones.transAxes,
               fontsize=10.4, weight="bold", color=P["teal"])
    zones.text(0.08, 0.17, "DCE : rôle d’appoint pour certaines lésions PZ", transform=zones.transAxes,
               fontsize=7.9, color=P["charcoal"])
    zones.text(0.08, 0.11, "TZ : T2W dominante", transform=zones.transAxes,
               fontsize=10.4, weight="bold", color=P["orange"])
    zones.text(0.08, 0.055, "DWI module l’évaluation en zone transitionnelle", transform=zones.transAxes,
               fontsize=7.9, color=P["charcoal"])
    zones.text(0.05, 0.018, "Carte conceptuelle, non à l’échelle · aucune IRM patient", transform=zones.transAxes,
               fontsize=6.9, color=P["muted"], va="bottom")

    score = panel(fig, grid[1, 1], "2 · CATÉGORISER", title_size=13.5)
    labels = [
        ("1", "Très faible", P["pale_green"], P["green"]),
        ("2", "Faible", P["pale_teal"], P["teal"]),
        ("3", "Équivoque", P["pale_orange"], P["orange"]),
        ("4", "Élevée", P["pale_coral"], P["coral"]),
        ("5", "Très élevée", "#F3C6BD", "#A43E32"),
    ]
    y = 0.80
    for n, meaning, fill, color in labels:
        score.add_patch(FancyBboxPatch((0.12, y), 0.76, 0.10,
                        boxstyle="round,pad=0.008,rounding_size=0.02",
                        transform=score.transAxes, facecolor=fill, edgecolor=color, linewidth=1.5))
        score.text(0.22, y + 0.05, n, transform=score.transAxes, ha="center", va="center",
                   fontsize=16, weight="bold", color=color)
        score.text(0.34, y + 0.05, meaning, transform=score.transAxes, va="center",
                   fontsize=10.0, weight="bold", color=P["charcoal"])
        y -= 0.125
    score.text(0.08, 0.12, "Suspicion de cancer cliniquement significatif\n— pas une probabilité individuelle chiffrée.",
               transform=score.transAxes, fontsize=8.5, weight="bold", color=P["charcoal"], linespacing=1.35)
    score.text(0.08, 0.045, "PI-RADS ≠ ISUP ≠ stade", transform=score.transAxes,
               fontsize=10.0, weight="bold", color=P["coral"])

    decision = panel(fig, grid[1, 2], "3 · DÉCIDER SANS SURINTERPRÉTER", title_size=12.8)
    steps = [
        ("QUALITÉ", "T2W · DWI/ADC · DCE si protocole mpMRI\nArtéfacts et limites explicités", P["blue"], P["pale_blue"]),
        ("LOCALISATION", "Zone · secteur · taille · rapports\nCible retrouvable pour prélèvement", P["teal"], P["pale_teal"]),
        ("RISQUE INTÉGRÉ", "PI-RADS + densité de PSA + clinique\n+ antécédents et risque prétest", P["orange"], P["pale_orange"]),
        ("BIOPSIE", "Ciblée ± systématisée selon le contexte\nConcordance radio-pathologique ensuite", P["coral"], P["pale_coral"]),
    ]
    y = 0.78
    for i, (title, body, color, fill) in enumerate(steps):
        rect(decision, 0.08, y, 0.84, 0.135, title, body, color, fill, title_fs=10.2, body_fs=7.9)
        if i < len(steps) - 1:
            decision.annotate("", xy=(0.50, y - 0.025), xytext=(0.50, y - 0.005),
                              xycoords="axes fraction", arrowprops={"arrowstyle": "->", "lw": 1.8, "color": P["grid"]})
        y -= 0.18
    decision.text(0.08, 0.065, "IRM positive ≠ cancer prouvé · IRM négative ≠ risque nul",
                  transform=decision.transAxes, fontsize=9.0, weight="bold", color=P["coral"])
    decision.text(0.08, 0.022, "ACR–ESUR–AdMeTech PI-RADS v2.1 · EAU 2026", transform=decision.transAxes,
                  fontsize=6.9, color=P["muted"], va="bottom")
    save(fig, out, {
        "purpose": "Teach zone-dependent PI-RADS interpretation and contextual biopsy decisions without fabricating MRI anatomy or patient risk.",
        "source": {"license": "Original deterministic schematic; no third-party figure reused",
                   "guidelines": [{"id": "acr_pirads_v21_2019", "pmid": "30898406", "doi": "10.1016/j.eururo.2019.02.033"}, {"id": "eau_prostate_2026"}]},
        "limitations": ["Zonal anatomy is conceptual and not a diagnostic image.", "No lesion morphology or patient-specific PI-RADS category is depicted.", "The biopsy pathway must be reconciled with the full guideline and local practice."],
    })


def render_postop(root: Path):
    out = root / "public/figures/prostate/postprostatectomy-recurrence/06-technique-v2.png"
    fig, grid = setup(
        "Radiothérapie postopératoire : reconstruire un lit sans glande",
        "Anatomie postopératoire conceptuelle · sources concordantes · CTV du lit ≠ nodule visible seul",
        widths=(0.95, 1.0, 1.05),
    )
    anatomy = panel(fig, grid[1, 0], "1 · REPÈRES, PAS PROSTATE")
    bladder = FancyBboxPatch((0.29, 0.68), 0.42, 0.16, boxstyle="round,pad=0.02,rounding_size=0.07",
                             transform=anatomy.transAxes, facecolor=P["pale_blue"], edgecolor=P["blue"], linewidth=2)
    anatomy.add_patch(bladder)
    anatomy.text(0.50, 0.76, "VESSIE", transform=anatomy.transAxes, ha="center", va="center",
                 fontsize=10.5, weight="bold", color=P["blue"])
    anatomy.plot([0.50, 0.50], [0.68, 0.24], transform=anatomy.transAxes,
                 color=P["orange"], linewidth=4, solid_capstyle="round")
    anatomy.add_patch(Ellipse((0.50, 0.61), 0.18, 0.07, transform=anatomy.transAxes,
                              facecolor=P["pale_orange"], edgecolor=P["orange"], linewidth=2))
    anatomy.text(0.68, 0.61, "Anastomose", transform=anatomy.transAxes, fontsize=9.2,
                 weight="bold", color=P["orange"], va="center")
    anatomy.annotate("", xy=(0.59, 0.61), xytext=(0.67, 0.61), xycoords="axes fraction",
                     arrowprops={"arrowstyle": "->", "color": P["orange"], "lw": 1.6})
    bed = Ellipse((0.50, 0.50), 0.48, 0.29, transform=anatomy.transAxes,
                  facecolor=P["pale_teal"], edgecolor=P["teal"], linewidth=2.2, linestyle="--")
    anatomy.add_patch(bed)
    anatomy.text(0.50, 0.48, "LIT PROSTATIQUE\nÀ RECONSTRUIRE", transform=anatomy.transAxes,
                 ha="center", va="center", fontsize=9.5, weight="bold", color=P["teal"])
    anatomy.add_patch(Ellipse((0.68, 0.45), 0.14, 0.30, transform=anatomy.transAxes,
                              facecolor=P["pale_coral"], edgecolor=P["coral"], linewidth=1.8))
    anatomy.text(0.78, 0.45, "Rectum", transform=anatomy.transAxes, fontsize=9.0,
                 weight="bold", color=P["coral"], rotation=90, va="center")
    anatomy.text(0.50, 0.18, "GLANDE ABSENTE", transform=anatomy.transAxes, ha="center",
                 fontsize=12.0, weight="bold", color=P["coral"])
    anatomy.text(0.50, 0.105, "Aucune « prostate fantôme ».\nLe tireté n’est pas un contour exportable.",
                 transform=anatomy.transAxes, ha="center", fontsize=8.3, weight="bold",
                 color=P["charcoal"], linespacing=1.3)
    anatomy.text(0.05, 0.022, "Schéma conceptuel non à l’échelle · sans donnée patient",
                 transform=anatomy.transAxes, fontsize=6.8, color=P["muted"], va="bottom")

    sources = panel(fig, grid[1, 1], "2 · RECONSTRUIRE LE CTV")
    source_rows = [
        ("CT DE SIMULATION", "Anatomie postopératoire et OAR", P["blue"], P["pale_blue"]),
        ("IRM PRÉ-/POSTOP", "Apex initial, col vésical, loges des VS", P["teal"], P["pale_teal"]),
        ("ANATOMOPATHOLOGIE", "Marges, extension, siège du risque", P["orange"], P["pale_orange"]),
        ("ATLAS IDENTIFIÉ", "ESTRO-ACROP + protocole local", P["coral"], P["pale_coral"]),
    ]
    y = 0.78
    for title, body, color, fill in source_rows:
        rect(sources, 0.08, y, 0.84, 0.13, title, body, color, fill, title_fs=9.8, body_fs=8.0)
        y -= 0.17
    sources.text(0.08, 0.11, "Une lésion visible peut conduire à une adaptation/boost,\nmais ne remplace pas le CTV du lit\nà risque microscopique.",
                 transform=sources.transAxes, fontsize=7.9, weight="bold", color=P["charcoal"], linespacing=1.3)
    sources.text(0.08, 0.025, "ESTRO-ACROP 2023 · RecoRad 2025", transform=sources.transAxes,
                 fontsize=7.0, color=P["muted"], va="bottom")

    planning = panel(fig, grid[1, 2], "3 · AUDIT DU PLAN")
    checks = [
        ("VOLUMES", "CTV du lit · éventuel pelvis · éventuelle lésion", P["teal"]),
        ("OAR", "Vessie · rectum · anastomose/urètre selon protocole", P["blue"]),
        ("DOSE / FRACTIONNEMENT", "Schéma postopératoire sourcé, non copié du primitif", P["orange"]),
        ("TECHNIQUE", "IMRT/VMAT · IGRT quotidienne · préparation reproductible", P["coral"]),
    ]
    y = 0.79
    for index, (title, body, color) in enumerate(checks, 1):
        planning.text(0.10, y + 0.025, str(index), transform=planning.transAxes, ha="center", va="center",
                      fontsize=11, weight="bold", color="white",
                      bbox={"boxstyle": "circle,pad=0.35", "facecolor": color, "edgecolor": "none"})
        planning.text(0.18, y + 0.035, title, transform=planning.transAxes,
                      fontsize=10.0, weight="bold", color=color, va="center")
        planning.text(0.18, y - 0.005, body, transform=planning.transAxes,
                      fontsize=8.0, color=P["charcoal"], va="top")
        if index < len(checks):
            planning.annotate("", xy=(0.10, y - 0.13), xytext=(0.10, y - 0.055),
                              xycoords="axes fraction", arrowprops={"arrowstyle": "->", "lw": 1.7, "color": P["grid"]})
        y -= 0.18
    planning.text(0.08, 0.075, "Erreur bloquante : copier les volumes de prostate intacte.",
                  transform=planning.transAxes, fontsize=8.8, weight="bold", color=P["coral"])
    planning.text(0.08, 0.025, "Figure originale · aucune délinéation patient", transform=planning.transAxes,
                  fontsize=7.0, color=P["muted"], va="bottom")
    save(fig, out, {
        "purpose": "Teach the reconstruction of a postoperative prostate bed without presenting a schematic as a contouring atlas.",
        "source": {"license": "Original deterministic schematic; no third-party figure reused",
                   "guidelines": [{"id": "estro_acrop_prostate_bed_2023", "pmid": "37251620", "pmcid": "PMC10209331"}, {"id": "sfro_recorad_prostate_2025"}]},
        "limitations": ["The anatomy panel is conceptual and cannot be used for contouring.", "No universal CTV boundary, dose, or fractionation is encoded.", "A named atlas and local protocol remain required."],
    })


def render_nodal(root: Path):
    out = root / "public/figures/prostate/postradiotherapy-and-oligorecurrence/02-nodal-v2.png"
    fig, grid = setup(
        "Récidive ganglionnaire pelvienne : focal ou électif ?",
        "PEACE V–STORM · phase II · deux stratégies avec 6 mois d’ADT · signal sans surinterprétation",
        widths=(0.95, 1.15, 0.90),
    )
    scope = panel(fig, grid[1, 0], "1 · VÉRIFIER LA POPULATION")
    gates = [
        ("TOPOGRAPHIE", "Ganglion(s) pelvien(s), pas M1a/os", P["blue"], P["pale_blue"]),
        ("NOMBRE", "≤ 5 ganglions détectés au TEP", P["teal"], P["pale_teal"]),
        ("ANTÉCÉDENTS", "Ancien plan, pelvis irradié ou non, dose cumulée", P["orange"], P["pale_orange"]),
        ("CONTEXTE", "Hormonosensible · pas d’autre site · OAR", P["coral"], P["pale_coral"]),
    ]
    y = 0.79
    for title, body, color, fill in gates:
        rect(scope, 0.08, y, 0.84, 0.13, title, body, color, fill, title_fs=9.8, body_fs=7.9)
        y -= 0.17
    scope.text(0.08, 0.10, "Ne pas extrapoler la comparaison\naux rechutes extrapelviennes ou osseuses.",
               transform=scope.transAxes, fontsize=9.1, weight="bold", color=P["coral"], linespacing=1.3)
    scope.text(0.08, 0.025, "196 patients · essai randomisé de phase II", transform=scope.transAxes,
               fontsize=7.0, color=P["muted"], va="bottom")

    arms = panel(fig, grid[1, 1], "2 · COMPARER CE QUI A ÉTÉ TESTÉ")
    arms.add_patch(FancyBboxPatch((0.06, 0.54), 0.88, 0.30, boxstyle="round,pad=0.012,rounding_size=0.02",
                                  transform=arms.transAxes, facecolor=P["pale_blue"], edgecolor=P["blue"], linewidth=1.8))
    arms.text(0.10, 0.79, "MDT FOCALE", transform=arms.transAxes, fontsize=13.0, weight="bold", color=P["blue"])
    arms.text(0.10, 0.73, "SBRT ou chirurgie des ganglions visibles", transform=arms.transAxes,
              fontsize=9.1, weight="bold", color=P["charcoal"])
    arms.text(0.10, 0.665, "✓ petit volume traité\n✕ maladie microscopique des chaînes non ciblée", transform=arms.transAxes,
              fontsize=8.4, color=P["charcoal"], linespacing=1.5)
    arms.text(0.77, 0.58, "+ ADT\n6 mois", transform=arms.transAxes, ha="center", fontsize=9.2,
              weight="bold", color=P["blue"])
    arms.add_patch(FancyBboxPatch((0.06, 0.17), 0.88, 0.30, boxstyle="round,pad=0.012,rounding_size=0.02",
                                  transform=arms.transAxes, facecolor=P["pale_teal"], edgecolor=P["teal"], linewidth=1.8))
    arms.text(0.10, 0.42, "IRRADIATION ÉLECTIVE + BOOST", transform=arms.transAxes,
              fontsize=12.3, weight="bold", color=P["teal"])
    arms.text(0.10, 0.36, "Pelvis à risque + boost des ganglions détectés", transform=arms.transAxes,
              fontsize=9.1, weight="bold", color=P["charcoal"])
    arms.text(0.10, 0.295, "✓ couvre un risque microscopique territorial\n✕ volume irradié et exposition OAR plus grands", transform=arms.transAxes,
              fontsize=8.4, color=P["charcoal"], linespacing=1.5)
    arms.text(0.77, 0.21, "+ ADT\n6 mois", transform=arms.transAxes, ha="center", fontsize=9.2,
              weight="bold", color=P["teal"])
    arms.text(0.08, 0.055, "L’ADT n’est pas la différence entre les deux bras.", transform=arms.transAxes,
              fontsize=9.1, weight="bold", color=P["coral"])

    result = panel(fig, grid[1, 2], "3 · LIRE LE SIGNAL", title_size=13.2)
    result.text(0.50, 0.84, "Survie sans métastase à 4 ans", transform=result.transAxes,
                ha="center", fontsize=10.0, weight="bold", color=P["charcoal"])
    chart_y, chart_h = 0.45, 0.30
    for frac in (0.25, 0.50, 0.75, 1.00):
        yline = chart_y + chart_h * frac
        result.plot([0.14, 0.88], [yline, yline], transform=result.transAxes,
                    color=P["grid"], linewidth=0.8, zorder=0)
        result.text(0.11, yline, f"{int(frac * 100)}", transform=result.transAxes,
                    ha="right", va="center", fontsize=7.0, color=P["muted"])
    bars = [(0.28, 0.63, "MDT", "63 %", P["blue"]),
            (0.58, 0.76, "Électif\n+ boost", "76 %", P["teal"])]
    for x, fraction, label, value, color in bars:
        result.add_patch(plt.Rectangle((x, chart_y), 0.16, chart_h * fraction,
                                       transform=result.transAxes, facecolor=color, edgecolor="none"))
        result.text(x + 0.08, chart_y + chart_h * fraction + 0.025, value,
                    transform=result.transAxes, ha="center", va="bottom",
                    fontsize=11.0, weight="bold", color=color)
        result.text(x + 0.08, chart_y - 0.035, label, transform=result.transAxes,
                    ha="center", va="top", fontsize=8.3, weight="bold", color=P["charcoal"])
    result.text(0.50, 0.34, "HR 0,62 · p = 0,063", transform=result.transAxes,
                ha="center", fontsize=11.0, weight="bold", color=P["charcoal"])
    result.text(0.50, 0.25, "Signal en faveur de l’électif\n≠ preuve définitive de supériorité", transform=result.transAxes,
                ha="center", fontsize=8.8, weight="bold", color=P["coral"], linespacing=1.3)
    result.text(0.50, 0.14, "Pas de bénéfice de survie globale démontré", transform=result.transAxes,
                ha="center", fontsize=8.0, color=P["charcoal"])
    result.text(0.50, 0.035, "PEACE V–STORM · Lancet Oncology 2025", transform=result.transAxes,
                ha="center", fontsize=7.0, color=P["muted"], va="bottom")
    save(fig, out, {
        "purpose": "Compare the exact PEACE V-STORM treatment strategies and evidence signal without fabricating nodal anatomy.",
        "source": {"license": "Original deterministic synthesis; no third-party figure reused",
                   "trial": {"id": "peace_v_storm_2025", "pmid": "40339593", "doi": "10.1016/S1470-2045(25)00197-4"},
                   "guidelines": [{"id": "sfro_recorad_prostate_2025"}, {"id": "eau_prostate_2026"}]},
        "limitations": ["The trial was phase II and the displayed result must not be presented as definitive superiority.", "The figure does not apply to extrapelvic or osseous recurrence.", "No individual treatment recommendation is encoded."],
    })


def render_cn1(root: Path):
    out = root / "public/figures/prostate/high-risk-and-cn1/04-cn1-m0-v2.png"
    fig, grid = setup(
        "cN1 M0 : articuler contrôle locorégional et risque systémique",
        "Définition de la population · RT prostate/pelvis/boost · ADT longue · abiratérone 2 ans · PSMA-only séparé",
        widths=(0.95, 1.05, 1.0),
    )
    state = panel(fig, grid[1, 0], "1 · DÉFINIR L’ÉTAT")
    rect(state, 0.08, 0.72, 0.84, 0.17, "cN1", "Ganglion(s) régional(aux) pelvien(s)\ndétecté(s) en stadification", P["teal"], P["pale_teal"], 13.0, 8.8)
    rect(state, 0.08, 0.48, 0.84, 0.17, "M0", "Absence de métastase distante\nsur la convention d’imagerie déclarée", P["blue"], P["pale_blue"], 13.0, 8.8)
    state.text(0.50, 0.39, "Conventionnel ≠ PSMA-only", transform=state.transAxes,
               ha="center", fontsize=11.2, weight="bold", color=P["coral"])
    state.text(0.08, 0.27, "cN1 conventionnel", transform=state.transAxes,
               fontsize=9.8, weight="bold", color=P["charcoal"])
    state.text(0.08, 0.22, "Population directement reliée aux recommandations", transform=state.transAxes,
               fontsize=8.0, color=P["charcoal"])
    state.text(0.08, 0.14, "Ganglion PSMA-only", transform=state.transAxes,
               fontsize=9.8, weight="bold", color=P["coral"])
    state.text(0.08, 0.09, "Migration de stade : extrapolation à tracer", transform=state.transAxes,
               fontsize=8.0, color=P["charcoal"])
    state.text(0.08, 0.025, "Ne jamais fusionner les deux populations dans le raisonnement",
               transform=state.transAxes, fontsize=6.9, color=P["muted"], va="bottom")

    local = panel(fig, grid[1, 1], "2 · CONTRÔLE LOCORÉGIONAL")
    layers = [
        (0.77, "PROSTATE", "Traitement du primitif", P["blue"], P["pale_blue"]),
        (0.57, "PELVIS ÉLECTIF", "Territoires ganglionnaires régionaux à risque", P["teal"], P["pale_teal"]),
        (0.37, "BOOST GANGLIONNAIRE", "Maladie macroscopique individualisée", P["orange"], P["pale_orange"]),
    ]
    for y, title, body, color, fill in layers:
        rect(local, 0.08, y, 0.84, 0.15, title, body, color, fill, 10.3, 8.2)
    local.text(0.50, 0.26, "IMRT / VMAT + IGRT", transform=local.transAxes,
               ha="center", fontsize=13.0, weight="bold", color=P["charcoal"])
    local.text(0.50, 0.19, "Dose et fractionnement liés au protocole et aux OAR", transform=local.transAxes,
               ha="center", fontsize=8.4, color=P["charcoal"])
    local.text(0.08, 0.09, "Le boost n’est ni le pelvis électif ni une SBRT isolée\ndu seul ganglion sans traitement du primitif.",
               transform=local.transAxes, fontsize=8.7, weight="bold", color=P["coral"], linespacing=1.3)
    local.text(0.08, 0.025, "RecoRad 2025 · EAU 2026", transform=local.transAxes,
               fontsize=7.0, color=P["muted"], va="bottom")

    systemic = panel(fig, grid[1, 2], "3 · TRAITEMENT SYSTÉMIQUE")
    systemic.add_patch(FancyBboxPatch((0.08, 0.68), 0.84, 0.18, boxstyle="round,pad=0.012,rounding_size=0.02",
                                      transform=systemic.transAxes, facecolor=P["pale_blue"], edgecolor=P["blue"], linewidth=1.8))
    systemic.text(0.12, 0.80, "ADT LONGUE", transform=systemic.transAxes,
                  fontsize=13.0, weight="bold", color=P["blue"])
    systemic.text(0.12, 0.735, "Socle systémique du parcours combiné", transform=systemic.transAxes,
                  fontsize=9.0, color=P["charcoal"])
    systemic.add_patch(FancyBboxPatch((0.08, 0.43), 0.84, 0.18, boxstyle="round,pad=0.012,rounding_size=0.02",
                                      transform=systemic.transAxes, facecolor=P["pale_teal"], edgecolor=P["teal"], linewidth=1.8))
    systemic.text(0.12, 0.55, "ABIRATÉRONE · 2 ANS", transform=systemic.transAxes,
                  fontsize=13.0, weight="bold", color=P["teal"])
    systemic.text(0.12, 0.485, "cN1 M0 conventionnel apte · EAU 2026", transform=systemic.transAxes,
                  fontsize=9.0, color=P["charcoal"])
    systemic.text(0.50, 0.34, "+", transform=systemic.transAxes, ha="center",
                  fontsize=20, weight="bold", color=P["charcoal"])
    rect(systemic, 0.08, 0.16, 0.84, 0.14, "PRÉVENTION / SUIVI",
         "Cardiométabolique · os · tension · kaliémie\nadhésion et toxicités", P["orange"], P["pale_orange"], 10.0, 7.9)
    systemic.text(0.08, 0.075, "PSMA-only : décision multidisciplinaire,\nincertitude prospective explicitement documentée.",
                  transform=systemic.transAxes, fontsize=8.6, weight="bold", color=P["coral"], linespacing=1.3)
    systemic.text(0.08, 0.025, "STAMPEDE M0 2022 · EAU 2026", transform=systemic.transAxes,
                  fontsize=7.0, color=P["muted"], va="bottom")
    save(fig, out, {
        "purpose": "Separate conventional cN1 M0 multimodal recommendations from PSMA-only extrapolation and show local plus systemic treatment components.",
        "source": {"license": "Original deterministic synthesis; no third-party figure reused",
                   "guidelines": [{"id": "eau_prostate_2026"}, {"id": "sfro_recorad_prostate_2025"}],
                   "trial": {"id": "stampede_abiraterone_m0_2022", "pmid": "34953525", "doi": "10.1016/S0140-6736(21)02437-5"}},
        "limitations": ["The figure does not prescribe patient-specific dose or ADT duration.", "Evidence for PSMA-only nodal disease is not treated as equivalent to conventional cN1.", "Fitness, contraindications, regulation, and local protocol still govern treatment."],
    })


def render_primary_rt_m1(root: Path):
    out = root / "public/figures/prostate/hormone-sensitive-and-nmcrpc/03-primary-rt-v2.png"
    fig, grid = setup(
        "Irradier la prostate en M1 : préserver la population de preuve",
        "STAMPEDE bras H · M1 de novo · charge métastatique conventionnelle · RT ajoutée au traitement systémique",
        widths=(0.95, 0.90, 1.15),
    )
    population = panel(fig, grid[1, 0], "1 · QUI CORRESPOND À L’ESSAI ?", title_size=12.2)
    rect(population, 0.08, 0.72, 0.84, 0.17, "M1 DE NOVO", "Maladie métastatique au diagnostic\n— pas une récidive métachrone", P["blue"], P["pale_blue"], 11.5, 8.4)
    rect(population, 0.08, 0.48, 0.84, 0.17, "IMAGERIE CONVENTIONNELLE", "Scanner/IRM + scintigraphie osseuse\nutilisés pour définir la charge", P["teal"], P["pale_teal"], 10.5, 8.2)
    rect(population, 0.08, 0.24, 0.84, 0.17, "FAIBLE CHARGE CHAARTED", "Absence de critère de haut volume :\npas de métastase viscérale et pas ≥4 osseuses\ndont ≥1 hors rachis/pelvis", P["orange"], P["pale_orange"], 10.0, 7.8)
    population.text(0.08, 0.115, "« Faible volume » ne signifie ni maladie\npeu agressive, ni indication de désintensifier\nle traitement systémique.",
                    transform=population.transAxes, fontsize=7.7, weight="bold", color=P["coral"], linespacing=1.25)
    population.text(0.08, 0.025, "Convention de charge : imagerie de l’essai", transform=population.transAxes,
                    fontsize=7.0, color=P["muted"], va="bottom")

    result = panel(fig, grid[1, 1], "2 · SURVIE GLOBALE À 3 ANS", title_size=12.0)
    chart_y, chart_h = 0.35, 0.43
    for frac in (0.25, 0.50, 0.75, 1.00):
        yline = chart_y + chart_h * frac
        result.plot([0.14, 0.90], [yline, yline], transform=result.transAxes,
                    color=P["grid"], linewidth=0.8, zorder=0)
        result.text(0.11, yline, f"{int(frac * 100)}", transform=result.transAxes,
                    ha="right", va="center", fontsize=7.0, color=P["muted"])
    bars = [(0.28, 0.73, "Contrôle", "73 %", P["blue"]),
            (0.60, 0.81, "+ RT prostate", "81 %", P["teal"])]
    for x, fraction, label, value, color in bars:
        result.add_patch(plt.Rectangle((x, chart_y), 0.17, chart_h * fraction,
                                       transform=result.transAxes, facecolor=color, edgecolor="none"))
        result.text(x + 0.085, chart_y + chart_h * fraction + 0.022, value,
                    transform=result.transAxes, ha="center", va="bottom", fontsize=11.0,
                    weight="bold", color=color)
        result.text(x + 0.085, chart_y - 0.035, label, transform=result.transAxes,
                    ha="center", va="top", fontsize=8.4, weight="bold", color=P["charcoal"])
    result.text(0.50, 0.20, "HR 0,68 · IC95 % 0,52–0,90 · p = 0,007",
                transform=result.transAxes, ha="center", fontsize=9.7, weight="bold", color=P["charcoal"])
    result.text(0.50, 0.12, "Sous-groupe faible charge préspecifié", transform=result.transAxes,
                ha="center", fontsize=8.5, weight="bold", color=P["teal"])
    result.text(0.50, 0.025, "Parker et al. · Lancet 2018 · CC BY 4.0", transform=result.transAxes,
                ha="center", fontsize=7.0, color=P["muted"], va="bottom")

    meaning = panel(fig, grid[1, 2], "3 · CE QUE LA FIGURE AUTORISE", title_size=12.0)
    statements = [
        ("AJOUTER", "RT de la prostate au traitement systémique\nchez le M1 de novo faible charge conventionnelle", P["teal"], P["pale_teal"]),
        ("NE PAS SUBSTITUER", "La RT ne remplace ni ADT ni intensification\nsystémique adaptée", P["blue"], P["pale_blue"]),
        ("NE PAS EXTRAPOLER", "Pas de bénéfice de survie démontré\ndans la population M1 non sélectionnée", P["coral"], P["pale_coral"]),
        ("TRACER LE PSMA", "Conserver la catégorie conventionnelle de preuve\net décrire séparément le stade moléculaire", P["orange"], P["pale_orange"]),
    ]
    y = 0.77
    for title, body, color, fill in statements:
        rect(meaning, 0.08, y, 0.84, 0.14, title, body, color, fill, 9.7, 7.9)
        y -= 0.17
    meaning.text(0.08, 0.075, "Bénéfice de population ≠ prescription individuelle automatique.",
                 transform=meaning.transAxes, fontsize=8.8, weight="bold", color=P["coral"])
    meaning.text(0.08, 0.025, "STAMPEDE bras H · EAU 2026", transform=meaning.transAxes,
                 fontsize=7.0, color=P["muted"], va="bottom")
    save(fig, out, {
        "purpose": "Display the prespecified low-burden STAMPEDE Arm H overall-survival result and its applicability limits.",
        "source": {"license": "Original deterministic plot from published aggregate trial values; source article CC BY 4.0",
                   "trial": {"id": "stampede_primary_rt_m1_2018", "pmid": "30355464", "pmcid": "PMC6269599", "doi": "10.1016/S0140-6736(18)32486-3"},
                   "guidelines": [{"id": "eau_prostate_2026"}]},
        "limitations": ["The 3-year percentages are aggregate trial results, not individual prognosis.", "The survival benefit shown is the prespecified low-metastatic-burden subgroup, not the unselected M1 population.", "Metastatic burden was defined by conventional imaging; PSMA stage migration requires explicit handling."],
    })


def main():
    root = cli().root.resolve()
    render_pirads(root)
    render_postop(root)
    render_nodal(root)
    render_cn1(root)
    render_primary_rt_m1(root)


if __name__ == "__main__":
    main()
