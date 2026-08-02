#!/usr/bin/env python3
"""Render source-bounded decision figures for pelvic RT and dose intensification."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec


P = {"paper": "#FFF8E8", "panel": "#FFFCF4", "charcoal": "#24313A", "muted": "#5C666D", "grid": "#D8D5C9",
     "teal": "#007C83", "blue": "#2563A6", "coral": "#C85C4A", "orange": "#D97706",
     "pale_teal": "#DDF3F1", "pale_blue": "#E5EEF8", "pale_coral": "#F8DDD7", "pale_orange": "#FCEBCD"}


def args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    return parser.parse_args()


def header(fig, grid, title: str, subtitle: str):
    ax = fig.add_subplot(grid[0, :]); ax.set_facecolor("#20323B"); ax.set_xticks([]); ax.set_yticks([])
    for spine in ax.spines.values(): spine.set_visible(False)
    ax.text(0.025, 0.65, title, color="white", fontsize=22.5, weight="bold", va="center")
    ax.text(0.025, 0.25, subtitle, color="#BDE7E4", fontsize=11.4, weight="bold", va="center")


def plain_axis(fig, spec):
    ax = fig.add_subplot(spec); ax.set_facecolor(P["panel"]); ax.set_xticks([]); ax.set_yticks([])
    for spine in ax.spines.values(): spine.set_color(P["grid"]); spine.set_linewidth(1.2)
    return ax


def box(ax, xy, wh, title, body, color, fill, *, title_size=11.5, body_size=8.8):
    x, y = xy; w, h = wh
    ax.add_patch(plt.Rectangle((x, y), w, h, transform=ax.transAxes, facecolor=fill, edgecolor=color, linewidth=1.7))
    ax.text(x + 0.035 * w, y + h - 0.24 * h, title, transform=ax.transAxes, fontsize=title_size, weight="bold", color=color, va="center")
    ax.text(x + 0.035 * w, y + h - 0.43 * h, body, transform=ax.transAxes, fontsize=body_size, color=P["charcoal"], va="top", linespacing=1.35)


def render_pelvis(out_dir: Path):
    output = out_dir / "05-pelvis-v2.png"; provenance_path = out_dir / "05-pelvis-v2.provenance.json"
    fig = plt.figure(figsize=(16, 9), facecolor=P["paper"])
    grid = GridSpec(2, 3, figure=fig, height_ratios=[0.17, 0.83], width_ratios=[0.95, 1.1, 1.1], hspace=0.16, wspace=0.10)
    header(fig, grid, "Volumes RT : trois décisions à ne pas fusionner", "Extension locale · risque ganglionnaire · divergence des recommandations")

    local = plain_axis(fig, grid[1, 0]); local.text(0.05, 0.94, "1 · CIBLE LOCALE", transform=local.transAxes, fontsize=15, weight="bold", color=P["charcoal"])
    box(local, (0.05, 0.69), (0.90, 0.17), "Faible / intermédiaire favorable", "Prostate seule dans la synthèse\nRecoRad 2025.", P["blue"], P["pale_blue"])
    box(local, (0.05, 0.45), (0.90, 0.17), "Défavorable / haut risque", "Prostate + base des vésicules selon\nle risque d’atteinte.", P["teal"], P["pale_teal"])
    box(local, (0.05, 0.21), (0.90, 0.17), "Extension T3b", "Vésicules séminales dans leur totalité.", P["coral"], P["pale_coral"])
    local.text(0.05, 0.105, "La cible locale répond à l’extension anatomique ;\nelle ne décide pas à elle seule du pelvis.", transform=local.transAxes, fontsize=9.0, weight="bold", color=P["coral"], linespacing=1.35)
    local.text(0.05, 0.025, "Synthèse RecoRad prostate 2025", transform=local.transAxes, fontsize=7.5, color=P["muted"], va="bottom")

    gate = plain_axis(fig, grid[1, 1]); gate.text(0.05, 0.94, "2 · GATE PELVIEN cN0", transform=gate.transAxes, fontsize=15, weight="bold", color=P["charcoal"])
    gate.text(0.08, 0.82, "Statut cN0 confirmé", transform=gate.transAxes, fontsize=12.0, weight="bold", color=P["blue"], ha="left")
    gate.annotate("", xy=(0.50, 0.73), xytext=(0.50, 0.79), xycoords="axes fraction", arrowprops={"arrowstyle": "->", "lw": 2, "color": P["grid"]})
    box(gate, (0.08, 0.56), (0.84, 0.16), "ESTIMER", "Risque ganglionnaire + extension +\nméthode de stadification.", P["teal"], P["pale_teal"])
    gate.annotate("", xy=(0.50, 0.48), xytext=(0.50, 0.55), xycoords="axes fraction", arrowprops={"arrowstyle": "->", "lw": 2, "color": P["grid"]})
    box(gate, (0.08, 0.30), (0.84, 0.17), "METTRE EN BALANCE", "Bénéfice attendu · toxicités · règle du centre\n· préférences et contexte clinique.", P["orange"], P["pale_orange"])
    gate.annotate("", xy=(0.50, 0.22), xytext=(0.50, 0.29), xycoords="axes fraction", arrowprops={"arrowstyle": "->", "lw": 2, "color": P["grid"]})
    box(gate, (0.08, 0.07), (0.84, 0.14), "TRACER EN RCP", "Inclure / ne pas inclure le pelvis + justification.", P["coral"], P["pale_coral"], body_size=8.5)

    evidence = plain_axis(fig, grid[1, 2]); evidence.text(0.05, 0.94, "3 · PREUVES NON CONCORDANTES", transform=evidence.transAxes, fontsize=12.8, weight="bold", color=P["charcoal"])
    box(evidence, (0.05, 0.68), (0.90, 0.18), "RecoRad 2025", "Intermédiaire défavorable : option sans bénéfice\nclairement démontré. Haut risque : favorable notamment\nsi risque ganglionnaire estimé > 20 %.", P["teal"], P["pale_teal"], body_size=8.3)
    box(evidence, (0.05, 0.43), (0.90, 0.18), "CCAFU / EAU", "Question non résolue ou données insuffisantes\npour une systématisation du pelvis cN0.", P["orange"], P["pale_orange"], body_size=8.5)
    box(evidence, (0.05, 0.19), (0.90, 0.17), "TEP-PSMA négatif", "N’exclut pas une maladie microscopique — mais\nne rend pas l’irradiation pelvienne obligatoire.", P["coral"], P["pale_coral"], body_size=8.5)
    evidence.text(0.05, 0.095, "Décision pelvienne séparée, explicite et protocolisée.", transform=evidence.transAxes, fontsize=9.4, weight="bold", color=P["blue"])
    evidence.text(0.05, 0.025, "Figure originale · aucune anatomie ou donnée patient simulée", transform=evidence.transAxes, fontsize=7.2, color=P["muted"], va="bottom")

    fig.savefig(output, dpi=160, facecolor=fig.get_facecolor()); plt.close(fig)
    provenance = {"schemaVersion": 1, "asset": str(output), "purpose": "Separate local target definition from the disputed cN0 pelvic irradiation decision.",
                  "source": {"license": "Original deterministic synthesis; no third-party figure reused", "guidelines": [{"id": "sfro_recorad_prostate_2025", "locator": "Target-volume and pelvic-irradiation sections"}, {"id": "ccafu_localised_2024_2026", "locator": "Localised high-risk disease summary only; full-text boundary retained"}, {"id": "eau_prostate_2026", "locator": "Definitive radiotherapy / pelvic nodal irradiation"}]},
                  "releaseGate": "needs_review", "namedClinicalReviewer": None,
                  "limitations": ["This is a decision-support synthesis, not a contouring atlas.", "The figure does not replace the full recommendations or local protocol.", "No universal pelvic indication is inferred from PSMA imaging alone."]}
    provenance_path.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8")


def render_boost(out_dir: Path):
    output = out_dir / "06-boost-v2.png"; provenance_path = out_dir / "06-boost-v2.provenance.json"
    fig = plt.figure(figsize=(16, 9), facecolor=P["paper"])
    grid = GridSpec(2, 3, figure=fig, height_ratios=[0.17, 0.83], hspace=0.16, wspace=0.10)
    header(fig, grid, "Intensification locale : ne pas confondre trois stratégies", "Cible · prérequis · bénéfice démontré · compromis fonctionnel")

    columns = [
        ("ESCALADE HOMOGÈNE", P["blue"], P["pale_blue"], [
            ("Cible", "Toute la prostate"), ("Forme", "Augmentation homogène de dose"),
            ("Bénéfice principal", "Contrôle biochimique"), ("Garde-fou", "Contraintes OAR + ADT si indiquée")]),
        ("BOOST FOCAL EXTERNE", P["teal"], P["pale_teal"], [
            ("Cible", "Lésion dominante définie par IRM"), ("Forme", "IMRT + IGRT, sous contraintes OAR"),
            ("Bénéfice principal", "Contrôle biochimique"), ("Non démontré ici", "Gain de survie sans métastase / globale")]),
        ("BOOST CURIETHÉRAPIQUE", P["coral"], P["pale_coral"], [
            ("Cible", "Intensification intraprostatique"), ("Prérequis", "Sélection urinaire, anatomie, expertise"),
            ("Bénéfice principal", "Contrôle biochimique"), ("Compromis", "Toxicité génito-urinaire accrue")]),
    ]
    for i, (title, color, fill, rows) in enumerate(columns):
        ax = plain_axis(fig, grid[1, i]); ax.text(0.50, 0.93, title, transform=ax.transAxes, ha="center", fontsize=14.0, weight="bold", color=color)
        y = 0.78
        for label, body in rows:
            box(ax, (0.07, y - 0.11), (0.86, 0.15), label, body, color, fill, title_size=10.8, body_size=8.7)
            y -= 0.18
        ax.text(0.50, 0.095, "≠ simple variante interchangeable", transform=ax.transAxes, ha="center", fontsize=9.1, weight="bold", color=P["charcoal"])
        if i == 1:
            ax.text(0.50, 0.045, "Pas de DIL vérifiée → pas de cible de boost focal", transform=ax.transAxes, ha="center", fontsize=8.2, weight="bold", color=P["coral"])

    fig.text(0.50, 0.055, "Toujours nommer : cible · technique · bénéfice visé · priorité aux contraintes OAR", ha="center", fontsize=10.3, weight="bold", color=P["charcoal"])
    fig.text(0.50, 0.025, "Synthèse originale sans donnée patient · RecoRad prostate 2025 + recommandations citées dans la leçon", ha="center", fontsize=7.4, color=P["muted"])
    fig.savefig(output, dpi=160, facecolor=fig.get_facecolor()); plt.close(fig)
    provenance = {"schemaVersion": 1, "asset": str(output), "purpose": "Compare whole-gland escalation, MRI-defined external focal boost, and brachytherapy boost without implying equivalence.",
                  "source": {"license": "Original deterministic synthesis; no third-party figure reused", "guidelines": [{"id": "sfro_recorad_prostate_2025", "locator": "Dose escalation, focal boost and brachytherapy sections"}, {"id": "ccafu_localised_2024_2026", "locator": "Metadata/summary boundary retained"}, {"id": "eau_prostate_2026", "locator": "Definitive radiotherapy"}]},
                  "releaseGate": "needs_review", "namedClinicalReviewer": None,
                  "limitations": ["No dose distribution or patient lesion is displayed.", "The figure does not claim overall-survival benefit.", "Technique selection remains patient- and centre-dependent."]}
    provenance_path.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8")


def main():
    a = args(); a.output_dir.mkdir(parents=True, exist_ok=True); render_pelvis(a.output_dir); render_boost(a.output_dir)


if __name__ == "__main__": main()
