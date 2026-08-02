#!/usr/bin/env python3
"""Render content-specific high-risk and systemic-therapy SVG figures."""

from pathlib import Path

from render_scientific_priority_figures import (
    ROOT, FIG, BG, INK, TEAL, TEAL_PALE, BLUE, BLUE_PALE, ORANGE,
    ORANGE_PALE, CORAL, CORAL_PALE, WHITE, MUTED, LINE,
    base, footer, multiline, rect, text,
)


def state_definition():
    p = base(
        "Haut risque : trois dimensions à documenter séparément",
        "Carte de définition de l’état",
        "Trois colonnes séparent les facteurs de risque local, la topographie ganglionnaire et la méthode d’imagerie afin d’éviter de confondre haut risque, cN1 et M1a.",
    )
    cards = [
        (58, TEAL, TEAL_PALE, "1 · RISQUE LOCAL", ["PSA", "ISUP 4–5", "cT3–4", "atteinte vésiculaire"], "L’étiquette ne fixe ni volume ni traitement."),
        (480, BLUE, BLUE_PALE, "2 · TOPOGRAPHIE N", ["Pelvien régional → cN1", "Non régional → M1a", "Nommer la chaîne", "Nommer taille / nombre"], "cN1 n’est pas synonyme de M1a."),
        (902, ORANGE, ORANGE_PALE, "3 · ÈRE D’IMAGERIE", ["CT / scintigraphie", "TEP-PSMA", "Concordant ou PSMA-only", "Migration de stade tracée"], "Détection moderne ≠ population historique."),
    ]
    for x, color, pale, title_value, bullets, note in cards:
        p += [rect(x, 153, 392, 424, WHITE, color, 3, 18), text(x+26, 188, title_value, 16, 850, color, spacing=.7)]
        yy = 218
        for bullet in bullets:
            p += [rect(x+26, yy, 340, 48, pale, pale, 0, 12), text(x+44, yy+31, bullet, 17, 750, INK)]
            yy += 60
        p += [rect(x+26, 474, 340, 76, CORAL_PALE, CORAL, 2, 13), multiline(x+43, 503, note.split(" | "), 15, 800, CORAL, 21)]
    p += [
        rect(58, 604, 1236, 72, INK, INK, 0, 15),
        text(82, 632, "SORTIE RCP", 14, 850, "#BBD8D2", spacing=.8),
        text(82, 658, "Critères bruts + cTNM + chaînes ganglionnaires + modalité d’imagerie + incertitude de migration", 18, 750, WHITE),
    ]
    footer(p, "SOURCES · CCAFU 2024–2026 · EAU 2026 · STAMPEDE M0")
    return "\n".join(p)


def local_pathways():
    p = base(
        "Haut risque cN0 : comparer des parcours réellement multimodaux",
        "Comparaison des parcours locaux",
        "Trois colonnes comparent radio-hormonothérapie, chirurgie sélectionnée et ADT seule, en distinguant socle, conséquences anticipées et statut d’exception.",
    )
    headers = [
        (58, 386, TEAL, TEAL_PALE, "RADIO-HORMONOTHÉRAPIE", "PARCOURS DE RÉFÉRENCE", ["RT moderne prostate ± extensions", "ADT longue selon risque", "Volumes, fractionnement et prévention", "pensés comme un ensemble"]),
        (455, 386, BLUE, BLUE_PALE, "CHIRURGIE SÉLECTIONNÉE", "PARCOURS MULTIMODAL", ["Prostatectomie ± curage étendu", "Pathologie et PSA postopératoire", "RT et/ou ADT possibles ensuite", "Information préopératoire obligatoire"]),
        (852, 442, CORAL, CORAL_PALE, "ADT SEULE", "EXCEPTION", ["Ne traite pas le foyer local", "Inférieure au combiné chez patient apte", "Si local impossible : objectif explicite", "Réévaluation et durée tracées"]),
    ]
    for x, w, color, pale, title_value, tag, bullets in headers:
        p += [rect(x, 153, w, 430, WHITE, color, 3, 18), text(x+24, 188, title_value, 16, 850, color), rect(x+24, 205, w-48, 34, pale, pale, 0, 17), text(x+w/2, 228, tag, 13, 850, color, "middle", .7)]
        yy=277
        for bullet in bullets:
            p += [text(x+28, yy, "•", 18, 850, color), multiline(x+50, yy, [bullet], 16, 700, INK, 21)]
            yy += 54
    p += [
        rect(58, 610, 1236, 66, ORANGE_PALE, ORANGE, 2, 14),
        multiline(82, 637, ["AUCUNE SUPÉRIORITÉ GLOBALE DÉMONTRÉE ENTRE CHIRURGIE ET RADIO-HORMONOTHÉRAPIE BIEN MENÉE", "Comparer contrôle, séquelles, probabilité de traitements additionnels et préférence."], 14, 800, INK, 21),
    ]
    footer(p, "SOURCES · CCAFU 2024–2026 · EAU 2026 · RecoRad 2025")
    return "\n".join(p)


