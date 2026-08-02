#!/usr/bin/env python3
"""Render evidence-bounded figures for IBD and prior TURP."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from matplotlib.patches import Ellipse, FancyBboxPatch, Polygon


P = {"paper": "#FFF8E8", "panel": "#FFFCF4", "charcoal": "#24313A", "muted": "#5C666D", "grid": "#D8D5C9",
     "teal": "#007C83", "blue": "#2563A6", "coral": "#C85C4A", "orange": "#D97706",
     "pale_teal": "#DDF3F1", "pale_blue": "#E5EEF8", "pale_coral": "#F8DDD7", "pale_orange": "#FCEBCD"}


def args():
    p = argparse.ArgumentParser(); p.add_argument("--output-dir", type=Path, required=True); return p.parse_args()


def setup(title, subtitle, widths=(1, 1, 1)):
    fig = plt.figure(figsize=(16, 9), facecolor=P["paper"]); grid = GridSpec(2, 3, figure=fig, height_ratios=[0.17, 0.83], width_ratios=widths, hspace=0.16, wspace=0.10)
    h = fig.add_subplot(grid[0, :]); h.set_facecolor("#20323B"); h.set_xticks([]); h.set_yticks([])
    for s in h.spines.values(): s.set_visible(False)
    h.text(0.025, 0.65, title, color="white", fontsize=22.5, weight="bold", va="center"); h.text(0.025, 0.25, subtitle, color="#BDE7E4", fontsize=11.3, weight="bold", va="center")
    return fig, grid


def axis(fig, spec):
    a = fig.add_subplot(spec); a.set_facecolor(P["panel"]); a.set_xticks([]); a.set_yticks([])
    for s in a.spines.values(): s.set_color(P["grid"]); s.set_linewidth(1.2)
    return a


def box(ax, y, title, body, color, fill, h=0.18, fs=8.7):
    ax.add_patch(plt.Rectangle((0.05, y - h), 0.90, h, transform=ax.transAxes, facecolor=fill, edgecolor=color, linewidth=1.6))
    ax.text(0.08, y - 0.045, title, transform=ax.transAxes, fontsize=11.2, weight="bold", color=color, va="center")
    ax.text(0.08, y - 0.085, body, transform=ax.transAxes, fontsize=fs, color=P["charcoal"], va="top", linespacing=1.3)


def render_ibd(out_dir: Path):
    out = out_dir / "02-ibd-v2.png"; prov = out_dir / "02-ibd-v2.provenance.json"
    fig, grid = setup("MICI et RT prostatique : décider dans la zone d’incertitude", "Activité réelle · topographie digestive · limites de la preuve · réduction d’exposition")
    evidence = axis(fig, grid[1, 0]); evidence.text(0.05, 0.94, "CE QUE DIT LA PREUVE", transform=evidence.transAxes, fontsize=14.5, weight="bold", color=P["charcoal"])
    box(evidence, 0.86, "Revue systématique 2023", "12 études rétrospectives · 194 patients ;\nhétérogénéité empêchant une méta-analyse.", P["blue"], P["pale_blue"], fs=8.4)
    box(evidence, 0.62, "Signal rassurant mais fragile", "Toxicité GI sévère tardive rare dans les séries,\nsans pouvoir exclure un sur-risque.", P["teal"], P["pale_teal"], fs=8.4)
    box(evidence, 0.38, "Sous-populations peu représentées", "MICI active · irradiation pelvienne · chirurgie\nantérieure : extrapolation particulièrement prudente.", P["coral"], P["pale_coral"], fs=8.3)
    evidence.text(0.05, 0.105, "Conclusion interdite : « MICI = sûre »\nou « MICI = contre-indication universelle ».", transform=evidence.transAxes, fontsize=9.2, weight="bold", color=P["coral"], linespacing=1.3)
    evidence.text(0.05, 0.025, "Trotta et al., Pract Radiat Oncol 2023", transform=evidence.transAxes, fontsize=7.4, color=P["muted"], va="bottom")

    patient = axis(fig, grid[1, 1]); patient.text(0.05, 0.94, "QUALIFIER LE RISQUE RÉEL", transform=patient.transAxes, fontsize=14.5, weight="bold", color=P["charcoal"])
    fields = [("ACTIVITÉ", "Poussée, symptômes, contrôle actuel", P["coral"], P["pale_coral"]), ("TOPOGRAPHIE DIGESTIVE", "Rectum / grêle en regard des volumes", P["orange"], P["pale_orange"]), ("HISTOIRE", "Chirurgie, complications, toxicités", P["blue"], P["pale_blue"]), ("TRAITEMENTS", "Immunosuppression et coordination gastro", P["teal"], P["pale_teal"])]
    y = 0.84
    for title, body, color, fill in fields:
        box(patient, y, title, body, color, fill, h=0.15, fs=8.5); y -= 0.18
    patient.text(0.05, 0.085, "L’étiquette diagnostique seule ne suffit pas.", transform=patient.transAxes, fontsize=9.4, weight="bold", color=P["charcoal"])
    patient.text(0.05, 0.025, "Décision coordonnée gastro-entérologie–oncologie", transform=patient.transAxes, fontsize=7.2, color=P["muted"], va="bottom")

    rt = axis(fig, grid[1, 2]); rt.text(0.05, 0.94, "RÉDUIRE L’EXPOSITION / SURVEILLER", transform=rt.transAxes, fontsize=11.5, weight="bold", color=P["charcoal"])
    steps = [("1", "Comparer les options", "Bénéfice oncologique, alternatives, activité"), ("2", "Limiter le volume électif", "Seulement si oncologiquement défendable"), ("3", "Planifier contemporain", "IRM, IMRT, IGRT, contours et contraintes"), ("4", "Organiser l’alerte", "Symptôme inhabituel → évaluation coordonnée")]
    y = 0.82
    for n, title, body in steps:
        rt.text(0.09, y, n, transform=rt.transAxes, ha="center", va="center", fontsize=10.5, weight="bold", color="white", bbox={"boxstyle": "circle,pad=0.3", "facecolor": P["teal"], "edgecolor": "none"})
        rt.text(0.16, y + 0.01, title, transform=rt.transAxes, fontsize=11.0, weight="bold", color=P["teal"], va="center")
        rt.text(0.16, y - 0.035, body, transform=rt.transAxes, fontsize=8.5, color=P["charcoal"], va="top")
        if n != "4": rt.annotate("", xy=(0.09, y - 0.14), xytext=(0.09, y - 0.06), xycoords="axes fraction", arrowprops={"arrowstyle": "->", "lw": 1.8, "color": P["grid"]})
        y -= 0.20
    rt.text(0.05, 0.075, "Ni banaliser, ni exclure mécaniquement.", transform=rt.transAxes, fontsize=9.5, weight="bold", color=P["coral"])
    rt.text(0.05, 0.025, "Figure originale · sans donnée patient", transform=rt.transAxes, fontsize=7.2, color=P["muted"], va="bottom")
    fig.savefig(out, dpi=160, facecolor=fig.get_facecolor()); plt.close(fig)
    data = {"schemaVersion": 1, "asset": str(out), "purpose": "Convert limited heterogeneous evidence into an explicit patient-qualification and mitigation workflow.",
            "source": {"license": "Original deterministic synthesis; no third-party figure reused", "reviews": [{"id": "trotta_ibd_prostate_rt_2023", "doi": "10.1016/j.prro.2023.04.006", "pmid": "37100389"}], "guidelines": [{"id": "sfro_recorad_prostate_2025"}, {"id": "eau_prostate_2026"}]},
            "releaseGate": "needs_review", "namedClinicalReviewer": None,
            "limitations": ["The evidence base is retrospective and heterogeneous.", "Active IBD, pelvic nodal RT and prior IBD surgery were underrepresented.", "No individual toxicity probability is displayed or implied."]}
    prov.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf8")


def render_turp(out_dir: Path):
    out = out_dir / "03-turp-v2.png"; prov = out_dir / "03-turp-v2.provenance.json"
    fig, grid = setup("Après TURP : cartographier avant de choisir la modalité", "Anatomie résiduelle schématique · facteurs de toxicité · audit pré-RT", widths=(0.9, 1.1, 1.1))
    anat = axis(fig, grid[1, 0]); anat.text(0.05, 0.94, "ANATOMIE À RECONSTRUIRE", transform=anat.transAxes, fontsize=13.5, weight="bold", color=P["charcoal"])
    bladder = FancyBboxPatch((0.30, 0.67), 0.40, 0.17, boxstyle="round,pad=0.02,rounding_size=0.08", transform=anat.transAxes, facecolor=P["pale_blue"], edgecolor=P["blue"], linewidth=2)
    anat.add_patch(bladder); anat.text(0.50, 0.755, "VESSIE", transform=anat.transAxes, ha="center", va="center", fontsize=10.5, weight="bold", color=P["blue"])
    prostate = Ellipse((0.50, 0.48), 0.58, 0.33, transform=anat.transAxes, facecolor=P["pale_teal"], edgecolor=P["teal"], linewidth=2.2); anat.add_patch(prostate)
    cavity = Ellipse((0.50, 0.52), 0.22, 0.19, transform=anat.transAxes, facecolor="white", edgecolor=P["coral"], linewidth=2.2, linestyle="--"); anat.add_patch(cavity)
    anat.plot([0.50, 0.50], [0.69, 0.26], transform=anat.transAxes, color=P["orange"], linewidth=4, solid_capstyle="round")
    sphincter = Polygon([[0.42, 0.26], [0.58, 0.26], [0.54, 0.21], [0.46, 0.21]], closed=True, transform=anat.transAxes, facecolor=P["pale_coral"], edgecolor=P["coral"], linewidth=1.8); anat.add_patch(sphincter)
    anat.text(0.73, 0.52, "Cavité TURP", transform=anat.transAxes, fontsize=9.5, weight="bold", color=P["coral"]); anat.annotate("", xy=(0.60, 0.52), xytext=(0.72, 0.52), xycoords="axes fraction", arrowprops={"arrowstyle": "->", "color": P["coral"], "lw": 1.7})
    anat.text(0.72, 0.38, "Urètre", transform=anat.transAxes, fontsize=9.5, weight="bold", color=P["orange"]); anat.annotate("", xy=(0.51, 0.38), xytext=(0.70, 0.38), xycoords="axes fraction", arrowprops={"arrowstyle": "->", "color": P["orange"], "lw": 1.7})
    anat.text(0.70, 0.23, "Sphincter", transform=anat.transAxes, fontsize=9.5, weight="bold", color=P["coral"]); anat.annotate("", xy=(0.57, 0.24), xytext=(0.69, 0.23), xycoords="axes fraction", arrowprops={"arrowstyle": "->", "color": P["coral"], "lw": 1.7})
    anat.text(0.50, 0.105, "Schéma conceptuel, non à l’échelle.\nCavité réelle à identifier sur l’imagerie.", transform=anat.transAxes, ha="center", fontsize=7.9, weight="bold", color=P["charcoal"], linespacing=1.3)
    anat.text(0.05, 0.025, "Aucun contour patient représenté", transform=anat.transAxes, fontsize=7.2, color=P["muted"], va="bottom")

    risk = axis(fig, grid[1, 1]); risk.text(0.05, 0.94, "FACTEURS ASSOCIÉS À LA TOXICITÉ", transform=risk.transAxes, fontsize=13.1, weight="bold", color=P["charcoal"])
    items = [("Fonction urinaire initiale", "Symptômes et dysfonction persistante"), ("Geste", "Nombre de résections et compte rendu"), ("Chronologie", "Délai TURP–radiothérapie"), ("Anatomie", "Volume prostatique et volume de cavité"), ("Dose / modalité", "Dose moyenne à la cavité et fractionnement")]
    y = 0.84
    for title, body in items:
        risk.add_patch(plt.Rectangle((0.06, y - 0.115), 0.88, 0.13, transform=risk.transAxes, facecolor=P["pale_orange"], edgecolor=P["orange"], linewidth=1.4))
        risk.text(0.09, y - 0.025, title, transform=risk.transAxes, fontsize=10.2, weight="bold", color=P["orange"])
        risk.text(0.09, y - 0.065, body, transform=risk.transAxes, fontsize=8.4, color=P["charcoal"]); y -= 0.145
    risk.text(0.05, 0.085, "Signal dominant de la revue : toxicité urinaire tardive,\nnotamment hématurie — sans seuil universel exportable.", transform=risk.transAxes, fontsize=8.8, weight="bold", color=P["coral"], linespacing=1.3)
    risk.text(0.05, 0.025, "Neerhut et al., Urol Oncol 2024 · 11 études", transform=risk.transAxes, fontsize=7.2, color=P["muted"], va="bottom")

    audit = axis(fig, grid[1, 2]); audit.text(0.05, 0.94, "AUDIT AVANT MODALITÉ RT", transform=audit.transAxes, fontsize=13.5, weight="bold", color=P["charcoal"])
    boxes = [("1 · DOCUMENTS", "Date, indication, compte rendu, complications", P["blue"], P["pale_blue"]), ("2 · FONCTION", "IPSS/symptômes, débit, continence, infections", P["teal"], P["pale_teal"]), ("3 · IMAGERIE", "Cavité TURP · urètre · sphincter · défaut tissulaire", P["orange"], P["pale_orange"]), ("4 · COMPARER", "Modalité, fractionnement, calendrier et information", P["coral"], P["pale_coral"])]
    y = 0.84
    for title, body, color, fill in boxes:
        box(audit, y, title, body, color, fill, h=0.15, fs=8.5); y -= 0.18
    audit.text(0.05, 0.085, "TURP = facteur de sélection, pas exclusion automatique.", transform=audit.transAxes, fontsize=9.1, weight="bold", color=P["charcoal"])
    audit.text(0.05, 0.025, "Figure originale · synthèse sans donnée patient", transform=audit.transAxes, fontsize=7.2, color=P["muted"], va="bottom")
    fig.savefig(out, dpi=160, facecolor=fig.get_facecolor()); plt.close(fig)
    data = {"schemaVersion": 1, "asset": str(out), "purpose": "Separate a conceptual post-TURP anatomy map from evidence-based urinary-risk factors and the pre-RT audit.",
            "source": {"license": "Original deterministic synthesis; no third-party figure reused", "reviews": [{"id": "neerhut_turp_hypofractionation_2024", "doi": "10.1016/j.urolonc.2024.02.011", "pmid": "38503591"}], "guidelines": [{"id": "sfro_recorad_prostate_2025"}, {"id": "eau_prostate_2026"}]},
            "releaseGate": "needs_review", "namedClinicalReviewer": None,
            "limitations": ["The anatomy panel is conceptual and not a contouring reference.", "The review is a scoping review and does not provide a universal safe interval, cavity dose or modality rule.", "No patient urinary-risk probability is shown."]}
    prov.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf8")


def main():
    a = args(); a.output_dir.mkdir(parents=True, exist_ok=True); render_ibd(a.output_dir); render_turp(a.output_dir)


if __name__ == "__main__": main()
