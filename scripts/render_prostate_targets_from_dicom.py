#!/usr/bin/env python3
"""Render target-volume concepts anchored to a real public simulation CT."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.gridspec import GridSpec
from scipy.ndimage import binary_dilation

from render_prostate_oar_from_dicom import load_ct_series, load_masks


P = {
    "paper": "#FFF8E8",
    "panel": "#FFFCF4",
    "charcoal": "#24313A",
    "muted": "#5C666D",
    "grid": "#D8D5C9",
    "teal": "#007C83",
    "blue": "#2563A6",
    "coral": "#C85C4A",
    "orange": "#D97706",
    "pale_teal": "#DDF3F1",
    "pale_blue": "#E5EEF8",
    "pale_coral": "#F8DDD7",
}


def args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ct-dir", type=Path, required=True)
    parser.add_argument("--rtstruct", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--provenance", type=Path, required=True)
    parser.add_argument("--subject", default="Prostate-AEC-126")
    return parser.parse_args()


def orientation(ax):
    for label, x, y in [("A", 0.5, 0.97), ("P", 0.5, 0.03), ("R", 0.03, 0.5), ("L", 0.97, 0.5)]:
        ax.text(x, y, label, transform=ax.transAxes, ha="center", va="center", fontsize=8.5, weight="bold", color="white", bbox={"boxstyle": "round,pad=0.16", "facecolor": P["charcoal"], "edgecolor": "none", "alpha": 0.8})


def card(ax, y: float, color: str, fill: str, title: str, lines: list[str]):
    ax.add_patch(plt.Rectangle((0.04, y - 0.13), 0.92, 0.18, transform=ax.transAxes, facecolor=fill, edgecolor=color, linewidth=1.8))
    ax.text(0.07, y + 0.015, title, transform=ax.transAxes, color=color, fontsize=12.2, weight="bold", va="center")
    ax.text(0.07, y - 0.035, "\n".join(lines), transform=ax.transAxes, color=P["charcoal"], fontsize=8.9, linespacing=1.35, va="top")


def main() -> None:
    a = args()
    slices, volume, sop_to_index, positions, spacing, _ = load_ct_series(a.ct_dir)
    masks = load_masks(a.rtstruct, slices, sop_to_index, positions, spacing)
    present = {
        name: masks[name].reshape(masks[name].shape[0], -1).any(axis=1)
        for name in ("Prostate", "Bladder", "Rectum")
    }
    common_slices = np.where(present["Prostate"] & present["Bladder"] & present["Rectum"])[0]
    if not len(common_slices):
        raise RuntimeError("No axial slice contains prostate, bladder and rectum contours together")
    # A central slice of the shared range makes every colour in the legend visible.
    axial_index = int(common_slices[len(common_slices) // 2])
    prostate = masks["Prostate"][axial_index].astype(bool)
    bladder = masks["Bladder"][axial_index].astype(bool)
    rectum = masks["Rectum"][axial_index].astype(bool)

    margin_pixels = max(4, int(round(5 / float(np.mean(spacing)))))
    uncertainty_band = binary_dilation(prostate, iterations=margin_pixels)

    low, high = -160.0, 240.0
    ct = np.clip((volume[axial_index] - low) / (high - low), 0, 1)
    rows, cols = np.where(prostate)
    pad = 70
    r0, r1 = max(0, rows.min() - pad), min(ct.shape[0], rows.max() + pad)
    c0, c1 = max(0, cols.min() - pad), min(ct.shape[1], cols.max() + pad)

    fig = plt.figure(figsize=(16, 9), facecolor=P["paper"])
    grid = GridSpec(2, 3, figure=fig, height_ratios=[0.17, 0.83], width_ratios=[1.0, 1.0, 0.88], hspace=0.18, wspace=0.12)
    header = fig.add_subplot(grid[0, :])
    header.set_facecolor("#20323B")
    header.set_xticks([])
    header.set_yticks([])
    for spine in header.spines.values():
        spine.set_visible(False)
    header.text(0.025, 0.65, "GTV–CTV–PTV : séparer anatomie, risque et incertitude", color="white", fontsize=22.5, weight="bold", va="center")
    header.text(0.025, 0.25, "Anatomie réelle dé-identifiée · principes de construction · aucune marge prescrite", color="#BDE7E4", fontsize=11.5, weight="bold", va="center")

    context = fig.add_subplot(grid[1, 0])
    context.imshow(ct, cmap="gray", vmin=0, vmax=1)
    context.contour(prostate, levels=[0.5], colors=[P["teal"]], linewidths=2.8)
    if bladder.any():
        context.contour(bladder, levels=[0.5], colors=[P["blue"]], linewidths=2.0)
    if rectum.any():
        context.contour(rectum, levels=[0.5], colors=[P["coral"]], linewidths=2.0)
    context.set_title("A · Anatomie observée", fontsize=14, weight="bold", color=P["charcoal"], pad=10)
    context.axis("off")
    orientation(context)
    context.text(0.03, -0.06, "Turquoise : prostate anatomique · bleu : vessie · corail : rectum", transform=context.transAxes, fontsize=8.7, color=P["muted"])

    concept = fig.add_subplot(grid[1, 1])
    concept.imshow(ct[r0:r1, c0:c1], cmap="gray", vmin=0, vmax=1)
    concept.contour(prostate[r0:r1, c0:c1], levels=[0.5], colors=[P["teal"]], linewidths=3.0)
    concept.contour(uncertainty_band[r0:r1, c0:c1], levels=[0.5], colors=[P["blue"]], linewidths=2.5, linestyles="--")
    concept.set_title("B · Principe géométrique du PTV", fontsize=14, weight="bold", color=P["charcoal"], pad=10)
    concept.axis("off")
    concept.text(0.04, 0.10, "Contour anatomique réel", transform=concept.transAxes, color=P["teal"], fontsize=10, weight="bold", bbox={"facecolor": "white", "edgecolor": P["teal"], "alpha": 0.92, "pad": 4})
    concept.text(0.50, 0.88, "Bande d’incertitude illustrée\n(non prescriptive)", transform=concept.transAxes, color=P["blue"], fontsize=9.2, weight="bold", linespacing=1.3, ha="center", bbox={"facecolor": "white", "edgecolor": P["blue"], "alpha": 0.92, "pad": 4})
    concept.text(0.50, -0.06, "Fonction du PTV illustrée — aucun PTV patient n’est représenté.", transform=concept.transAxes, fontsize=8.5, color=P["muted"], ha="center")

    info = fig.add_subplot(grid[1, 2])
    info.set_facecolor(P["panel"])
    info.set_xticks([])
    info.set_yticks([])
    for spine in info.spines.values():
        spine.set_color(P["grid"])
        spine.set_linewidth(1.2)
    info.text(0.05, 0.95, "Construction correcte", transform=info.transAxes, fontsize=15, weight="bold", color=P["charcoal"])
    card(info, 0.84, P["coral"], P["pale_coral"], "GTV / DIL éventuel", ["Seulement si une lésion ou extension", "macroscopique est réellement identifiée."])
    card(info, 0.61, P["teal"], P["pale_teal"], "CTV : risque anatomique", ["Tissus à risque définis par indication, stade,", "IRM et protocole — pas une dilatation automatique."])
    card(info, 0.38, P["blue"], P["pale_blue"], "PTV : incertitudes", ["Contourage, repositionnement, mouvement", "et IGRT du workflow réel — pas de maladie en plus."])
    info.text(0.05, 0.19, "Non représenté sur ce cas", transform=info.transAxes, fontsize=12.2, weight="bold", color=P["orange"])
    info.text(0.05, 0.15, "Vésicules, extension extracapsulaire, pelvis\net GTV-DIL : ils dépendent du scénario clinique.", transform=info.transAxes, fontsize=9.0, color=P["charcoal"], linespacing=1.35, va="top")
    info.text(0.05, 0.035, "Anatomie : NCI IDC/TCIA Prostate-AEC-126 · CC BY 4.0\nPrincipes : RecoRad 2025 + ESTRO-ACROP 2018", transform=info.transAxes, fontsize=7.5, color=P["muted"], linespacing=1.35, va="bottom")

    a.output.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(a.output, dpi=160, facecolor=fig.get_facecolor())
    plt.close(fig)

    provenance = {
        "schemaVersion": 1,
        "asset": str(a.output),
        "purpose": "Distinguish anatomical structure, CTV biological definition and PTV uncertainty without fabricating a patient target volume.",
        "source": {
            "repository": "NCI Imaging Data Commons / The Cancer Imaging Archive",
            "collection": "Prostate-Anatomical-Edge-Cases",
            "subject": a.subject,
            "license": "CC BY 4.0",
            "doi": "10.7937/QSTF-ST65",
            "ctSeriesInstanceUID": str(slices[0].SeriesInstanceUID),
            "guidelines": [
                {"id": "sfro_recorad_prostate_2025", "locator": "Target volume and margin sections"},
                {"id": "estro_acrop_primary_contouring_2018", "doi": "10.1016/j.radonc.2018.01.014"},
            ],
        },
        "transformations": {
            "ctWindowHU": [low, high],
            "axialSliceIndex": axial_index,
            "prostateContour": "Clinically used manual RTSTRUCT contour from the source collection.",
            "blueBand": "Illustrative binary dilation used only to explain the uncertainty function of a PTV; no margin value is displayed or recommended.",
        },
        "releaseGate": "needs_review",
        "namedClinicalReviewer": None,
        "limitations": [
            "The source RTSTRUCT contains an anatomic prostate contour, not a verified CTV/PTV for this lesson.",
            "No patient CTV, PTV, seminal vesicle target, pelvic nodal target or DIL is claimed or displayed.",
            "The uncertainty band is deliberately non-prescriptive.",
        ],
    }
    a.provenance.parent.mkdir(parents=True, exist_ok=True)
    a.provenance.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print(json.dumps({"output": str(a.output), "provenance": str(a.provenance)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