def divergence():
    p = base(
        "Guidelines divergentes : résoudre la question, pas moyenner les phrases",
        "Audit PICO et traçabilité",
        "Workflow de résolution d’une divergence entre référentiels, depuis la reformulation PICO jusqu’à une décision datée séparant preuve, recommandation et disponibilité.",
    )
    steps = [
        (58, 154, 254, TEAL, TEAL_PALE, "01", "REFORMULER PICO", ["cN0 ou cN1 ?", "Imagerie laquelle ?", "Prostate ou pelvis ?"]),
        (330, 154, 254, BLUE, BLUE_PALE, "02", "CARACTÉRISER", ["Année / juridiction", "Population / endpoint", "Force / texte source"]),
        (602, 154, 322, ORANGE, ORANGE_PALE, "03", "EXPLIQUER L’ÉCART", ["Exemple pelvis cN0 :", "seuil, preuve et degré", "d’affirmation différents"]),
        (942, 154, 352, CORAL, CORAL_PALE, "04", "DÉCIDER ET TRACER", ["Référentiel applicable", "Capacités / accès", "Déviation et révision"]),
    ]
    for x,y,w,color,pale,num,title_value,bullets in steps:
        p += [rect(x,y,w,318,WHITE,color,3,18), text(x+22,y+42,num,29,850,color), text(x+22,y+77,title_value,15,850,INK)]
        yy=y+122
        for b in bullets:
            p += [rect(x+20,yy,w-40,44,pale,pale,0,11), text(x+36,yy+28,b,15,750,INK)]
            yy += 55
    p += [
        '<path d="M312 313 L330 313" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M584 313 L602 313" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M924 313 L942 313" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58, 500, 1236, 176, INK, INK, 0, 16),
        text(82, 533, "DÉCISION RÉVISABLE", 15, 850, "#BBD8D2", spacing=.8),
        multiline(82, 565, ["Stade + méthode d’imagerie · facteurs de risque · intention · volumes · fractionnement", "ADT / intensification · toxicités · alternatives · préférence · version des sources · date de réévaluation", "Preuve ≠ recommandation ≠ disponibilité réglementaire ou locale"], 17, 750, WHITE, 28),
    ]
    footer(p, "MÉTHODE · comparaison explicite des populations et des sources datées")
    return "\n".join(p)


def adt():
    p = base(
        "ADT : la cinétique diffère, la vérification biologique reste obligatoire",
        "Cinétique schématique + contrôle",
        "Courbes schématiques de testostérone après orchidectomie, antagoniste et agoniste de la GnRH, avec flare initial de l’agoniste et algorithme de vérification avant de conclure à une résistance.",
    )
    p += [
        rect(58, 152, 760, 430, WHITE, TEAL, 3, 18),
        text(82, 184, "CINÉTIQUES RELATIVES · SCHÉMA, NON DONNÉES PATIENT", 14, 850, TEAL, spacing=.5),
        '<line x1="116" y1="520" x2="774" y2="520" stroke="#24313A" stroke-width="3"/><line x1="116" y1="520" x2="116" y2="224" stroke="#24313A" stroke-width="3"/>',
        text(445, 558, "TEMPS APRÈS DÉBUT", 13, 800, MUTED, "middle", .7),
        '<path d="M118 286 C142 360 150 470 188 500 L760 500" fill="none" stroke="#C85C4A" stroke-width="6"/>',
        '<path d="M118 286 C170 320 198 430 286 488 C390 504 568 500 760 500" fill="none" stroke="#007C83" stroke-width="6"/>',
        '<path d="M118 286 C170 236 224 250 282 340 C350 446 430 493 760 500" fill="none" stroke="#2563A6" stroke-width="6"/>',
        text(528, 245, "Agoniste GnRH · flare initial", 13, 850, BLUE),
        text(528, 274, "Antagoniste GnRH · sans flare", 13, 850, TEAL),
        text(528, 303, "Orchidectomie · immédiate, définitive", 13, 850, CORAL),
        rect(844, 152, 450, 430, WHITE, BLUE, 3, 18),
        text(870, 185, "SI PROGRESSION SOUS ADT", 15, 850, BLUE, spacing=.7),
        multiline(870, 230, ["1  Administration / date d’injection", "2  Observance et interactions", "3  PSA, symptômes, imagerie adaptée", "4  TESTOSTÉRONE MESURÉE"], 17, 750, INK, 48),
        rect(870, 434, 398, 120, CORAL_PALE, CORAL, 2, 14),
        multiline(892, 466, ["Résistance à la castration", "= progression malgré niveau", "de testostérone de castration"], 18, 850, CORAL, 27),
        rect(58, 608, 1236, 68, ORANGE_PALE, ORANGE, 2, 14),
        multiline(82, 637, ["RISQUE IMMÉDIAT DE FLARE : antagoniste ou protection adaptée à discuter", "Compression, obstruction ou douleur sévère = traitement urgent spécifique sans attendre l’effet endocrinien."], 15, 800, INK, 22),
    ]
    footer(p, "SOURCES · CCAFU 2024–2026 · EAU 2026 · courbes qualitatives")
    return "\n".join(p)


