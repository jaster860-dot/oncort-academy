#!/usr/bin/env python3
"""Render the prostate-versus-pelvis IGRT matching problem on a public CT."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.gridspec import GridSpec
from scipy.ndimage import gaussian_filter, shift

from render_prostate_oar_from_dicom import draw_orientation, load_ct_series, load_masks


P = {"paper": "#FFF8E8", "panel": "#FFFCF4", "charcoal": "#24313A", "muted": "#5C666D", "grid": "#D8D5C9",
     "teal": "#007C83", "blue": "#2563A6", "coral": "#C85C4A", "orange": "#D97706", "pale_teal": "#DDF3F1", "pale_blue": "#E5EEF8", "pale_coral": "#F8DDD7"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ct-dir", type=Path, required=True); parser.add_argument("--rtstruct", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True); parser.add_argument("--provenance", type=Path, required=True)
    parser.add_argument("--subject", default="Prostate-AEC-126")
    return parser.parse_args()


def panel(ax, ct, reference, displaced, title, emphasis):
    ax.imshow(ct, cmap="gray", vmin=0, vmax=1)
    ax.contour(reference, levels=[0.5], colors=[P["teal"]], linewidths=2.8)
    ax.contour(displaced, levels=[0.5], colors=[P["coral"]], linewidths=2.4, linestyles="--")
    ax.set_title(title, fontsize=13.5, weight="bold", color=P["charcoal"], pad=10); ax.axis("off")
    draw_orientation(ax, {"A": (0.5, 0.97), "P": (0.5, 0.03), "R": (0.03, 0.5), "L": (0.97, 0.5)})
    ax.text(0.50, 0.08, emphasis, transform=ax.transAxes, ha="center", fontsize=9.1, weight="bold", color=P["charcoal"],
            bbox={"facecolor": "white", "edgecolor": P["grid"], "alpha": 0.92, "pad": 4})


def main() -> None:
    a = parse_args(); slices, volume, sop_to_index, positions, spacing, _ = load_ct_series(a.ct_dir)
    masks = load_masks(a.rtstruct, slices, sop_to_index, positions, spacing)
    prostate_voxels = np.argwhere(masks["Prostate"] > 0); axial_index = int(np.rint(prostate_voxels[:, 0].mean()))
    prostate = masks["Prostate"][axial_index].astype(bool)
    # A visible, explicitly synthetic soft-tissue displacement. It is not measured patient motion.
    displacement = (-8, 10)
    correction = (8, -10)
    displaced = shift(prostate.astype(float), shift=displacement, order=0, mode="constant", cval=0) > 0.5
    # Smoothed threshold retains the major pelvic osseous envelope and avoids
    # teaching from a noisy trabecular edge map.
    bone = gaussian_filter((volume[axial_index] > 200).astype(float), sigma=5) > 0.25
    corrected_bone = shift(bone.astype(float), shift=correction, order=0, mode="constant", cval=0) > 0.5
    low, high = -160.0, 240.0; ct = np.clip((volume[axial_index] - low) / (high - low), 0, 1)

    fig = plt.figure(figsize=(16, 9), facecolor=P["paper"])
    grid = GridSpec(2, 3, figure=fig, height_ratios=[0.17, 0.83], width_ratios=[1.0, 1.0, 0.92], hspace=0.18, wspace=0.12)
    header = fig.add_subplot(grid[0, :]); header.set_facecolor("#20323B"); header.set_xticks([]); header.set_yticks([])
    for spine in header.spines.values(): spine.set_visible(False)
    header.text(0.025, 0.65, "IGRT : prostate et pelvis n’ont pas le même repère", color="white", fontsize=22.5, weight="bold", va="center")
    header.text(0.025, 0.25, "Anatomie CT réelle · déplacement prostatique simulé · règle d’action explicite", color="#BDE7E4", fontsize=11.5, weight="bold", va="center")

    bone_ax = fig.add_subplot(grid[1, 0]); panel(bone_ax, ct, prostate, displaced, "A · REPÈRE PELVIEN / OSSEUX", "Os alignés ≠ prostate nécessairement alignée")
    prostate_ax = fig.add_subplot(grid[1, 1])
    prostate_ax.imshow(ct, cmap="gray", vmin=0, vmax=1)
    prostate_ax.contour(prostate, levels=[0.5], colors=[P["teal"]], linewidths=3.0)
    prostate_ax.contour(prostate, levels=[0.5], colors=[P["coral"]], linewidths=2.0, linestyles="--")
    prostate_ax.contour(bone, levels=[0.5], colors=[P["blue"]], linewidths=1.4)
    prostate_ax.contour(corrected_bone, levels=[0.5], colors=[P["orange"]], linewidths=1.6, linestyles="--")
    prostate_ax.set_title("B · APRÈS RECALAGE PROSTATIQUE", fontsize=13.5, weight="bold", color=P["charcoal"], pad=10)
    prostate_ax.axis("off"); draw_orientation(prostate_ax, {"A": (0.5, 0.97), "P": (0.5, 0.03), "R": (0.03, 0.5), "L": (0.97, 0.5)})
    prostate_ax.text(0.50, 0.08, "Cible alignée ; repère osseux potentiellement décalé", transform=prostate_ax.transAxes, ha="center", fontsize=9.1, weight="bold", color=P["charcoal"], bbox={"facecolor": "white", "edgecolor": P["grid"], "alpha": 0.92, "pad": 4})
    prostate_ax.text(0.50, 0.88, "os : bleu = plan · orange = après correction", transform=prostate_ax.transAxes, ha="center", fontsize=8.6, weight="bold", color=P["charcoal"], bbox={"facecolor": "white", "edgecolor": P["grid"], "alpha": 0.9, "pad": 3})

    info = fig.add_subplot(grid[1, 2]); info.set_facecolor(P["panel"]); info.set_xticks([]); info.set_yticks([])
    for spine in info.spines.values(): spine.set_color(P["grid"]); spine.set_linewidth(1.2)
    info.text(0.05, 0.95, "Si les corrections divergent", transform=info.transAxes, fontsize=14.5, weight="bold", color=P["charcoal"])
    rows = [
        (0.82, "1 · Identifier", "Quel volume doit être protégé par\nchaque recalage ?", P["blue"], P["pale_blue"]),
        (0.61, "2 · Comparer", "Correction osseuse pelvienne versus\ncorrection prostatique.", P["teal"], P["pale_teal"]),
        (0.40, "3 · Appliquer la règle locale", "Tolérance → nouvelle image, correction,\nrepositionnement ou interruption.", P["coral"], P["pale_coral"]),
    ]
    for y, title, body, color, fill in rows:
        info.add_patch(plt.Rectangle((0.05, y - 0.12), 0.90, 0.17, transform=info.transAxes, facecolor=fill, edgecolor=color, linewidth=1.6))
        info.text(0.08, y + 0.005, title, transform=info.transAxes, fontsize=11.1, weight="bold", color=color, va="center")
        info.text(0.08, y - 0.04, body, transform=info.transAxes, fontsize=8.8, color=P["charcoal"], va="top", linespacing=1.3)
    info.text(0.05, 0.22, "Puis contrôler l’intrafraction", transform=info.transAxes, fontsize=11.7, weight="bold", color=P["orange"])
    info.text(0.05, 0.175, "Le mouvement continue après l’image initiale,\nsurtout si la séance est longue.", transform=info.transAxes, fontsize=9.0, color=P["charcoal"], linespacing=1.35, va="top")
    info.text(0.05, 0.09, "Déplacement = scénario simulé ;\nni mouvement mesuré, ni tolérance.", transform=info.transAxes, fontsize=8.0, weight="bold", color=P["coral"], linespacing=1.2, va="top")
    info.text(0.05, 0.012, "NCI IDC Prostate-AEC-126 · CC BY 4.0 · RecoRad 2025 · ESTRO-ACROP 2019", transform=info.transAxes, fontsize=6.3, color=P["muted"], va="bottom")

    a.output.parent.mkdir(parents=True, exist_ok=True); fig.savefig(a.output, dpi=160, facecolor=fig.get_facecolor()); plt.close(fig)
    provenance = {
        "schemaVersion": 1, "asset": str(a.output), "purpose": "Explain the different reference frames for prostate and pelvic-node IGRT without presenting synthetic displacement as measured motion.",
        "source": {"repository": "NCI Imaging Data Commons / The Cancer Imaging Archive", "collection": "Prostate-Anatomical-Edge-Cases", "subject": a.subject, "license": "CC BY 4.0", "doi": "10.7937/QSTF-ST65", "guidelines": [{"id": "sfro_recorad_prostate_2025", "locator": "IGRT section"}, {"id": "estro_acrop_igrt_2019", "doi": "10.1016/j.radonc.2019.08.027"}]},
        "transformations": {"ctWindowHU": [low, high], "axialSliceIndex": axial_index, "referenceContour": "Clinically used manual prostate RTSTRUCT contour.", "displacedContour": "Synthetic translation of -8 rows and +10 columns solely for conceptual teaching; not patient motion and not a tolerance.", "bonyEnvelope": "CT values above 200 HU smoothed with a five-pixel Gaussian kernel and thresholded at 0.25 for a readable major-bone outline.", "targetMatchIllustration": "Inverse synthetic translation is applied to the derived bony outline to show the reference-frame trade-off; it is not a delivered couch correction."},
        "releaseGate": "needs_review", "namedClinicalReviewer": None,
        "limitations": ["No CBCT or measured setup error is displayed.", "The displacement magnitude is illustrative and must not be interpreted as an action threshold.", "A local protocol must define match order, tolerances and actions."],
    }
    a.provenance.parent.mkdir(parents=True, exist_ok=True); a.provenance.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8")


if __name__ == "__main__": main()
