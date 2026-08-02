#!/usr/bin/env python3
"""Render a deterministic, explicitly synthetic DVH teaching figure."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.gridspec import GridSpec


PALETTE = {
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
    "pale_orange": "#FCE8C8",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--provenance", type=Path, required=True)
    return parser.parse_args()


def monotone_curve(points: list[tuple[float, float]], dose: np.ndarray) -> np.ndarray:
    x, y = np.asarray(points, dtype=float).T
    curve = np.interp(dose, x, y)
    if np.any(np.diff(curve) > 1e-8):
        raise ValueError("A cumulative DVH must be non-increasing")
    return curve


def style_axis(axis, title: str):
    axis.set_facecolor(PALETTE["panel"])
    axis.set_xlim(0, 66)
    axis.set_ylim(0, 103)
    axis.set_xticks(np.arange(0, 67, 10))
    axis.set_yticks(np.arange(0, 101, 20))
    axis.set_xlabel("Dose (Gy)", fontsize=10.5, weight="bold", color=PALETTE["charcoal"])
    axis.set_ylabel("Volume relatif (%)", fontsize=10.5, weight="bold", color=PALETTE["charcoal"])
    axis.set_title(title, fontsize=14, weight="bold", color=PALETTE["charcoal"], pad=10)
    axis.grid(True, color=PALETTE["grid"], linewidth=0.8, alpha=0.7)
    axis.tick_params(colors=PALETTE["charcoal"], labelsize=9)
    for spine in axis.spines.values():
        spine.set_color(PALETTE["grid"])


def metric_box(axis, y: float, color: str, title: str, detail: str):
    axis.add_patch(
        plt.Rectangle((0.04, y - 0.075), 0.92, 0.13, transform=axis.transAxes, facecolor="#FFFFFF", edgecolor=color, linewidth=1.8)
    )
    axis.text(0.075, y + 0.022, title, transform=axis.transAxes, fontsize=10.8, weight="bold", color=color, va="center")
    axis.text(0.075, y - 0.028, detail, transform=axis.transAxes, fontsize=9.0, color=PALETTE["charcoal"], va="center")


def main() -> None:
    args = parse_args()
    dose = np.linspace(0, 66, 661)

    points = {
        "PTV": [(0, 100), (56.8, 100), (57, 99.4), (59, 98), (60, 95), (61, 70), (62, 25), (63, 0.9), (66, 0)],
        "CTV": [(0, 100), (59.8, 100), (60, 99.3), (60.5, 97), (61.5, 80), (62.5, 30), (63, 0.7), (66, 0)],
        "Rectum": [(0, 100), (15, 94), (25, 82), (37, 48), (40, 41), (46, 28), (52, 12), (60, 2), (66, 0)],
        "Vessie": [(0, 100), (15, 92), (28, 75), (41, 48), (45, 34), (48, 23), (55, 9), (60, 4), (66, 0)],
    }
    curves = {name: monotone_curve(series, dose) for name, series in points.items()}

    figure = plt.figure(figsize=(16, 9), facecolor=PALETTE["paper"])
    grid = GridSpec(2, 3, figure=figure, height_ratios=[0.17, 0.83], width_ratios=[1.05, 1.05, 0.82], hspace=0.20, wspace=0.13)

    header = figure.add_subplot(grid[0, :])
    header.set_facecolor("#20323B")
    header.set_xticks([])
    header.set_yticks([])
    for spine in header.spines.values():
        spine.set_visible(False)
    header.text(0.025, 0.65, "DVH : lire un protocole, pas une courbe isolée", color="white", fontsize=23, weight="bold", va="center")
    header.text(0.025, 0.25, "60 Gy en 20 fractions · courbes pédagogiques synthétiques · aucune donnée patient", color="#BDE7E4", fontsize=11.5, weight="bold", va="center")

    target_axis = figure.add_subplot(grid[1, 0])
    style_axis(target_axis, "A · Couverture des volumes cibles")
    target_axis.plot(dose, curves["PTV"], color=PALETTE["teal"], lw=3.0, label="PTV synthétique")
    target_axis.plot(dose, curves["CTV"], color=PALETTE["blue"], lw=3.0, ls="--", label="CTV synthétique")
    target_axis.axvline(57, color=PALETTE["teal"], lw=1.5, ls=":")
    target_axis.axvline(60, color=PALETTE["blue"], lw=1.5, ls=":")
    target_axis.axhline(99, color=PALETTE["muted"], lw=1.2, ls=(0, (4, 4)))
    target_axis.scatter([57, 60], [99.4, 99.3], color=[PALETTE["teal"], PALETTE["blue"]], s=62, zorder=5, edgecolor="white", linewidth=1)
    target_axis.annotate("PTV V57 ≥ 99 %", (57, 99.4), xytext=(35, 84), textcoords="data", arrowprops={"arrowstyle": "->", "color": PALETTE["teal"]}, color=PALETTE["teal"], fontsize=9.5, weight="bold")
    target_axis.annotate("CTV V60 ≥ 99 %", (60, 99.3), xytext=(42, 70), textcoords="data", arrowprops={"arrowstyle": "->", "color": PALETTE["blue"]}, color=PALETTE["blue"], fontsize=9.5, weight="bold")
    target_axis.legend(loc="lower left", frameon=True, framealpha=0.95, fontsize=9)

    oar_axis = figure.add_subplot(grid[1, 1])
    style_axis(oar_axis, "B · Contraintes OAR du même protocole")
    oar_axis.plot(dose, curves["Rectum"], color=PALETTE["coral"], lw=3.0, label="Rectum synthétique")
    oar_axis.plot(dose, curves["Vessie"], color=PALETTE["orange"], lw=3.0, ls="--", label="Vessie synthétique")
    constraints = [
        (37, 50, PALETTE["coral"], "R V37 ≤ 50 %"),
        (46, 30, PALETTE["coral"], "R V46 ≤ 30 %"),
        (41, 50, PALETTE["orange"], "V V41 ≤ 50 %"),
        (48, 25, PALETTE["orange"], "V V48 ≤ 25 %"),
        (60, 5, PALETTE["orange"], "V V60 ≤ 5 %"),
    ]
    label_offsets = [(2, 7), (1.5, 6), (-14, -12), (1.5, 5), (-13, 8)]
    for (x, y, color, label), (dx, dy) in zip(constraints, label_offsets, strict=True):
        oar_axis.scatter([x], [y], marker="s", s=54, facecolor="white", edgecolor=color, linewidth=2, zorder=6)
        oar_axis.annotate(label, (x, y), xytext=(x + dx, y + dy), fontsize=8.5, color=color, weight="bold", arrowprops={"arrowstyle": "-", "color": color, "lw": 0.9})
    oar_axis.legend(loc="upper right", frameon=True, framealpha=0.95, fontsize=9)

    info = figure.add_subplot(grid[1, 2])
    info.set_facecolor(PALETTE["panel"])
    info.set_xticks([])
    info.set_yticks([])
    for spine in info.spines.values():
        spine.set_color(PALETTE["grid"])
        spine.set_linewidth(1.2)
    info.text(0.06, 0.95, "Repères d’audit", transform=info.transAxes, fontsize=15, weight="bold", color=PALETTE["charcoal"])
    metric_box(info, 0.85, PALETTE["teal"], "PTV", "V57 ≥ 99 % · D1 cm³ ≤ 63 Gy")
    metric_box(info, 0.69, PALETTE["blue"], "CTV", "V60 ≥ 99 %")
    metric_box(info, 0.53, PALETTE["coral"], "Rectum", "V46 ≤ 30 % · V37 ≤ 50 %")
    metric_box(info, 0.37, PALETTE["orange"], "Vessie", "V60 ≤ 5 % · V48 ≤ 25 % · V41 ≤ 50 %")

    info.text(0.06, 0.235, "Le DVH ne montre pas", transform=info.transAxes, fontsize=12.5, weight="bold", color=PALETTE["coral"])
    info.text(
        0.06,
        0.195,
        "• où se situe un sous-dosage ou un point chaud\n"
        "• la continuité spatiale d’une isodose\n"
        "• une erreur de définition de structure",
        transform=info.transAxes,
        fontsize=8.5,
        color=PALETTE["charcoal"],
        linespacing=1.45,
        va="top",
    )
    info.text(
        0.06,
        0.018,
        "Source : RecoRad prostate 2025, §§ 2.6.3.1–2.6.3.2, tableau 5\n"
        "DOI 10.1016/j.canrad.2025.104777 · SYNTHÉTIQUE · AUCUNE DONNÉE PATIENT",
        transform=info.transAxes,
        fontsize=6.9,
        color=PALETTE["muted"],
        linespacing=1.35,
        va="bottom",
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    figure.savefig(args.output, dpi=160, facecolor=figure.get_facecolor())
    plt.close(figure)

    provenance = {
        "schemaVersion": 1,
        "asset": str(args.output),
        "purpose": "Teach cumulative DVH reading for the RecoRad 60 Gy/20-fraction protocol without presenting a patient plan.",
        "source": {
            "id": "sfro_recorad_prostate_2025",
            "title": "Radiothérapie externe des cancers prostatiques : mise à jour 2025",
            "doi": "10.1016/j.canrad.2025.104777",
            "locator": "Sections 2.6.3.1–2.6.3.2 and Table 5",
            "license": "Citation-only synthesis; private full text is not redistributed",
        },
        "data": {
            "status": "synthetic_educational_no_patient_data",
            "doseGy": dose.tolist(),
            "controlPoints": {name: series for name, series in points.items()},
            "interpolation": "piecewise linear, cumulative and monotonically non-increasing",
            "protocolMetrics": {
                "PTV": ["V57 ≥ 99 %", "D1 cm³ ≤ 63 Gy"],
                "CTV": ["V60 ≥ 99 %"],
                "Rectum": ["V46 ≤ 30 %", "V37 ≤ 50 %"],
                "Bladder": ["V60 ≤ 5 %", "V48 ≤ 25 %", "V41 ≤ 50 %"],
            },
        },
        "releaseGate": "needs_review",
        "namedClinicalReviewer": None,
        "limitations": [
            "Curves are synthetic and do not represent a patient, trial cohort or treatment plan.",
            "The D1 cm³ metric is listed separately because it cannot be inferred from a relative-volume curve without total PTV volume.",
            "Spatial dose inspection remains mandatory.",
        ],
    }
    args.provenance.parent.mkdir(parents=True, exist_ok=True)
    args.provenance.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print(json.dumps({"output": str(args.output), "provenance": str(args.provenance)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