def adt_rt():
    p = base(
        "ADT + radiothérapie : l’indication et la durée dépendent du contexte",
        "Matrice contextuelle",
        "Matrice de contextes distinguant risque intermédiaire, haut risque, cN1 et rattrapage postopératoire, sans attribuer une durée universelle d’ADT.",
    )
    p += [rect(58, 152, 1236, 368, WHITE, TEAL, 3, 18)]
    headers=[("CONTEXTE",58,270),("QUESTION À TRANCHER",328,420),("À TRACER",748,546)]
    for label,x,w in headers:
        p += [f'<rect x="{x}" y="152" width="{w}" height="56" fill="{INK}"/>',text(x+20,187,label,14,850,WHITE,spacing=.7)]
    rows=[
        (208, "Intermédiaire", "Sous-groupe et bénéfice attendu", "Début, durée, vulnérabilités"),
        (286, "Haut risque", "ADT longue + cohérence des volumes", "Objectif de durée et adaptation"),
        (364, "cN1", "Locorégional + risque systémique", "Pelvis, intensification, prévention"),
        (442, "Rattrapage postop.", "PSA, facteurs et moment du salvage", "Pourquoi ajouter l’ADT, combien de temps"),
    ]
    fills=[BLUE_PALE,TEAL_PALE,ORANGE_PALE,CORAL_PALE]
    for i,(y,a,b,c) in enumerate(rows):
        p += [f'<rect x="59" y="{y}" width="1234" height="78" fill="{fills[i]}" opacity="0.72"/>',text(80,y+47,a,17,850,INK),text(350,y+47,b,16,750,INK),text(770,y+47,c,16,750,INK)]
    p += [
        rect(58, 548, 1236, 128, BLUE_PALE, BLUE, 2, 16),
        text(82, 581, "PRESCRIPTION COMPLÈTE", 15, 850, BLUE, spacing=.7),
        multiline(82, 611, ["Indication · molécule · début relatif à la RT · durée cible · prévention · critères de réévaluation", "Une réduction pour vulnérabilité est une adaptation tracée, pas une nouvelle équivalence de preuve."], 16, 750, INK, 25),
    ]
    footer(p, "SOURCES · ESTRO-ACROP 2023 · EAU 2026 · CCAFU 2024–2026")
    return "\n".join(p)


