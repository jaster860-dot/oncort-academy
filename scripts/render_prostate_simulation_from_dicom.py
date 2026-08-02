#!/usr/bin/env python3
"""Render a simulation-quality figure anchored to a public planning CT."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.gridspec import GridSpec

from render_prostate_oar_from_dicom import COLORS, add_contours, draw_orientation, load_ct_series, load_masks


P = {
    "paper": "#FFF8E8", "panel": "#FFFCF4", "charcoal": "#24313A", "muted": "#5C666D",
    "grid": "#D8D5C9", "teal": "#007C83", "blue": "#2563A6", "coral": "#C85C4A",
    "orange": "#D97706", "pale_teal": "#DDF3F1", "pale_blue": "#E5EEF8", "pale_coral": "#F8DDD7",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ct-dir", type=Path, required=True)
    parser.add_argument("--rtstruct", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--provenance", type=Path, required=True)
    parser.add_argument("--subject", default="Prostate-AEC-126")
    return parser.parse_args()


def step(ax, y: float, n: str, title: str, body: str, color: str, fill: str) -> None:
    ax.add_patch(plt.Rectangle((0.05, y - 0.13), 0.90, 0.17, transform=ax.transAxes,
                               facecolor=fill, edgecolor=color, linewidth=1.6))
    ax.text(0.085, y - 0.045, n, transform=ax.transAxes, ha="center", va="center", color="white",
            fontsize=10.5, weight="bold", bbox={"boxstyle": "circle,pad=0.28", "facecolor": color, "edgecolor": "none"})
    ax.text(0.15, y + 0.005, title, transform=ax.transAxes, color=color, fontsize=11.3, weight="bold", va="center")
    ax.text(0.15, y - 0.04, body, transform=ax.transAxes, color=P["charcoal"], fontsize=8.5,
            va="top", linespacing=1.32)


def main() -> None:
    a = parse_args()
    slices, volume, sop_to_index, positions, spacing, z_spacing = load_ct_series(a.ct_dir)
    masks = load_masks(a.rtstruct, slices, sop_to_index, positions, spacing)
    present = {name: masks[name].reshape(masks[name].shape[0], -1).any(axis=1) for name in ("Prostate", "Bladder", "Rectum")}
    common = np.where(present["Prostate"] & present["Bladder"] & present["Rectum"])[0]
    axial_index = int(common[len(common) // 2])
    sagittal_column = int(np.rint(np.argwhere(masks["Prostate"] > 0)[:, 2].mean()))
    low, high = -160.0, 240.0
    display = np.clip((volume - low) / (high - low), 0, 1)

    fig = plt.figure(figsize=(16, 9), facecolor=P["paper"])
    grid = GridSpec(2, 3, figure=fig, height_ratios=[0.17, 0.83], width_ratios=[1.0, 1.0, 0.92], hspace=0.18, wspace=0.12)
    header = fig.add_subplot(grid[0, :])
    header.set_facecolor("#20323B"); header.set_xticks([]); header.set_yticks([])
    for spine in header.spines.values(): spine.set_visible(False)
    header.text(0.025, 0.65, "Simulation : obtenir une géométrie représentative", color="white", fontsize=22.5, weight="bold", va="center")
    header.text(0.025, 0.25, "Scanner réel dé-identifié · contrôle anatomique · reproductibilité à démontrer dans le workflow", color="#BDE7E4", fontsize=11.3, weight="bold", va="center")

    axial = fig.add_subplot(grid[1, 0])
    axial.imshow(display[axial_index], cmap="gray", vmin=0, vmax=1)
    add_contours(axial, {name: masks[name][axial_index] for name in ("Prostate", "Bladder", "Rectum")}, linewidth=2.5)
    axial.set_title("A · Contrôle axial", fontsize=14, weight="bold", color=P["charcoal"], pad=10)
    axial.axis("off"); draw_orientation(axial, {"A": (0.5, 0.97), "P": (0.5, 0.03), "R": (0.03, 0.5), "L": (0.97, 0.5)})
    axial.text(0.50, -0.06, "Turquoise : prostate · bleu : vessie · corail : rectum", transform=axial.transAxes,
               fontsize=8.6, color=P["muted"], ha="center")

    sagittal = fig.add_subplot(grid[1, 1])
    sagittal.imshow(display[:, :, sagittal_column], cmap="gray", vmin=0, vmax=1, origin="lower", aspect=spacing[0] / z_spacing)
    add_contours(sagittal, {name: masks[name][:, :, sagittal_column] for name in ("Prostate", "Bladder", "Rectum")}, linewidth=2.0)
    sagittal.set_title("B · Contrôle sagittal", fontsize=14, weight="bold", color=P["charcoal"], pad=10)
    sagittal.axis("off"); draw_orientation(sagittal, {"S": (0.5, 0.97), "I": (0.5, 0.03), "A": (0.03, 0.5), "P": (0.97, 0.5)})
    sagittal.text(0.50, -0.06, "Une coupe favorable ne prouve pas la répétabilité inter-fraction.", transform=sagittal.transAxes,
                  fontsize=8.5, color=P["muted"], ha="center")

    info = fig.add_subplot(grid[1, 2]); info.set_facecolor(P["panel"]); info.set_xticks([]); info.set_yticks([])
    for spine in info.spines.values(): spine.set_color(P["grid"]); spine.set_linewidth(1.2)
    info.text(0.05, 0.95, "Gates avant contourage", transform=info.transAxes, fontsize=15, weight="bold", color=P["charcoal"])
    step(info, 0.84, "1", "PRÉPARATION", "Vessie confortable ; rectum aussi peu\ndistendu que possible.", P["blue"], P["pale_blue"])
    step(info, 0.63, "2", "GÉOMÉTRIE", "Position confortable, couverture complète\net anatomie jugée représentative.", P["teal"], P["pale_teal"])
    step(info, 0.42, "3", "FUSION VÉRIFIÉE", "Scanner–IRM contrôlés à l’apex, la base\net autour des repères utilisés.", P["orange"], "#FCEBCD")
    info.text(0.05, 0.225, "Si l’anatomie est non représentative", transform=info.transAxes, fontsize=11.8, weight="bold", color=P["coral"])
    info.text(0.05, 0.185, "Corriger la préparation → réévaluer → répéter\nl’acquisition si nécessaire.", transform=info.transAxes, fontsize=9.2, color=P["charcoal"], linespacing=1.35, va="top")
    info.text(0.05, 0.095, "L’IGRT corrige surtout un positionnement ;\nelle ne corrige pas une déformation majeure.", transform=info.transAxes, fontsize=8.4, weight="bold", color=P["coral"], linespacing=1.25, va="top")
    info.text(0.05, 0.014, "NCI IDC/TCIA Prostate-AEC-126 · CC BY 4.0 · RecoRad 2025", transform=info.transAxes, fontsize=6.8, color=P["muted"], va="bottom")

    a.output.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(a.output, dpi=160, facecolor=fig.get_facecolor()); plt.close(fig)
    provenance = {
        "schemaVersion": 1, "asset": str(a.output),
        "purpose": "Show which anatomical checks a planning CT supports, while separating a single representative snapshot from demonstrated reproducibility.",
        "source": {"repository": "NCI Imaging Data Commons / The Cancer Imaging Archive", "collection": "Prostate-Anatomical-Edge-Cases", "subject": a.subject, "license": "CC BY 4.0", "doi": "10.7937/QSTF-ST65", "guidelines": [{"id": "sfro_recorad_prostate_2025", "locator": "Simulation and preparation sections"}]},
        "transformations": {"ctWindowHU": [low, high], "axialSliceIndex": axial_index, "sagittalColumn": sagittal_column, "contours": "Clinically used manual RTSTRUCT contours from the source collection."},
        "releaseGate": "needs_review", "namedClinicalReviewer": None,
        "limitations": ["One planning CT cannot demonstrate inter-fraction reproducibility.", "The figure does not set a patient-specific bladder or rectal threshold.", "The displayed anatomy is not a contouring atlas."],
    }
    a.provenance.parent.mkdir(parents=True, exist_ok=True)
    a.provenance.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8")


if __name__ == "__main__": main()
