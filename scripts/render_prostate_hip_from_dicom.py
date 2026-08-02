#!/usr/bin/env python3
"""Render a hip-prosthesis planning figure from a public edge-case CT."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pydicom
from matplotlib.gridspec import GridSpec
from scipy.ndimage import label

from render_prostate_oar_from_dicom import add_contours, draw_orientation, load_ct_series, load_masks


P = {"paper": "#FFF8E8", "panel": "#FFFCF4", "charcoal": "#24313A", "muted": "#5C666D", "grid": "#D8D5C9",
     "teal": "#007C83", "blue": "#2563A6", "coral": "#C85C4A", "orange": "#D97706",
     "pale_teal": "#DDF3F1", "pale_blue": "#E5EEF8", "pale_coral": "#F8DDD7", "pale_orange": "#FCEBCD"}


def args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(); parser.add_argument("--ct-dir", type=Path, required=True); parser.add_argument("--rtstruct", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True); parser.add_argument("--provenance", type=Path, required=True); parser.add_argument("--subject", default="Prostate-AEC-012")
    return parser.parse_args()


def step(ax, y, title, body, color, fill):
    ax.add_patch(plt.Rectangle((0.05, y - 0.12), 0.90, 0.17, transform=ax.transAxes, facecolor=fill, edgecolor=color, linewidth=1.6))
    ax.text(0.08, y + 0.005, title, transform=ax.transAxes, fontsize=11.1, weight="bold", color=color, va="center")
    ax.text(0.08, y - 0.04, body, transform=ax.transAxes, fontsize=8.5, color=P["charcoal"], va="top", linespacing=1.3)


def main():
    a = args(); slices, volume, sop_to_index, positions, spacing, _ = load_ct_series(a.ct_dir); masks = load_masks(a.rtstruct, slices, sop_to_index, positions, spacing, required_names=("Prostate", "Bladder", "Rectum"))
    prostate_slices = np.where(masks["Prostate"].reshape(len(slices), -1).any(axis=1))[0]
    axial_index = int(max(prostate_slices, key=lambda z: int((volume[z] > 1800).sum())))
    hu = volume[axial_index]
    components, n = label(hu > 1800)
    if not n: raise RuntimeError("No high-density implant component found on selected prostate-level slice")
    sizes = np.bincount(components.ravel()); sizes[0] = 0; implant = components == int(np.argmax(sizes))

    fig = plt.figure(figsize=(16, 9), facecolor=P["paper"]); grid = GridSpec(2, 3, figure=fig, height_ratios=[0.17, 0.83], width_ratios=[1.0, 1.0, 0.92], hspace=0.18, wspace=0.12)
    header = fig.add_subplot(grid[0, :]); header.set_facecolor("#20323B"); header.set_xticks([]); header.set_yticks([])
    for spine in header.spines.values(): spine.set_visible(False)
    header.text(0.025, 0.65, "Prothèse de hanche : l’erreur peut traverser toute la chaîne", color="white", fontsize=22.5, weight="bold", va="center")
    header.text(0.025, 0.25, "Vrai scanner dé-identifié avec artefact métallique · deux fenêtrages · gates de planification", color="#BDE7E4", fontsize=11.3, weight="bold", va="center")

    soft = fig.add_subplot(grid[1, 0]); soft.imshow(np.clip((hu + 160) / 400, 0, 1), cmap="gray", vmin=0, vmax=1)
    add_contours(soft, {name: masks[name][axial_index] for name in ("Prostate", "Bladder", "Rectum")}, linewidth=2.4)
    soft.set_title("A · FENÊTRE TISSUS MOUS", fontsize=13.6, weight="bold", color=P["charcoal"], pad=10); soft.axis("off")
    draw_orientation(soft, {"A": (0.5, 0.97), "P": (0.5, 0.03), "R": (0.03, 0.5), "L": (0.97, 0.5)})
    soft.text(0.50, -0.06, "Les stries dégradent la lecture des tissus et des contours.", transform=soft.transAxes, fontsize=8.5, color=P["muted"], ha="center")

    metal = fig.add_subplot(grid[1, 1]); metal.imshow(np.clip((hu + 200) / 3200, 0, 1), cmap="gray", vmin=0, vmax=1)
    metal.contour(implant, levels=[0.5], colors=[P["orange"]], linewidths=2.6)
    metal.contour(masks["Prostate"][axial_index], levels=[0.5], colors=[P["teal"]], linewidths=2.3)
    metal.set_title("B · FENÊTRE LARGE / IMPLANT", fontsize=13.6, weight="bold", color=P["charcoal"], pad=10); metal.axis("off")
    draw_orientation(metal, {"A": (0.5, 0.97), "P": (0.5, 0.03), "R": (0.03, 0.5), "L": (0.97, 0.5)})
    metal.text(0.50, 0.10, "orange : composant haute densité dérivé du CT", transform=metal.transAxes, ha="center", fontsize=8.6, weight="bold", color=P["orange"], bbox={"facecolor": "white", "edgecolor": P["orange"], "alpha": 0.92, "pad": 4})
    metal.text(0.50, -0.06, "Le fenêtrage aide à voir l’implant ; il ne corrige pas le calcul de dose.", transform=metal.transAxes, fontsize=8.3, color=P["muted"], ha="center")

    info = fig.add_subplot(grid[1, 2]); info.set_facecolor(P["panel"]); info.set_xticks([]); info.set_yticks([])
    for spine in info.spines.values(): spine.set_color(P["grid"]); spine.set_linewidth(1.2)
    info.text(0.05, 0.95, "Audit en quatre gates", transform=info.transAxes, fontsize=15, weight="bold", color=P["charcoal"])
    step(info, 0.83, "1 · ACQUISITION", "Réduction d’artefact si disponible ;\nimagerie complémentaire recalée.", P["blue"], P["pale_blue"])
    step(info, 0.62, "2 · DENSITÉ / ALGORITHME", "Matériau, HU/densités et calcul\nvalidés selon la commission locale.", P["teal"], P["pale_teal"])
    step(info, 0.41, "3 · FAISCEAUX / PLANS", "Limiter la traversée si possible, sans\nsacrifier couverture ni OAR.", P["orange"], P["pale_orange"])
    step(info, 0.20, "4 · QA / ROBUSTESSE", "Comparer plans, vérifier délivrance et\ndocumenter la stratégie retenue.", P["coral"], P["pale_coral"])
    info.text(0.05, 0.025, "NCI IDC Prostate-AEC-012 · CC BY 4.0\nPrincipes : RecoRad 2025 + AAPM TG-63", transform=info.transAxes, fontsize=7.2, color=P["muted"], va="bottom", linespacing=1.25)

    a.output.parent.mkdir(parents=True, exist_ok=True); fig.savefig(a.output, dpi=160, facecolor=fig.get_facecolor()); plt.close(fig)
    rt = pydicom.dcmread(a.rtstruct, stop_before_pixels=True, specific_tags=["SeriesInstanceUID"])
    provenance = {"schemaVersion": 1, "asset": str(a.output), "purpose": "Show true CT metal artifact and the separate acquisition, density, beam and QA controls it triggers.",
                  "source": {"repository": "NCI Imaging Data Commons / The Cancer Imaging Archive", "collection": "Prostate-Anatomical-Edge-Cases", "subject": a.subject, "license": "CC BY 4.0", "doi": "10.7937/QSTF-ST65", "ctSeriesInstanceUID": str(slices[0].SeriesInstanceUID), "rtstructSeriesInstanceUID": str(rt.SeriesInstanceUID), "guidelines": [{"id": "sfro_recorad_prostate_2025", "locator": "Planning special situations"}, {"id": "aapm_tg63_hip_prostheses_2003", "doi": "10.1118/1.1565113"}]},
                  "transformations": {"axialSliceIndex": axial_index, "softTissueWindowHU": [-160, 240], "wideWindowHU": [-200, 3000], "implantHighlight": "Largest connected component above 1800 HU; display aid only, not a validated prosthesis contour."},
                  "releaseGate": "needs_review", "namedClinicalReviewer": None,
                  "limitations": ["The second panel is a wide window, not metal-artifact correction.", "The derived high-density outline is not a material assignment or treatment-planning structure.", "No dose distribution, beam arrangement or calculation accuracy is shown."]}
    a.provenance.parent.mkdir(parents=True, exist_ok=True); a.provenance.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8")


if __name__ == "__main__": main()