def taxanes():
    p = base(
        "Taxanes : indication, fitness et prévention forment une seule décision",
        "Algorithme de sécurité",
        "Workflow reliant séquence thérapeutique, évaluation multidimensionnelle de la fitness, prévention des toxicités et conduite urgente devant une fièvre.",
    )
    p += [
        rect(58, 152, 354, 432, WHITE, BLUE, 3, 18),
        text(84, 186, "1 · PLACE DANS LA SÉQUENCE", 15, 850, BLUE),
        rect(84, 216, 302, 86, BLUE_PALE, BLUE, 2, 14),
        multiline(105, 247, ["DOCÉTAXEL", "mHSPC sélectionné · mCRPC"], 17, 850, INK, 24),
        rect(84, 320, 302, 100, TEAL_PALE, TEAL, 2, 14),
        multiline(105, 351, ["CABAZITAXEL", "après docétaxel, notamment", "si progression sous ARPI"], 17, 850, INK, 24),
        multiline(84, 464, ["Vitesse de progression", "Expositions · options biomarquées"], 15, 750, MUTED, 23),
        rect(436, 152, 406, 432, WHITE, TEAL, 3, 18),
        text(462, 186, "2 · FITNESS ≠ ÂGE CIVIL", 15, 850, TEAL),
        multiline(462, 230, ["Performance / fragilité", "Cognition / soutien social", "Nutrition / neuropathie", "Moelle / foie / rein", "Infections / préférence"], 18, 750, INK, 48),
        rect(462, 493, 354, 64, TEAL_PALE, TEAL, 2, 13),
        multiline(482, 520, ["Évaluation gériatrique ciblée", "si vulnérabilité ou doute"], 15, 850, TEAL, 21),
        rect(866, 152, 428, 432, WHITE, ORANGE, 3, 18),
        text(892, 186, "3 · PRÉVENIR ET AGIR", 15, 850, ORANGE),
        multiline(892, 230, ["NFS / risque infectieux", "Neuropathie · diarrhée", "Fatigue · œdème · foie", "G-CSF selon protocole + risque"], 18, 750, INK, 48),
        rect(892, 445, 376, 112, CORAL_PALE, CORAL, 2, 14),
        multiline(914, 477, ["FIÈVRE OU ALTÉRATION RAPIDE", "Évaluation urgente", "— pas d’attente au prochain cycle"], 16, 850, CORAL, 25),
        '<path d="M412 365 L436 365" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M842 365 L866 365" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58, 612, 1236, 64, INK, INK, 0, 14),
        text(82, 651, "SORTIE", 14, 850, "#BBD8D2"),
        text(172, 651, "Bénéfice attendu + aptitude + prévention + plan d’urgence explicités avant le cycle 1", 17, 750, WHITE),
    ]
    footer(p, "SOURCES · CCAFU 2024–2026 · EAU 2026 · ESMO 2026 · ASCO 2025")
    return "\n".join(p)


def prevention():
    p = base(
        "Prévention sous traitement systémique : ne pas confondre deux risques osseux",
        "Comparaison + checklist initiale",
        "Deux colonnes distinguent fracture de fragilité liée à l’ADT et événements squelettiques du mCRPC osseux, puis listent le bilan initial et une urgence neurologique.",
    )
    p += [
        rect(58, 152, 602, 286, WHITE, BLUE, 3, 18),
        text(84, 188, "OS FRAGILE SOUS ADT", 18, 850, BLUE),
        text(84, 220, "OBJECTIF · prévenir la fracture de fragilité", 14, 800, BLUE),
        multiline(84, 263, ["Risque de chute / antécédents", "DMO selon contexte", "Exercice résistance + endurance", "Traitement anti-ostéoporotique si indiqué"], 17, 750, INK, 38),
        rect(692, 152, 602, 286, WHITE, ORANGE, 3, 18),
        text(718, 188, "mCRPC OSSEUX", 18, 850, ORANGE),
        text(718, 220, "OBJECTIF · prévenir les événements squelettiques", 14, 800, ORANGE),
        multiline(718, 263, ["Indication oncologique distincte", "Dose / rythme non interchangeables", "Dentaire · Ca · vitamine D · rein", "Surveillance propre à l’agent"], 17, 750, INK, 38),
        rect(58, 466, 1236, 132, TEAL_PALE, TEAL, 2, 16),
        text(82, 499, "BILAN DÈS LE DÉPART", 15, 850, TEAL, spacing=.7),
        multiline(82, 530, ["Poids · TA · tabac · activité · antécédents CV · glycémie/HbA1c · lipides", "Chutes · nutrition · santé sexuelle · coordination médecin traitant / cardiologie / oncogériatrie"], 16, 750, INK, 27),
        rect(58, 622, 1236, 54, CORAL_PALE, CORAL, 2, 13),
        text(82, 655, "URGENCE", 14, 850, CORAL),
        text(174, 655, "Douleur rachidienne + déficit neurologique ou trouble sphinctérien → évaluation immédiate", 16, 850, INK),
    ]
    footer(p, "SOURCES · CCAFU 2024–2026 · EAU 2026 · ESMO 2026")
    return "\n".join(p)


OUTPUTS = {
    FIG / "high-risk-and-cn1" / "01-state-definition.svg": state_definition,
    FIG / "high-risk-and-cn1" / "02-local-pathways.svg": local_pathways,
    FIG / "high-risk-and-cn1" / "05-divergence.svg": divergence,
    FIG / "systemic-therapy-foundations" / "01-adt.svg": adt,
    FIG / "systemic-therapy-foundations" / "02-adt-rt.svg": adt_rt,
    FIG / "systemic-therapy-foundations" / "04-taxanes.svg": taxanes,
    FIG / "systemic-therapy-foundations" / "05-prevention.svg": prevention,
}


if __name__ == "__main__":
    for path, render in OUTPUTS.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(render() + "\n", encoding="utf-8")
        print(path.relative_to(ROOT))
