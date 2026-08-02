#!/usr/bin/env python3
"""Render four content-specific prostate teaching figures as deterministic SVG.

The layouts are deliberately different because the teaching questions differ:
eligibility + treatment duration, pharmacology comparison, treatment selection,
and trial-endpoint interpretation.  All statements are bounded by the source
content already attached to each lesson.
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FIG = ROOT / "public" / "figures" / "prostate"

BG = "#FFF8E8"
INK = "#24313A"
TEAL = "#007C83"
TEAL_PALE = "#DDF3F1"
BLUE = "#2563A6"
BLUE_PALE = "#E5EEF8"
ORANGE = "#D97706"
ORANGE_PALE = "#FCE8C8"
CORAL = "#C85C4A"
CORAL_PALE = "#F8DDD7"
WHITE = "#FFFFFF"
MUTED = "#65717A"
LINE = "#D8D5C9"


def esc(text: str) -> str:
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def text(x, y, value, size=18, weight=500, fill=INK, anchor="start", spacing=0):
    return (
        f'<text x="{x}" y="{y}" font-family="Arial, Helvetica, sans-serif" '
        f'font-size="{size}" font-weight="{weight}" fill="{fill}" '
        f'text-anchor="{anchor}" letter-spacing="{spacing}">{esc(value)}</text>'
    )


def multiline(x, y, lines, size=18, weight=500, fill=INK, line_height=24, anchor="start"):
    tspans = "".join(
        f'<tspan x="{x}" dy="{0 if i == 0 else line_height}">{esc(line)}</tspan>'
        for i, line in enumerate(lines)
    )
    return (
        f'<text x="{x}" y="{y}" font-family="Arial, Helvetica, sans-serif" '
        f'font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{tspans}</text>'
    )


def rect(x, y, w, h, fill=WHITE, stroke=LINE, sw=2, rx=18):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'


def base(title_value: str, label: str, desc: str):
    return [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1376" height="768" viewBox="0 0 1376 768" role="img" aria-labelledby="title desc">',
        f'<title id="title">{esc(title_value)}</title>',
        f'<desc id="desc">{esc(desc)}</desc>',
        '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#24313A"/></marker></defs>',
        f'<rect width="1376" height="768" fill="{BG}"/>',
        f'<rect width="18" height="768" fill="{TEAL}"/>',
        text(58, 38, "ONCORT ACADEMY · PROSTATE", 14, 800, TEAL, spacing=1.8),
        rect(58, 51, 340, 32, TEAL_PALE, TEAL_PALE, 0, 16),
        text(76, 73, label.upper(), 14, 800, TEAL, spacing=.7),
        text(58, 122, title_value, 30, 800, INK),
    ]


def footer(parts, source):
    parts += [
        rect(58, 700, 1260, 42, INK, INK, 0, 12),
        text(78, 727, source, 13, 700, WHITE),
        text(1298, 727, "SYNTHÈSE ÉDUCATIVE · DONNÉES AGRÉGÉES", 12, 700, "#BBD8D2", "end"),
        "</svg>",
    ]


def highrisk():
    p = base(
        "Haut risque M0 : reproduire la population avant d’intensifier",
        "Filtre d’éligibilité + durées",
        "Algorithme STAMPEDE M0 distinguant cN1 conventionnel et cN0 avec au moins deux facteurs, puis montrant les durées d’ADT et d’abiratérone.",
    )
    p += [
        rect(58, 148, 468, 520, WHITE, TEAL, 3, 20),
        text(82, 181, "1 · POPULATION DE L’ESSAI", 15, 800, TEAL, spacing=.8),
        rect(82, 198, 420, 54, BLUE_PALE, BLUE, 2, 14),
        text(292, 231, "M0 EN IMAGERIE CONVENTIONNELLE", 17, 800, BLUE, "middle"),
        text(292, 279, "puis", 14, 700, MUTED, "middle"),
        rect(82, 296, 170, 92, TEAL_PALE, TEAL, 2, 16),
        text(167, 329, "cN1", 27, 850, TEAL, "middle"),
        text(167, 356, "conventionnel", 15, 700, INK, "middle"),
        text(276, 347, "OU", 18, 850, MUTED, "middle"),
        rect(310, 296, 192, 92, ORANGE_PALE, ORANGE, 2, 16),
        text(406, 329, "cN0", 27, 850, ORANGE, "middle"),
        text(406, 356, "≥ 2 facteurs", 15, 800, INK, "middle"),
        rect(82, 411, 420, 132, "#FFFCF4", LINE, 2, 16),
        text(103, 441, "FACTEURS cN0", 14, 800, ORANGE, spacing=.8),
        multiline(103, 471, ["• cT3–4", "• ISUP 4–5", "• PSA ≥ 40 ng/mL"], 18, 700, INK, 25),
        rect(82, 566, 420, 72, CORAL_PALE, CORAL, 2, 14),
        multiline(103, 593, ["Un seul facteur haut risque", "≠ population cN0 STAMPEDE"], 16, 800, CORAL, 22),
        rect(552, 148, 766, 520, WHITE, BLUE, 3, 20),
        text(578, 181, "2 · STRATÉGIE TESTÉE", 15, 800, BLUE, spacing=.8),
        text(578, 217, "Traitement local majoritairement radiothérapique", 18, 700, INK),
        text(1288, 217, "85 %", 22, 850, BLUE, "end"),
        text(578, 263, "ANNÉE", 13, 800, MUTED, spacing=.8),
        text(685, 263, "0", 15, 800, INK, "middle"),
        text(906, 263, "1", 15, 800, INK, "middle"),
        text(1127, 263, "2", 15, 800, INK, "middle"),
        text(1275, 263, "3", 15, 800, INK, "middle"),
        '<line x1="685" y1="277" x2="1275" y2="277" stroke="#D8D5C9" stroke-width="3"/>',
        '<line x1="685" y1="270" x2="685" y2="285" stroke="#24313A" stroke-width="2"/><line x1="906" y1="270" x2="906" y2="285" stroke="#24313A" stroke-width="2"/><line x1="1127" y1="270" x2="1127" y2="285" stroke="#24313A" stroke-width="2"/><line x1="1275" y1="270" x2="1275" y2="285" stroke="#24313A" stroke-width="2"/>',
        text(578, 327, "ADT", 20, 850, TEAL),
        rect(685, 302, 590, 42, TEAL_PALE, TEAL, 2, 12),
        text(980, 329, "prévue 3 ans dans STAMPEDE", 16, 800, TEAL, "middle"),
        text(578, 392, "ABI + P", 20, 850, ORANGE),
        rect(685, 367, 442, 42, ORANGE_PALE, ORANGE, 2, 12),
        text(906, 394, "abiratérone + prednisone · 2 ans", 16, 800, ORANGE, "middle"),
        rect(578, 450, 710, 86, BLUE_PALE, BLUE, 2, 15),
        multiline(601, 480, ["Bénéfice démontré dans cette population", "sur survie sans métastase et survie globale"], 18, 800, BLUE, 25),
        rect(578, 558, 710, 80, CORAL_PALE, CORAL, 2, 15),
        multiline(601, 587, ["Ne pas extrapoler à tout « haut risque »", "Docétaxel M0 : pas de routine dans le référentiel cité"], 16, 800, CORAL, 23),
    ]
    footer(p, "SOURCE · STAMPEDE M0, Lancet 2022 · seuils et durées propres à l’essai")
    return "\n".join(p)


def arpi():
    p = base(
        "ARPI : mécanisme, vulnérabilités et interactions guident le choix",
        "Matrice pharmacoclinique",
        "Comparaison pédagogique des profils d’abiratérone, enzalutamide, apalutamide et darolutamide, avec surveillance et limites de séquençage.",
    )
    cols = [58, 298, 560, 896, 1318]
    p += [
        rect(58, 150, 1260, 436, WHITE, TEAL, 3, 18),
        f'<rect x="58" y="150" width="1260" height="56" rx="18" fill="{INK}"/>',
        text(78, 184, "AGENT", 14, 800, WHITE, spacing=.8),
        text(318, 184, "ACTION", 14, 800, WHITE, spacing=.8),
        text(580, 184, "VULNÉRABILITÉS À RECHERCHER", 14, 800, WHITE, spacing=.6),
        text(916, 184, "SURVEILLANCE / INTERACTIONS", 14, 800, WHITE, spacing=.5),
    ]
    rows = [
        (206, 95, "Abiratérone + corticoïde", ["Synthèse des", "androgènes"], ["HTA · hypokaliémie", "œdèmes · hépatopathie"], ["TA · K+ · bilan hépatique", "réconciliation CYP"]),
        (301, 95, "Enzalutamide", ["Blocage direct", "du récepteur"], ["Fatigue · chutes", "risque neurologique"], ["Inducteur enzymatique fort", "polymédication critique"]),
        (396, 95, "Apalutamide", ["Blocage direct", "du récepteur"], ["Rash · chutes", "hypothyroïdie"], ["Inducteur enzymatique fort", "TSH selon protocole"]),
        (491, 95, "Darolutamide", ["Blocage direct", "du récepteur"], ["Fatigue · comorbidités", "indication / exposition"], ["Moins d’effets SNC attendus", "interactions toujours à vérifier"]),
    ]
    fills = [ORANGE_PALE, BLUE_PALE, TEAL_PALE, "#F2ECFA"]
    strokes = [ORANGE, BLUE, TEAL, "#7656A6"]
    for i, (y, h, agent, action, vulnerable, monitor) in enumerate(rows):
        p += [
            f'<rect x="59" y="{y}" width="1258" height="{h}" fill="{fills[i]}" opacity="0.55"/>',
            '<line x1="58" y1="%d" x2="1318" y2="%d" stroke="#D8D5C9" stroke-width="1.5"/>' % (y, y),
            text(78, y + 38, agent, 17, 850, strokes[i]),
            multiline(318, y + 30, action, 15, 700, INK, 21),
            multiline(580, y + 30, vulnerable, 15, 700, INK, 21),
            multiline(916, y + 30, monitor, 15, 700, INK, 21),
        ]
    for x in cols[1:-1]:
        p.append(f'<line x1="{x}" y1="150" x2="{x}" y2="586" stroke="{LINE}" stroke-width="1.5"/>')
    p += [
        rect(58, 608, 610, 68, CORAL_PALE, CORAL, 2, 14),
        multiline(80, 636, ["APRÈS PROGRESSION SOUS ARPI", "Éviter la succession mécanique : changer de mécanisme si possible."], 15, 800, CORAL, 22),
        rect(688, 608, 630, 68, TEAL_PALE, TEAL, 2, 14),
        multiline(710, 636, ["AVANT TOUT CHOIX", "Vérifier indication, expositions, CV, chutes/cognition et traitements."], 15, 800, TEAL, 22),
    ]
    footer(p, "SOURCES · CCAFU 2024–2026 · EAU 2026 · profils à vérifier dans le RCP/AMM")
    return "\n".join(p)


def doublet_triplet():
    p = base(
        "mHSPC : choisir l’intensification sans hiérarchie artificielle",
        "Algorithme doublet / triplet",
        "Algorithme de première ligne mHSPC distinguant le socle ADT, le doublet ADT plus ARPI et le triplet chez un patient apte au docétaxel.",
    )
    p += [
        rect(58, 149, 1260, 92, TEAL_PALE, TEAL, 3, 18),
        text(86, 181, "DÉCRIRE AVANT DE CHOISIR", 15, 850, TEAL, spacing=.8),
        text(86, 215, "Charge selon l’essai", 17, 750, INK),
        text(362, 215, "De novo ↔ métachrone", 17, 750, INK),
        text(690, 215, "Symptômes / cinétique", 17, 750, INK),
        text(1007, 215, "Fitness / comorbidités", 17, 750, INK),
        '<path d="M688 242 L688 278" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(498, 278, 380, 66, INK, INK, 0, 16),
        text(688, 319, "SOCLE : ADT", 24, 850, WHITE, "middle"),
        '<path d="M688 344 L688 376 L380 376 L380 403" stroke="#24313A" stroke-width="3" fill="none" marker-end="url(#arrow)"/>',
        '<path d="M688 376 L996 376 L996 403" stroke="#24313A" stroke-width="3" fill="none" marker-end="url(#arrow)"/>',
        rect(58, 402, 606, 214, BLUE_PALE, BLUE, 3, 18),
        text(86, 437, "DOUBLET · ADT + ARPI", 20, 850, BLUE),
        text(636, 437, "LARGE POPULATION", 13, 800, BLUE, "end", .5),
        multiline(86, 478, ["• Référence moderne pour de nombreux patients", "• Agent choisi selon terrain, interactions et exposition", "• Pas de classement direct simple entre ARPI"], 17, 700, INK, 30),
        rect(712, 402, 606, 214, ORANGE_PALE, ORANGE, 3, 18),
        text(740, 437, "TRIPLET · ADT + DOCÉTAXEL + ARPI", 20, 850, ORANGE),
        text(1290, 437, "SÉLECTION", 13, 800, ORANGE, "end", .5),
        multiline(740, 478, ["• Patient apte au docétaxel", "• Preuve surtout de novo, souvent forte charge", "• Toxicités et logistique chimiothérapie acceptables"], 17, 700, INK, 30),
        rect(58, 636, 1260, 42, CORAL_PALE, CORAL, 2, 12),
        text(78, 662, "LIMITE DE PREUVE", 14, 850, CORAL),
        text(242, 662, "Le triplet a été comparé à ADT–docétaxel, pas à chaque doublet ADT–ARPI dans tous les sous-groupes.", 15, 750, INK),
    ]
    footer(p, "SOURCES · CCAFU 2024–2026 · EAU 2026 · ESMO 2026")
    return "\n".join(p)


def oligorec():
    p = base(
        "MDT : des critères intermédiaires, pas une preuve de guérison",
        "Lecture critique d’essais",
        "Deux panneaux séparés résument STOMP et RADIOSA avec leurs populations, comparateurs et critères de jugement distincts, puis listent ce qui reste non démontré.",
    )
    p += [
        rect(58, 150, 604, 390, WHITE, BLUE, 3, 18),
        text(84, 184, "STOMP · PHASE II", 16, 850, BLUE, spacing=.8),
        text(84, 216, "≤ 3 lésions · TEP-choline · n = 62", 16, 700, MUTED),
        rect(84, 244, 552, 62, BLUE_PALE, BLUE, 2, 14),
        text(104, 270, "CRITÈRE", 12, 850, BLUE, spacing=.7),
        text(104, 294, "Survie sans ADT", 19, 850, INK),
        text(84, 346, "Surveillance", 15, 700, INK),
        rect(236, 328, 180, 26, "#D8D5C9", "#D8D5C9", 0, 8),
        text(474, 348, "13 mois", 16, 850, INK),
        text(84, 393, "MDT tous sites", 15, 700, BLUE),
        rect(236, 375, 290, 26, BLUE, BLUE, 0, 8),
        text(613, 395, "21 mois", 16, 850, BLUE, "end"),
        text(84, 445, "HR 0,60 · IC à 80 %", 21, 850, BLUE),
        multiline(84, 482, ["Signal exploratoire : délai avant ADT", "≠ preuve de survie globale"], 15, 750, CORAL, 22),
        rect(714, 150, 604, 390, WHITE, TEAL, 3, 18),
        text(740, 184, "RADIOSA · PHASE II", 16, 850, TEAL, spacing=.8),
        text(740, 216, "≤ 3 lésions · n = 105", 16, 700, MUTED),
        rect(740, 244, 552, 62, TEAL_PALE, TEAL, 2, 14),
        text(760, 270, "CRITÈRE", 12, 850, TEAL, spacing=.7),
        text(760, 294, "Survie sans progression clinique", 19, 850, INK),
        text(740, 346, "SBRT seule", 15, 700, INK),
        rect(892, 328, 141, 26, "#D8D5C9", "#D8D5C9", 0, 8),
        text(1125, 348, "15,1 mois", 16, 850, INK),
        text(740, 393, "SBRT + ADT 6 m", 15, 700, TEAL),
        rect(892, 375, 300, 26, TEAL, TEAL, 0, 8),
        text(1275, 395, "32,2 mois", 16, 850, TEAL, "end"),
        text(740, 445, "HR 0,43", 21, 850, TEAL),
        multiline(740, 482, ["L’ADT modifie la stratégie testée", "durée optimale et OS non établies"], 15, 750, CORAL, 22),
        rect(58, 564, 1260, 112, CORAL_PALE, CORAL, 2, 16),
        text(82, 595, "NE PAS CONFONDRE", 15, 850, CORAL, spacing=.8),
        multiline(82, 624, ["Contrôle local / délai sans ADT / survie sans progression ≠ survie globale ni guérison.", "Les critères, l’imagerie et le traitement systémique diffèrent : les deux barres ne sont pas une comparaison entre essais."], 16, 750, INK, 24),
    ]
    footer(p, "SOURCES · STOMP 2018 · RADIOSA 2025 · résultats agrégés publiés")
    return "\n".join(p)


OUTPUTS = {
    FIG / "high-risk-and-cn1" / "03-systemic-intensification.svg": highrisk,
    FIG / "systemic-therapy-foundations" / "03-arpi.svg": arpi,
    FIG / "hormone-sensitive-and-nmcrpc" / "02-doublet-triplet.svg": doublet_triplet,
    FIG / "postradiotherapy-and-oligorecurrence" / "03-uncertainty.svg": oligorec,
}


if __name__ == "__main__":
    for path, render in OUTPUTS.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(render() + "\n", encoding="utf-8")
        print(path.relative_to(ROOT))
