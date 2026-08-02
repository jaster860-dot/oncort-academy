#!/usr/bin/env python3
"""Render a reproducible educational prostate/OAR figure from public CT + RTSTRUCT.

This renderer is intentionally narrow: one public, de-identified pelvic CT series and
its clinically used structure set. It is not a diagnostic viewer or a contouring
atlas. The output is a teaching figure with explicit provenance and release gating.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pydicom
from matplotlib.gridspec import GridSpec
from PIL import Image, ImageDraw


COLORS = {
    "Prostate": "#007C83",
    "Bladder": "#2563A6",
    "Rectum": "#C85C4A",
    "Femur_Head_L": "#D97706",
    "Femur_Head_R": "#D97706",
}

DISPLAY_NAMES = {
    "Prostate": "Prostate",
    "Bladder": "Vessie",
    "Rectum": "Rectum",
    "Femur_Head_L": "Tête fémorale gauche",
    "Femur_Head_R": "Tête fémorale droite",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ct-dir", type=Path, required=True)
    parser.add_argument("--rtstruct", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--provenance", type=Path, required=True)
    parser.add_argument("--subject", default="Prostate-AEC-126")
    return parser.parse_args()


def load_ct_series(ct_dir: Path):
    files = sorted(path for path in ct_dir.glob("*.dcm") if path.is_file())
    if not files or len(files) > 400:
        raise ValueError(f"Expected 1-400 CT instances, found {len(files)}")

    slices = []
    for path in files:
        dataset = pydicom.dcmread(path)
        if dataset.get("Modality") != "CT":
            continue
        slices.append(dataset)

    if not slices:
        raise ValueError("No CT instances found")

    slices.sort(key=lambda ds: float(ds.ImagePositionPatient[2]))
    rows, columns = int(slices[0].Rows), int(slices[0].Columns)
    if rows * columns * len(slices) > 100_000_000:
        raise ValueError("Decoded volume exceeds the bounded 100-million-voxel limit")

    orientation = np.asarray(slices[0].ImageOrientationPatient, dtype=float)
    if not np.allclose(orientation, [1, 0, 0, 0, 1, 0], atol=0.02):
        raise ValueError(f"Renderer currently requires near-standard axial orientation, got {orientation.tolist()}")

    volume = np.empty((len(slices), rows, columns), dtype=np.float32)
    sop_to_index = {}
    positions = []
    for index, dataset in enumerate(slices):
        if int(dataset.Rows) != rows or int(dataset.Columns) != columns:
            raise ValueError("Inconsistent CT matrix dimensions")
        pixels = dataset.pixel_array.astype(np.float32)
        slope = float(dataset.get("RescaleSlope", 1.0))
        intercept = float(dataset.get("RescaleIntercept", 0.0))
        volume[index] = pixels * slope + intercept
        sop_to_index[str(dataset.SOPInstanceUID)] = index
        positions.append(np.asarray(dataset.ImagePositionPatient, dtype=float))

    pixel_spacing = np.asarray(slices[0].PixelSpacing, dtype=float)
    z_positions = np.asarray([position[2] for position in positions])
    z_spacing = float(np.median(np.diff(z_positions)))
    return slices, volume, sop_to_index, positions, pixel_spacing, z_spacing


def contour_to_pixels(points: np.ndarray, origin: np.ndarray, orientation: np.ndarray, spacing: np.ndarray):
    row_direction = orientation[:3]
    column_direction = orientation[3:]
    delta = points - origin
    columns = delta @ row_direction / spacing[1]
    rows = delta @ column_direction / spacing[0]
    return np.column_stack([columns, rows])


def load_masks(rtstruct_path: Path, slices, sop_to_index, positions, spacing, required_names=None):
    structure = pydicom.dcmread(rtstruct_path)
    if structure.get("Modality") != "RTSTRUCT":
        raise ValueError("The supplied structure set is not RTSTRUCT")

    roi_names = {
        int(item.ROINumber): str(item.ROIName)
        for item in structure.StructureSetROISequence
    }
    shape = (len(slices), int(slices[0].Rows), int(slices[0].Columns))
    masks = {name: np.zeros(shape, dtype=np.uint8) for name in COLORS}
    orientation = np.asarray(slices[0].ImageOrientationPatient, dtype=float)
    z_positions = np.asarray([position[2] for position in positions])

    for roi_contour in structure.ROIContourSequence:
        name = roi_names.get(int(roi_contour.ReferencedROINumber))
        if name not in masks or "ContourSequence" not in roi_contour:
            continue
        for contour in roi_contour.ContourSequence:
            points = np.asarray(contour.ContourData, dtype=float).reshape(-1, 3)
            if len(points) < 3:
                continue
            slice_index = None
            if "ContourImageSequence" in contour and contour.ContourImageSequence:
                referenced_uid = str(contour.ContourImageSequence[0].ReferencedSOPInstanceUID)
                slice_index = sop_to_index.get(referenced_uid)
            if slice_index is None:
                slice_index = int(np.argmin(np.abs(z_positions - float(points[:, 2].mean()))))

            polygon = contour_to_pixels(points, positions[slice_index], orientation, spacing)
            canvas = Image.fromarray(masks[name][slice_index], mode="L")
            draw = ImageDraw.Draw(canvas)
            draw.polygon([tuple(point) for point in polygon], fill=1)
            masks[name][slice_index] = np.asarray(canvas, dtype=np.uint8)

    required = set(masks) if required_names is None else set(required_names)
    unknown_required = required.difference(masks)
    if unknown_required:
        raise ValueError(f"Unknown required contours: {sorted(unknown_required)}")
    missing = [name for name in required if not masks[name].any()]
    if missing:
        raise ValueError(f"Missing expected contours: {missing}")
    return masks


def add_contours(ax, masks_2d: dict[str, np.ndarray], *, linewidth: float = 2.2):
    for name, mask in masks_2d.items():
        if mask.any():
            ax.contour(mask, levels=[0.5], colors=[COLORS[name]], linewidths=linewidth)


def draw_orientation(ax, labels: dict[str, tuple[float, float]]):
    for label, (x, y) in labels.items():
        ax.text(
            x,
            y,
            label,
            transform=ax.transAxes,
            ha="center",
            va="center",
            fontsize=9,
            weight="bold",
            color="white",
            bbox={"boxstyle": "round,pad=0.18", "facecolor": "#24313A", "edgecolor": "none", "alpha": 0.78},
        )


def main() -> None:
    args = parse_args()
    slices, volume, sop_to_index, positions, spacing, z_spacing = load_ct_series(args.ct_dir)
    masks = load_masks(args.rtstruct, slices, sop_to_index, positions, spacing)

    prostate_indices = np.argwhere(masks["Prostate"] > 0)
    if prostate_indices.size == 0:
        raise ValueError("The prostate contour is empty")
    axial_index, sagittal_column = np.rint(prostate_indices.mean(axis=0)[[0, 2]]).astype(int)

    low, high = -160.0, 240.0
    display = np.clip((volume - low) / (high - low), 0, 1)

    figure = plt.figure(figsize=(16, 9), facecolor="#FFF8E8")
    grid = GridSpec(2, 3, figure=figure, height_ratios=[0.16, 0.84], width_ratios=[1.05, 1.05, 0.9], hspace=0.06, wspace=0.10)

    title_ax = figure.add_subplot(grid[0, :])
    title_ax.set_facecolor("#20323B")
    title_ax.set_xticks([])
    title_ax.set_yticks([])
    for spine in title_ax.spines.values():
        spine.set_visible(False)
    title_ax.text(0.025, 0.64, "OAR : définir avant de mesurer", color="white", fontsize=24, weight="bold", va="center")
    title_ax.text(0.025, 0.25, "Vraie coupe de scanner de simulation · contours cliniques dé-identifiés", color="#BDE7E4", fontsize=12, weight="bold", va="center")

    axial_ax = figure.add_subplot(grid[1, 0])
    axial_ax.imshow(display[axial_index], cmap="gray", vmin=0, vmax=1)
    add_contours(axial_ax, {name: mask[axial_index] for name, mask in masks.items()})
    axial_ax.set_title("Coupe axiale — niveau prostatique", fontsize=14, weight="bold", color="#24313A", pad=10)
    axial_ax.axis("off")
    draw_orientation(axial_ax, {"A": (0.5, 0.97), "P": (0.5, 0.03), "R": (0.03, 0.5), "L": (0.97, 0.5)})

    sagittal_ax = figure.add_subplot(grid[1, 1])
    sagittal_ax.imshow(display[:, :, sagittal_column], cmap="gray", vmin=0, vmax=1, origin="lower", aspect=spacing[0] / z_spacing)
    add_contours(sagittal_ax, {name: mask[:, :, sagittal_column] for name, mask in masks.items()}, linewidth=1.8)
    sagittal_ax.set_title("Reformatage sagittal — même cas", fontsize=14, weight="bold", color="#24313A", pad=10)
    sagittal_ax.axis("off")
    draw_orientation(sagittal_ax, {"S": (0.5, 0.97), "I": (0.5, 0.03), "A": (0.03, 0.5), "P": (0.97, 0.5)})

    info_ax = figure.add_subplot(grid[1, 2])
    info_ax.set_facecolor("#FFFCF4")
    info_ax.set_xticks([])
    info_ax.set_yticks([])
    for spine in info_ax.spines.values():
        spine.set_color("#D8D5C9")
        spine.set_linewidth(1.2)

    info_ax.text(0.07, 0.94, "Structures superposées", fontsize=15, weight="bold", color="#24313A", transform=info_ax.transAxes)
    legend_items = ["Prostate", "Bladder", "Rectum", "Femur_Head_L", "Femur_Head_R"]
    y = 0.865
    for name in legend_items:
        info_ax.plot([0.08, 0.17], [y, y], color=COLORS[name], lw=4, transform=info_ax.transAxes, solid_capstyle="round")
        info_ax.text(0.21, y, DISPLAY_NAMES[name], fontsize=11.5, weight="bold", color="#24313A", va="center", transform=info_ax.transAxes)
        y -= 0.07

    info_ax.text(0.07, 0.48, "Ce que montre la figure", fontsize=14, weight="bold", color="#007C83", transform=info_ax.transAxes)
    info_ax.text(
        0.07,
        0.435,
        "• la relation spatiale réelle entre cible et OAR\n"
        "• l’effet du niveau de coupe sur les volumes visibles\n"
        "• la nécessité de définir chaque structure avant le DVH",
        fontsize=10.7,
        color="#24313A",
        linespacing=1.55,
        va="top",
        transform=info_ax.transAxes,
    )

    info_ax.text(0.07, 0.245, "Limite pédagogique", fontsize=14, weight="bold", color="#C85C4A", transform=info_ax.transAxes)
    info_ax.text(
        0.07,
        0.205,
        "Cas unique, non destiné à apprendre les limites de\n"
        "contourage. La définition exacte des OAR et les seuils\n"
        "dosimétriques restent liés au protocole identifié.",
        fontsize=10.4,
        color="#24313A",
        linespacing=1.45,
        va="top",
        transform=info_ax.transAxes,
    )

    info_ax.text(
        0.07,
        0.015,
        "Source : NCI Imaging Data Commons / TCIA\n"
        f"{args.subject} · CC BY 4.0 · DOI 10.7937/QSTF-ST65\n"
        "Contours manuels utilisés cliniquement",
        fontsize=7.7,
        color="#5C666D",
        linespacing=1.35,
        va="bottom",
        transform=info_ax.transAxes,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    figure.savefig(args.output, dpi=160, facecolor=figure.get_facecolor())
    plt.close(figure)

    provenance = {
        "schemaVersion": 1,
        "asset": str(args.output),
        "purpose": "Educational prostate/OAR spatial relationship; not a contouring atlas.",
        "source": {
            "repository": "NCI Imaging Data Commons / The Cancer Imaging Archive",
            "collection": "Prostate-Anatomical-Edge-Cases",
            "subject": args.subject,
            "license": "CC BY 4.0",
            "doi": "10.7937/QSTF-ST65",
            "ctSeriesInstanceUID": str(slices[0].SeriesInstanceUID),
        },
        "rtstruct": {
            "seriesInstanceUID": str(pydicom.dcmread(args.rtstruct, stop_before_pixels=True, specific_tags=["SeriesInstanceUID"]).SeriesInstanceUID),
            "structures": list(COLORS),
            "contourProvenance": "Manual contours used clinically for radiation treatment planning, as described by the collection custodians.",
        },
        "transformations": {
            "ctWindowHU": [low, high],
            "axialSliceIndex": int(axial_index),
            "sagittalColumnIndex": int(sagittal_column),
            "resampling": "No interpolation for axial image; sagittal display is a direct orthogonal array reformat.",
            "overlay": "RTSTRUCT polygons rasterized deterministically in CT patient coordinates.",
        },
        "releaseGate": "reviewed_by_named_clinician",
        "namedClinicalReviewer": "Sami Frikha",
        "clinicalReviewDate": "2026-08-02",
        "limitations": [
            "Single public de-identified case.",
            "Not a consensus contouring atlas.",
            "No dose data and no protocol-specific thresholds are shown.",
        ],
    }
    args.provenance.parent.mkdir(parents=True, exist_ok=True)
    args.provenance.write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print(json.dumps({"output": str(args.output), "provenance": str(args.provenance)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
