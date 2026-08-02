#!/usr/bin/env python3
"""Render individualized postoperative and localized-treatment pathway figures."""

from render_scientific_priority_figures import (
    ROOT, FIG, INK, TEAL, TEAL_PALE, BLUE, BLUE_PALE, ORANGE,
    ORANGE_PALE, CORAL, CORAL_PALE, WHITE, MUTED, LINE,
    base, footer, multiline, rect, text,
)


def postrp_psma():
    p = base(
        "Après prostatectomie : le TEP-PSMA doit répondre à une question",
        "Algorithme d’utilité clinique",
        "Algorithme conditionnel du TEP-PSMA après prostatectomie, intégrant PSA, intention de modifier la stratégie, rendement de détection et limite d’un examen négatif.",
    )
    p += [
        rect(58,152,350,464,WHITE,TEAL,3,18),
        text(84,187,"1 · AVANT L’EXAMEN",15,850,TEAL),
        multiline(84,230,["PSA > 0,2 ng/mL", "ou persistant ascendant", "", "Question explicite :", "• lit prostatique ?", "• ganglions ?", "• maladie distante ?"],18,750,INK,35),
        rect(84,492,298,96,CORAL_PALE,CORAL,2,14),
        multiline(104,522,["Si le résultat ne change", "pas la conduite :", "ne pas ritualiser l’examen"],16,850,CORAL,23),
        rect(438,152,400,464,WHITE,BLUE,3,18),
        text(464,187,"2 · RENDEMENT CONDITIONNEL",15,850,BLUE),
        rect(464,220,348,118,BLUE_PALE,BLUE,2,16),
        text(638,254,"PSA 0,2–0,5 ng/mL",17,800,INK,"middle"),
        text(638,304,"≈ 38 %",38,900,BLUE,"middle"),
        text(638,329,"détection rapportée par le CCAFU",13,750,MUTED,"middle"),
        multiline(464,380,["Tracer :", "• radiotraceur et qualité", "• sites suspects", "• degré de certitude"],17,750,INK,36),
        rect(868,152,426,464,WHITE,ORANGE,3,18),
        text(894,187,"3 · INTERPRÉTER POUR AGIR",15,850,ORANGE),
        rect(894,220,374,132,TEAL_PALE,TEAL,2,15),
        multiline(916,250,["POSITIF", "Peut modifier volumes", "ou stratégie — sans prouver", "un bénéfice de survie"],16,850,INK,25),
        rect(894,374,374,154,CORAL_PALE,CORAL,2,15),
        multiline(916,404,["NÉGATIF À FAIBLE PSA", "N’exclut pas une maladie", "microscopique du lit ou des N", "et ne doit pas retarder un", "salvage indiqué par le dossier"],15,850,INK,23),
        text(1081,573,"VISIBLE ≠ TOTALITÉ DE LA MALADIE",14,850,ORANGE,"middle"),
        '<path d="M408 382 L438 382" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M838 382 L868 382" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58,642,1236,34,INK,INK,0,10),text(676,665,"Le TEP informe la stratégie ; il ne remplace ni la cinétique du PSA ni la pathologie.",15,750,WHITE,"middle"),
    ]
    footer(p,"SOURCES · EAU 2026 · CCAFU 2024–2026 · EANM/SNMMI 2023")
    return "\n".join(p)


def early_salvage():
    p = base(
        "Rattrapage postopératoire : surveiller activement pour traiter tôt",
        "Frise décisionnelle PSA",
        "Frise du PSA après prostatectomie montrant surveillance structurée, remontée confirmée à bas PSA et radiothérapie de rattrapage précoce, avec une branche d’observation favorable explicitement planifiée.",
    )
    p += [
        rect(58,152,1236,116,WHITE,TEAL,3,18),
        text(84,184,"APRÈS PROSTATECTOMIE · pN0 · PSA INDÉTECTABLE",16,850,TEAL),
        text(84,224,"Surveillance structurée plutôt qu’irradiation adjuvante systématique pour la majorité",19,750,INK),
        '<line x1="130" y1="350" x2="1230" y2="350" stroke="#24313A" stroke-width="5" marker-end="url(#arrow)"/>',
        rect(82,310,250,82,BLUE_PALE,BLUE,2,15),text(207,341,"PSA INDÉTECTABLE",16,850,BLUE,"middle"),text(207,372,"calendrier défini",14,750,INK,"middle"),
        rect(442,300,330,102,ORANGE_PALE,ORANGE,2,15),text(607,334,"REMONTÉE CONFIRMÉE",17,850,ORANGE,"middle"),text(607,365,"déclencheurs d’essais ~0,1–0,2",14,750,INK,"middle"),text(607,388,"≠ ordre automatique isolé",13,800,CORAL,"middle"),
        rect(902,300,330,102,TEAL_PALE,TEAL,2,15),text(1067,334,"SALVAGE PRÉCOCE",17,850,TEAL,"middle"),text(1067,365,"potentiellement curatif",15,750,INK,"middle"),text(1067,388,"avant PSA élevé",13,800,TEAL,"middle"),
        '<path d="M607 402 L607 466" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(360,466,494,154,WHITE,BLUE,3,17),
        text(386,501,"OBSERVATION DISCUTABLE SI PROFIL FAVORABLE",15,850,BLUE),
        multiline(386,536,["Intervalle long · ISUP bas · PSADT long", "Espérance de vie et préférence intégrées", "Calendrier + seuils + plan si accélération"],16,750,INK,26),
        rect(886,466,408,154,CORAL_PALE,CORAL,2,17),
        multiline(910,500,["PIÈGE", "Attendre un PSA élevé", "parce que l’imagerie est négative", "ou que le patient va bien"],17,850,CORAL,27),
        rect(58,642,1236,34,INK,INK,0,10),text(676,665,"Précoce = décision sur tendance + patient + pathologie, pas seuil isolé.",15,750,WHITE,"middle"),
    ]
    footer(p,"SOURCES · RecoRad 2025 · EAU 2026 · CCAFU 2024–2026")
    return "\n".join(p)


def postrp_adt():
    p = base(
        "ADT avec salvage : sélectionner le risque et dater l’exposition",
        "Stratification bénéfice–toxicité",
        "Matrice de sélection de l’ADT avec radiothérapie de rattrapage, distinguant récidive favorable, profils défavorables et situations sélectionnées à risque très élevé.",
    )
    p += [
        rect(58,152,1236,86,TEAL_PALE,TEAL,3,17),
        text(82,184,"VARIABLES AVANT INTENSIFICATION",14,850,TEAL,spacing=.7),
        text(82,215,"PSA pré-RT · PSADT · ISUP · pT/pN · marges · persistance · imagerie · vulnérabilités",18,750,INK),
    ]
    cards=[
        (58,BLUE,BLUE_PALE,"RÉCIDIVE FAVORABLE",["Très bas PSA", "Cinétique lente", "Rapport bénéfice–toxicité", "potentiellement faible"],"Pas d’ADT automatique"),
        (470,ORANGE,ORANGE_PALE,"PROFIL DÉFAVORABLE",["RecoRad : repères dont", "PSA > 0,5 ng/mL", "ou PSADT < 6 mois"],"ADT courte ~6 mois"),
        (882,CORAL,CORAL_PALE,"SÉLECTION TRÈS À RISQUE",["RecoRad : situations dont", "pN1", "ou PSA > 1 ng/mL"],"Discuter jusqu’à 24 mois"),
    ]
    for x,color,pale,title_value,lines,tag in cards:
        p += [rect(x,268,382,286,WHITE,color,3,18),text(x+24,303,title_value,16,850,color)]
        yy=345
        for line in lines:
            p += [text(x+26,yy,"• "+line,16,750,INK)];yy+=35
        p += [rect(x+24,482,334,44,pale,pale,0,12),text(x+191,510,tag,15,850,color,"middle")]
    p += [
        rect(58,580,1236,96,INK,INK,0,15),
        text(82,611,"LIMITES",14,850,"#BBD8D2",spacing=.7),
        multiline(82,640,["Les repères 6 et 24 mois ne sont pas interchangeables ni universels.", "Documenter CV, métabolique, os, sexualité, préférence, prévention et date de fin prévue."],16,750,WHITE,24),
    ]
    footer(p,"SOURCE DES REPÈRES · RecoRad 2025 · confrontation EAU/CCAFU requise")
    return "\n".join(p)


def localized_context():
    p = base(
        "Options curatives : trois filtres avant toute comparaison",
        "Cadre de décision partagée",
        "Trois filtres successifs distinguent admissibilité oncologique, faisabilité technique et préférence éclairée avant de comparer les traitements curatifs.",
    )
    steps=[
        (58,TEAL,TEAL_PALE,"1 · ADMISSIBILITÉ ONCOLOGIQUE",["PSA · cT · ISUP", "charge biopsique · IRM", "bilan d’extension", "espérance de vie"]),
        (470,BLUE,BLUE_PALE,"2 · FAISABILITÉ TECHNIQUE",["urinaire / digestif", "fonction sexuelle", "volume / antécédents", "expertise disponible"]),
        (882,ORANGE,ORANGE_PALE,"3 · PRÉFÉRENCE ÉCLAIRÉE",["bénéfice attendu", "toxicités dominantes", "traitements associés", "rattrapage possible"]),
    ]
    for x,color,pale,title_value,lines in steps:
        p += [rect(x,160,382,350,WHITE,color,3,18),text(x+24,196,title_value,15,850,color)]
        yy=240
        for line in lines:
            p += [rect(x+24,yy,334,46,pale,pale,0,11),text(x+42,yy+29,line,16,750,INK)];yy+=58
    p += [
        '<path d="M440 335 L470 335" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M852 335 L882 335" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58,540,604,136,BLUE_PALE,BLUE,2,16),text(82,573,"OPTION STANDARD",15,850,BLUE),multiline(82,604,["Soutenue par recommandations", "mais parfois techniquement défavorable"],17,750,INK,25),
        rect(690,540,604,136,CORAL_PALE,CORAL,2,16),text(714,573,"TECHNIQUE EN ÉVALUATION",15,850,CORAL),multiline(714,604,["Ne pas présenter au même niveau", "qu’une option standard établie"],17,750,INK,25),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026")
    return "\n".join(p)


def surgery():
    p = base(
        "Prostatectomie : traitement local, information pathologique, parcours possible",
        "Trajectoire postopératoire",
        "Parcours depuis la sélection avant prostatectomie jusqu’à la pathologie et au PSA postopératoires, avec branches de surveillance ou de rattrapage et encadré fonctionnel.",
    )
    p += [
        rect(58,154,296,430,WHITE,TEAL,3,18),text(84,188,"AVANT L’OPÉRATION",15,850,TEAL),
        multiline(84,232,["Risque tumoral", "État de santé", "Résécabilité", "Espérance de vie", "Fonctions initiales", "Conséquences acceptées"],17,750,INK,47),
        rect(382,154,356,430,WHITE,BLUE,3,18),text(408,188,"PIÈCE + PSA",15,850,BLUE),
        rect(408,222,304,120,BLUE_PALE,BLUE,2,15),multiline(430,255,["pT · marges · grade", "pN si curage indiqué", "PSA postopératoire"],18,850,INK,28),
        multiline(408,392,["La pathologie affine", "le risque ; elle ne garantit", "pas la fin du traitement."],18,750,INK,28),
        rect(766,154,528,196,WHITE,TEAL,3,18),text(792,188,"SI PSA INDÉTECTABLE",15,850,TEAL),multiline(792,231,["Surveillance structurée", "Rattrapage précoce si remontée confirmée"],18,750,INK,30),
        rect(766,374,528,210,WHITE,CORAL,3,18),text(792,408,"SI PSA PERSISTANT / ASCENDANT",15,850,CORAL),multiline(792,452,["Réévaluer stade et facteurs", "RT de rattrapage ± ADT", "selon niveau de risque"],18,750,INK,31),
        '<path d="M354 365 L382 365" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M738 365 L766 260" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M738 365 L766 478" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58,612,1236,64,ORANGE_PALE,ORANGE,2,14),
        text(82,649,"FONCTIONS",14,850,ORANGE),text(186,649,"Incontinence et fonction érectile discutées avant geste ; robot et préservation nerveuse n’annulent pas le compromis oncologique.",15,750,INK),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026")
    return "\n".join(p)


def brachy():
    p = base(
        "Curiethérapie : technique, fonction urinaire et objectif ne se confondent pas",
        "Comparaison LDR / HDR + sélection",
        "Comparaison des usages LDR et HDR, puis filtre urinaire avant curiethérapie et balance bénéfice-toxicity du boost.",
    )
    p += [
        rect(58,152,602,196,WHITE,BLUE,3,18),text(84,188,"LDR · IMPLANTS PERMANENTS",17,850,BLUE),multiline(84,230,["Monothérapie possible", "chez certains faibles risques", "ou intermédiaires favorables"],18,750,INK,30),
        rect(692,152,602,196,WHITE,TEAL,3,18),text(718,188,"HDR · CATHÉTERS TEMPORAIRES",17,850,TEAL),multiline(718,230,["Monothérapie dans indications sélectionnées", "ou boost avec RT externe", "selon risque et expertise"],18,750,INK,30),
        rect(58,378,786,208,ORANGE_PALE,ORANGE,2,18),text(84,412,"FILTRE URINAIRE ET TECHNIQUE",16,850,ORANGE),
        multiline(84,454,["Symptômes / débit · volume prostatique · lobe médian", "TURP antérieure · anatomie pubienne · faisabilité de l’implant", "Facteurs souvent relatifs : dépendance à la technique et au centre"],17,750,INK,32),
        rect(874,378,420,208,CORAL_PALE,CORAL,2,18),text(900,412,"BOOST : COMPROMIS",16,850,CORAL),
        multiline(900,454,["↑ contrôle biochimique", "↑ toxicité urinaire", "OS non démontrée", "dans essais de référence"],17,850,INK,30),
        rect(58,616,1236,60,INK,INK,0,14),text(676,653,"Plus de dose n’est pas gratuitement meilleur : sélectionner indication, fonction et expertise.",16,750,WHITE,"middle"),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · RecoRad 2025")
    return "\n".join(p)


def multimodal():
    p = base(
        "Comparer les trajectoires complètes, pas seulement le premier traitement",
        "Parcours multimodaux asymétriques",
        "Deux trajectoires montrent les traitements associés possibles après chirurgie ou radiothérapie définitive et l’asymétrie des options de rattrapage.",
    )
    p += [
        rect(58,152,602,400,WHITE,BLUE,3,18),text(84,188,"TRAJECTOIRE CHIRURGICALE",17,850,BLUE),
        rect(84,220,550,64,BLUE_PALE,BLUE,2,13),text(359,259,"PROSTATECTOMIE",19,850,BLUE,"middle"),
        '<path d="M359 284 L359 322" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(84,322,550,82,WHITE,LINE,2,13),multiline(106,352,["Pathologie + PSA", "→ surveillance ou RT de rattrapage ± ADT"],17,750,INK,26),
        rect(84,432,550,92,TEAL_PALE,TEAL,2,13),multiline(106,463,["Salvage du lit = stratégie établie", "si indication et timing appropriés"],16,850,TEAL,25),
        rect(692,152,602,400,WHITE,ORANGE,3,18),text(718,188,"TRAJECTOIRE RADIOTHÉRAPIE",17,850,ORANGE),
        rect(718,220,550,64,ORANGE_PALE,ORANGE,2,13),text(993,259,"RT DÉFINITIVE ± ADT / BOOST",19,850,ORANGE,"middle"),
        '<path d="M993 284 L993 322" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(718,322,550,82,WHITE,LINE,2,13),multiline(740,352,["PSA + imagerie + preuve locale", "→ sélection experte du rattrapage"],17,750,INK,26),
        rect(718,432,550,92,CORAL_PALE,CORAL,2,13),multiline(740,463,["Chirurgie / curie / SBRT / ablation", "possibles chez sélection stricte, morbidité accrue"],16,850,CORAL,25),
        rect(58,580,1236,96,INK,INK,0,15),
        text(82,612,"ASYMÉTRIE À EXPLIQUER",14,850,"#BBD8D2"),
        multiline(82,641,["« Chaque option peut toujours rattraper l’autre » est faux.", "Comparer traitements associés probables, séquelles dominantes et options réalistes de rattrapage."],16,750,WHITE,24),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · RecoRad 2025")
    return "\n".join(p)


def mcrpc_state():
    p = base(
        "mCRPC : confirmer l’état puis reconstruire toute la trajectoire",
        "Gate diagnostique + carte longitudinale",
        "Gate diagnostique exigeant castration, progression documentée et maladie métastatique, suivi d’une carte des expositions, du phénotype actuel, des réserves et des options réellement disponibles.",
    )
    p += [
        rect(58,152,1236,96,INK,INK,0,17),
        text(82,184,"GATE DIAGNOSTIQUE · LES 3 CONDITIONS",14,850,"#BBD8D2",spacing=.7),
        text(82,220,"Testostérone au niveau de castration",17,800,WHITE),text(492,220,"+ progression documentée",17,800,WHITE),text(850,220,"+ maladie métastatique",17,800,WHITE),
    ]
    cols=[
        (58,TEAL,TEAL_PALE,"HISTORIQUE",["ARPI / taxanes / PARP", "radiopharmaceutiques", "réponses · durées", "toxicités / arrêts"]),
        (366,BLUE,BLUE_PALE,"PHÉNOTYPE ACTUEL",["symptômes / vitesse", "os / viscéral", "discordance PSA–clinique", "sites menaçants"]),
        (674,ORANGE,ORANGE_PALE,"RÉSERVES",["performance / fragilité", "moelle / rein / foie", "neuropathie / cognition", "préférence / logistique"]),
        (982,CORAL,CORAL_PALE,"ACTIONNABILITÉ",["biomarqueurs", "indications / séquence", "accès / remboursement", "essai clinique"]),
    ]
    for x,color,pale,title_value,lines in cols:
        p += [rect(x,276,288,290,WHITE,color,3,17),text(x+22,310,title_value,15,850,color)]
        yy=346
        for line in lines:
            p += [rect(x+20,yy,248,42,pale,pale,0,10),text(x+35,yy+27,line,15,750,INK)];yy+=52
    p += [
        rect(58,594,1236,82,CORAL_PALE,CORAL,2,15),
        text(82,626,"PIÈGE",14,850,CORAL),
        multiline(150,626,["Choisir la ligne sur le seul PSA. Une progression clinique ou viscérale peut être discordante ; l’ADT est poursuivie", "sauf castration chirurgicale."],16,800,INK,24),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · ESMO 2026 · ASCO 2025")
    return "\n".join(p)


def mcrpc_rare():
    p = base(
        "Biomarqueurs rares : validation, action et accès sont quatre questions",
        "Matrice d’actionnabilité",
        "Matrice séparant MSI/dMMR, TMB élevé, CDK12 et autres marqueurs selon validation analytique, niveau de preuve, option potentielle et accès réglementaire.",
    )
    p += [rect(58,152,1236,416,WHITE,TEAL,3,18)]
    headers=[("MARQUEUR",58,260),("VALIDATION",318,280),("PORTÉE CLINIQUE",598,358),("ACCÈS",956,338)]
    for label,x,w in headers:
        p += [f'<rect x="{x}" y="152" width="{w}" height="56" fill="{INK}"/>',text(x+18,187,label,14,850,WHITE,spacing=.6)]
    rows=[
        (208,TEAL_PALE,"MSI-H / dMMR","Compte rendu moléculaire validé","Option d’immunothérapie possible selon ligne","AMM / remboursement / RCP"),
        (298,BLUE_PALE,"TMB élevé","Méthode + seuil + qualité","Valeur contextuelle, non automatique","Juridiction / essai clinique"),
        (388,ORANGE_PALE,"CDK12","Altération interprétée","Exploratoire / hypothèse biologique","RCP moléculaire / essai"),
        (478,CORAL_PALE,"Autres marqueurs","Ne pas surinterpréter un signal","Pas d’indication standard par défaut","Accès séparé de plausibilité"),
    ]
    for y,fill,a,b,c,d in rows:
        p += [f'<rect x="59" y="{y}" width="1234" height="90" fill="{fill}" opacity="0.72"/>',text(80,y+53,a,17,850,INK),text(340,y+53,b,15,750,INK),text(620,y+53,c,15,750,INK),text(978,y+53,d,15,750,INK)]
    p += [
        rect(58,594,1236,82,CORAL_PALE,CORAL,2,15),
        multiline(82,624,["RARE ≠ CERTAIN · BIOLOGIQUEMENT PLAUSIBLE ≠ ACTIONNABLE · ACTIONNABLE ≠ ACCESSIBLE", "Tracer test, méthode, interprétation, niveau de preuve, ligne, AMM, remboursement et alternative d’essai."],15,850,INK,25),
    ]
    footer(p,"SOURCES · EAU 2026 · ESMO 2026 · ASCO Genomic Testing 2025")
    return "\n".join(p)


def mcrpc_sequence():
    p = base(
        "mCRPC : changer de mécanisme sans épuiser la ligne suivante",
        "Matrice de séquençage",
        "Matrice reliant vitesse et sites de progression, expositions, réserves et biomarqueurs à une famille de mécanismes, avec rappel de la résistance croisée entre ARPI.",
    )
    p += [
        rect(58,152,336,444,WHITE,TEAL,3,18),text(84,186,"1 · CE QUI POUSSE À AGIR",15,850,TEAL),
        multiline(84,230,["Progression rapide", "Maladie viscérale", "Symptômes / menace", "Biomarqueur actionnable", "Perte de fitness attendue"],18,750,INK,50),
        rect(424,152,440,444,WHITE,BLUE,3,18),text(450,186,"2 · CHANGER DE MÉCANISME",15,850,BLUE),
        rect(450,222,388,62,BLUE_PALE,BLUE,2,13),text(644,260,"TAXANE",18,850,BLUE,"middle"),
        rect(450,300,388,62,TEAL_PALE,TEAL,2,13),text(644,338,"TRAITEMENT BIOMARQUÉ",18,850,TEAL,"middle"),
        rect(450,378,388,62,ORANGE_PALE,ORANGE,2,13),text(644,416,"RADIUM / RADIOLIGAND",18,850,ORANGE,"middle"),
        rect(450,462,388,104,CORAL_PALE,CORAL,2,13),multiline(472,494,["Second ARPI après progression rapide", "→ activité souvent limitée", "par résistance croisée"],16,850,CORAL,24),
        rect(894,152,400,444,WHITE,ORANGE,3,18),text(920,186,"3 · PRÉSERVER LA SUITE",15,850,ORANGE),
        multiline(920,230,["Moelle fragile", "Neuropathie / fonctions", "Rein / foie", "Accès et logistique", "Préférence", "Option suivante réaliste"],18,750,INK,46),
        '<path d="M394 374 L424 374" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M864 374 L894 374" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58,624,1236,52,INK,INK,0,13),text(676,657,"Séquence datée et révisable : bénéfice maintenant + coût sur les options futures.",16,750,WHITE,"middle"),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · ESMO 2026 · ASCO 2025")
    return "\n".join(p)


def active_surveillance():
    p = base(
        "Surveillance active : sélectionner, surveiller, reclasser",
        "Éligibilité + exclusions",
        "Matrice d’éligibilité à la surveillance active distinguant standard faible risque, sélection intermédiaire favorable, facteurs patient et signaux histologiques d’exclusion.",
    )
    p += [
        rect(58,152,602,314,WHITE,TEAL,3,18),text(84,187,"ÉLIGIBILITÉ ONCOLOGIQUE",16,850,TEAL),
        rect(84,218,550,66,TEAL_PALE,TEAL,2,13),text(359,258,"FAIBLE RISQUE · STANDARD",19,850,TEAL,"middle"),
        rect(84,304,550,120,BLUE_PALE,BLUE,2,13),multiline(106,336,["INTERMÉDIAIRE FAVORABLE · SÉLECTION", "ISUP · PSA / densité · cT · IRM", "biopsies ciblées + systématiques · charge tumorale"],16,850,INK,27),
        rect(692,152,602,314,WHITE,BLUE,3,18),text(718,187,"ÉLIGIBILITÉ DU PATIENT",16,850,BLUE),
        multiline(718,232,["Espérance de vie compatible avec bénéfice curatif", "souvent > 10 ans selon les référentiels", "Préférences et tolérance à l’incertitude", "Capacité à suivre IRM / biopsies / PSA"],18,750,INK,45),
        rect(58,494,1236,124,CORAL_PALE,CORAL,2,17),text(82,528,"SIGNAL D’EXCLUSION FORT",15,850,CORAL),
        multiline(82,561,["Architecture cribriforme ou intracanalaire : exclusion selon consensus CCAFU–EAU.", "IRM visible, histoire familiale ou mutation modifient l’incertitude mais ne produisent pas à elles seules une règle identique."],16,800,INK,25),
        rect(58,642,1236,34,INK,INK,0,10),text(676,665,"Intention curative conservée · traitement différé si reclassification documentée",15,750,WHITE,"middle"),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · RecoRad 2025")
    return "\n".join(p)


def surveillance_monitoring():
    p = base(
        "Surveillance active : le PSA alerte, l’histologie arbitre",
        "Calendrier + gate de reclassification",
        "Calendrier multidimensionnel associant PSA, clinique, IRM et biopsies, puis gate de reclassification distinguant alerte biologique ou radiologique et confirmation histologique.",
    )
    p += [
        rect(58,152,1236,112,TEAL_PALE,TEAL,3,17),text(82,184,"PROGRAMME STRUCTURÉ",14,850,TEAL,spacing=.7),
        text(82,224,"PSA répété, habituellement ~6 mois",17,800,INK),text(432,224,"Clinique",17,800,INK),text(628,224,"IRM sériée",17,800,INK),text(850,224,"Biopsies de contrôle",17,800,INK),
        '<path d="M676 264 L676 306" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58,306,380,238,WHITE,BLUE,3,18),text(84,341,"QUALITÉ INITIALE",15,850,BLUE),
        multiline(84,386,["IRM prébiopsique", "Ciblées + systématiques", "Concordance", "→ confirmation précoce", "parfois allégeable"],17,750,INK,31),
        rect(478,306,380,238,WHITE,ORANGE,3,18),text(504,341,"SIGNAL DE CHANGEMENT",15,850,ORANGE),
        multiline(504,386,["PSA / PSADT", "Progression IRM", "Nouvelle anomalie clinique", "= ALERTE", "≠ traitement automatique"],17,750,INK,31),
        rect(898,306,396,238,WHITE,CORAL,3,18),text(924,341,"ARBITRAGE",15,850,CORAL),
        multiline(924,386,["Biopsie en règle", "ISUP 3 ou cribriforme/IDC", "→ traitement différé", "ISUP 2 : contextualiser", "Comorbidité : parfois WW"],17,750,INK,31),
        '<path d="M438 425 L478 425" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M858 425 L898 425" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58,574,1236,102,CORAL_PALE,CORAL,2,15),
        multiline(82,606,["IRM stable ≠ suppression automatique de toute biopsie.", "Allègement seulement si stabilité combinée IRM + densité PSA + histologie antérieure + protocole."],16,850,INK,27),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026")
    return "\n".join(p)


def watchful_waiting():
    p = base(
        "Abstention-surveillance : une intention palliative différée",
        "Comparaison d’intentions",
        "Comparaison entre surveillance active et abstention-surveillance, centrée sur intention, population, suivi et déclencheur d’intervention.",
    )
    p += [
        rect(58,152,602,394,WHITE,BLUE,3,18),text(84,188,"SURVEILLANCE ACTIVE",17,850,BLUE),
        rect(84,216,550,52,BLUE_PALE,BLUE,2,13),text(359,249,"INTENTION CURATIVE CONSERVÉE",15,850,BLUE,"middle"),
        multiline(84,310,["Bénéfice curatif encore attendu", "PSA + clinique + IRM + biopsies", "Reclassification tumorale", "→ traitement radical différé"],18,750,INK,48),
        rect(692,152,602,394,WHITE,ORANGE,3,18),text(718,188,"ABSTENTION–SURVEILLANCE",17,850,ORANGE),
        rect(718,216,550,52,ORANGE_PALE,ORANGE,2,13),text(993,249,"QUALITÉ DE VIE / PALLIATIF SI BESOIN",15,850,ORANGE,"middle"),
        multiline(718,310,["Bénéfice curatif non utile attendu", "souvent espérance de vie < 10 ans", "Suivi clinique individualisé", "→ traiter symptômes ou menace"],18,750,INK,48),
        rect(58,576,1236,100,CORAL_PALE,CORAL,2,15),
        text(82,608,"L’ÂGE SEUL NE DÉCIDE PAS",15,850,CORAL),
        multiline(82,638,["Comorbidités · fragilité · autonomie · risque tumoral · délai avant bénéfice · préférences", "L’abstention-surveillance peut concerner tout groupe de risque si les risques concurrents dominent."],16,800,INK,25),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026")
    return "\n".join(p)


def focal_therapy():
    p = base(
        "Traitement focal : promesse fonctionnelle, preuve oncologique incomplète",
        "Chaîne de preuve et d’incertitude",
        "Chaîne depuis la cartographie IRM-biopsies jusqu’au traitement focal et à la surveillance, avec multifocalité, limites de preuve et cadre prospectif explicites.",
    )
    steps=[
        (58,TEAL,TEAL_PALE,"1 · CARTOGRAPHIER",["IRM + biopsies", "ciblées et systématiques", "lésion index", "multifocalité possible"]),
        (366,BLUE,BLUE_PALE,"2 · TRAITER UNE ZONE",["HIFU", "cryothérapie", "électroporation", "préserver fonctions espérées"]),
        (674,ORANGE,ORANGE_PALE,"3 · SURVEILLER",["PSA + IRM", "biopsies de suivi", "résiduel dedans/dehors", "retraitement possible"]),
        (982,CORAL,CORAL_PALE,"4 · NOMMER LA PREUVE",["séries hétérogènes", "suivi long incomplet", "pas standard équivalent", "essai / registre prospectif"]),
    ]
    for x,color,pale,title_value,lines in steps:
        p += [rect(x,158,288,388,WHITE,color,3,18),text(x+20,193,title_value,14,850,color)]
        yy=235
        for line in lines:
            p += [rect(x+20,yy,248,47,pale,pale,0,11),text(x+34,yy+30,line,15,750,INK)];yy+=60
    p += [
        '<path d="M346 352 L366 352" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M654 352 L674 352" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        '<path d="M962 352 L982 352" stroke="#24313A" stroke-width="3" marker-end="url(#arrow)"/>',
        rect(58,576,1236,100,INK,INK,0,15),
        text(82,608,"DÉCISION PARTAGÉE",14,850,"#BBD8D2"),
        multiline(82,637,["Comparer surveillance active, traitement focal expérimental et standards avec le même niveau de détail.", "Le choix du patient n’annule pas l’obligation de nommer l’incertitude oncologique à long terme."],16,750,WHITE,24),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · cadre prospectif requis")
    return "\n".join(p)


def shared_decision():
    p = base(
        "Décision partagée : comparer des trajectoires complètes et révisables",
        "Matrice de délibération",
        "Matrice de décision partagée comparant bénéfice, délai, toxicité, charge de suivi et rattrapage, puis documentant préférences et plan de réévaluation.",
    )
    p += [
        rect(58,152,1236,306,WHITE,TEAL,3,18),
        f'<rect x="58" y="152" width="1236" height="56" rx="18" fill="{INK}"/>',
        text(80,187,"TRAJECTOIRE",14,850,WHITE),text(340,187,"BÉNÉFICE / DÉLAI",14,850,WHITE),text(640,187,"TOXICITÉS / CHARGE",14,850,WHITE),text(1010,187,"SUITE POSSIBLE",14,850,WHITE),
    ]
    rows=[
        (208,TEAL_PALE,"Surveillance active","Curatif conservé","IRM / biopsies / incertitude","Traitement différé si reclassement"),
        (290,ORANGE_PALE,"Abstention-surveillance","Pas de bénéfice curatif utile","Suivi clinique allégé","Palliatif si symptômes / menace"),
        (372,BLUE_PALE,"Traitement radical","Contrôle local attendu","Urinaire / sexuel / digestif","Suivi + rattrapage selon option"),
    ]
    for y,fill,a,b,c,d in rows:
        p += [f'<rect x="59" y="{y}" width="1234" height="82" fill="{fill}" opacity="0.75"/>',text(80,y+49,a,16,850,INK),text(340,y+49,b,15,750,INK),text(640,y+49,c,15,750,INK),text(1010,y+49,d,15,750,INK)]
    p += [
        rect(58,490,602,186,BLUE_PALE,BLUE,2,17),text(82,524,"DOCUMENTER",15,850,BLUE),
        multiline(82,558,["Options présentées", "Incertitudes", "Priorités du patient", "Choix et raisons"],17,750,INK,29),
        rect(692,490,602,186,ORANGE_PALE,ORANGE,2,17),text(716,524,"RÉVISER",15,850,ORANGE),
        multiline(716,558,["Calendrier", "Seuils de réévaluation", "Évolution de santé / préférences", "Changer de trajectoire ≠ erreur initiale"],17,750,INK,29),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · RecoRad 2025")
    return "\n".join(p)


def definitive_indications():
    p = base(
        "Radiothérapie définitive : le risque fixe le socle, pas tous les détails",
        "Matrice risque–intention",
        "Matrice des indications de radiothérapie externe par groupe de risque, distinguant surveillance active, ADT absente, courte ou longue, et décisions séparées sur pelvis, boost et volumes.",
    )
    p += [rect(58,152,1236,368,WHITE,TEAL,3,18)]
    headers=[("RISQUE",58,260),("SOCLE",318,390),("ADT",708,260),("À DÉCIDER SÉPARÉMENT",968,326)]
    for label,x,w in headers:
        p += [f'<rect x="{x}" y="152" width="{w}" height="56" fill="{INK}"/>',text(x+18,187,label,14,850,WHITE,spacing=.5)]
    rows=[
        (208,TEAL_PALE,"Faible (SA si éligible)","RT externe si traitement choisi","Sans ADT","Fonction / anatomie / préférence"),
        (286,BLUE_PALE,"Intermédiaire favorable","RT externe curative","Généralement sans ADT","Fractionnement / faisabilité"),
        (364,ORANGE_PALE,"Intermédiaire défavorable","RT externe curative","Courte 4–6 mois","Pelvis et boost non automatiques"),
        (442,CORAL_PALE,"Haut risque / localement avancé","RT prostatique haute dose ± extensions","ADT longue","VS / pelvis / boost / intensification"),
    ]
    for y,fill,a,b,c,d in rows:
        p += [f'<rect x="59" y="{y}" width="1234" height="78" fill="{fill}" opacity="0.75"/>',text(80,y+47,a,15,850,INK),text(340,y+47,b,14,750,INK),text(730,y+47,c,14,850,INK),text(990,y+47,d,14,750,INK)]
    p += [
        rect(58,552,1236,124,BLUE_PALE,BLUE,2,16),text(82,585,"PRESCRIPTION À DÉCOMPOSER",15,850,BLUE),
        multiline(82,616,["Cible prostatique / vésicules · pelvis · boost focal ou curiethérapique · fractionnement · IGRT · ADT", "Une étiquette de risque ne déclenche pas automatiquement toutes les composantes."],16,800,INK,27),
    ]
    footer(p,"SOURCES · RecoRad 2025 · CCAFU 2024–2026 · EAU 2026")
    return "\n".join(p)


def definitive_brachy():
    p = base(
        "Curiethérapie : monothérapie et boost sont deux intentions distinctes",
        "Comparaison d’intentions",
        "Comparaison entre curiethérapie LDR exclusive pour profils favorables et boost LDR ou HDR associé à la radiothérapie externe dans des risques plus élevés.",
    )
    p += [
        rect(58,152,602,386,WHITE,BLUE,3,18),text(84,188,"MONOTHÉRAPIE LDR · IODE 125",17,850,BLUE),
        rect(84,218,550,52,BLUE_PALE,BLUE,2,13),text(359,251,"FAIBLE / INTERMÉDIAIRE FAVORABLE SÉLECTIONNÉ",14,850,BLUE,"middle"),
        multiline(84,316,["Traitement exclusif", "Fonction urinaire / volume", "TURP / anatomie pubienne", "Expertise du centre"],18,750,INK,48),
        rect(692,152,602,386,WHITE,ORANGE,3,18),text(718,188,"BOOST LDR OU HDR + RT EXTERNE",17,850,ORANGE),
        rect(718,218,550,52,ORANGE_PALE,ORANGE,2,13),text(993,251,"INTERMÉDIAIRE DÉFAVORABLE / HAUT RISQUE",14,850,ORANGE,"middle"),
        multiline(718,316,["Intensification locale", "ADT adaptée au risque", "Pas un simple fractionnement externe", "Sélection urinaire stricte"],18,750,INK,48),
        rect(58,568,1236,108,CORAL_PALE,CORAL,2,15),
        text(82,601,"BALANCE DU BOOST",15,850,CORAL),
        multiline(82,632,["Meilleur contrôle biochimique dans les essais de référence · pas de bénéfice de survie globale démontré", "Toxicité génito-urinaire accrue · information et expérience de l’équipe déterminantes"],16,850,INK,25),
    ]
    footer(p,"SOURCES · RecoRad 2025 · CCAFU 2024–2026 · EAU 2026")
    return "\n".join(p)


def definitive_adt():
    p = base(
        "ADT avec RT : durée, calendrier et prévention forment une prescription",
        "Matrice de durée + sécurité",
        "Matrice des durées d’ADT avec radiothérapie définitive selon risque, suivie d’une checklist de prescription et de prévention.",
    )
    p += [
        rect(58,152,1236,248,WHITE,TEAL,3,18),
        f'<rect x="58" y="152" width="1236" height="56" rx="18" fill="{INK}"/>',
        text(80,187,"GROUPE",14,850,WHITE),text(420,187,"ADT AVEC RT",14,850,WHITE),text(760,187,"REPÈRE",14,850,WHITE),text(1010,187,"LIMITE",14,850,WHITE),
    ]
    rows=[
        (208,TEAL_PALE,"Faible / intermédiaire favorable","Généralement non","—","Ne pas sous-classer pour l’omettre"),
        (272,ORANGE_PALE,"Intermédiaire défavorable","Courte","4–6 mois","Contexte et vulnérabilités"),
        (336,CORAL_PALE,"Haut risque","Longue","18–36 m ; 2–3 ans","36 m non > 18 m dans l’essai cité"),
    ]
    for y,fill,a,b,c,d in rows:
        p += [f'<rect x="59" y="{y}" width="1234" height="64" fill="{fill}" opacity="0.75"/>',text(80,y+39,a,16,850,INK),text(420,y+39,b,16,850,INK),text(760,y+39,c,15,750,INK),text(1010,y+39,d,14,750,INK)]
    p += [
        rect(58,430,1236,174,BLUE_PALE,BLUE,2,17),text(82,465,"PRESCRIPTION COMPLÈTE",15,850,BLUE),
        multiline(82,500,["Classe / molécule · date de début · position par rapport à la RT · durée cible · date de fin prévue", "Prévention osseuse et métabolique · risque CV · santé sexuelle · surveillance · critères d’adaptation"],17,800,INK,31),
        rect(58,628,1236,48,CORAL_PALE,CORAL,2,12),
        text(676,658,"Abiratérone dans certains très hauts risques / cN1 : critères spécifiques du bloc haut risque, jamais déduction automatique.",15,850,INK,"middle"),
    ]
    footer(p,"SOURCES · RecoRad 2025 · CCAFU 2024–2026 · EAU 2026 · ESTRO-ACROP 2023")
    return "\n".join(p)


def staging_risk_groups():
    p = base(
        "Groupes de risque EAU : conserver les variables sources",
        "Grille PSA–cT–ISUP",
        "Tableau de la grille EAU distinguant faible risque, intermédiaire favorable et défavorable, haut risque localisé et localement avancé selon PSA, cT et ISUP.",
    )
    p += [rect(58,152,1236,408,WHITE,TEAL,3,18)]
    headers=[("CATÉGORIE",58,288),("ISUP",346,220),("PSA",566,270),("cT / cN",836,458)]
    for label,x,w in headers:
        p += [f'<rect x="{x}" y="152" width="{w}" height="56" fill="{INK}"/>',text(x+18,187,label,14,850,WHITE)]
    rows=[
        (208,TEAL_PALE,"Faible","1","< 10 ng/mL","cT1–2"),
        (278,BLUE_PALE,"Intermédiaire favorable","2 avec PSA <10, ou ISUP 1","10–20 si ISUP 1","cT1–2"),
        (348,ORANGE_PALE,"Intermédiaire défavorable","2 avec PSA 10–20, ou ISUP 3","< 20 selon combinaison","cT1–2"),
        (418,CORAL_PALE,"Haut risque localisé","4–5","ou > 20 ng/mL","cT1–2"),
        (488,"#F2ECFA","Localement avancé","tout ISUP","tout PSA","cT3–4 ou cN+"),
    ]
    for y,fill,a,b,c,d in rows:
        p += [f'<rect x="59" y="{y}" width="1234" height="70" fill="{fill}" opacity="0.76"/>',text(80,y+43,a,15,850,INK),text(368,y+43,b,14,750,INK),text(588,y+43,c,14,750,INK),text(858,y+43,d,15,850,INK)]
    p += [
        rect(58,590,1236,86,CORAL_PALE,CORAL,2,15),
        multiline(82,620,["Toujours nommer référentiel + version + PSA + cT + ISUP.", "EAU et D’Amico ne découpent pas exactement les mêmes catégories ; « intermédiaire » seul n’est pas transmissible."],16,850,INK,25),
    ]
    footer(p,"SOURCE DE LA GRILLE · EAU 2026 · comparaison CCAFU/D’Amico dans la leçon")
    return "\n".join(p)


def staging_imaging():
    p = base(
        "Bilan d’extension : intensifier l’imagerie seulement si elle peut agir",
        "Matrice risque–imagerie",
        "Matrice des indications d’imagerie de stadification EAU selon faible risque, intermédiaire favorable, intermédiaire défavorable et haut risque ou localement avancé.",
    )
    p += [
        rect(58,152,1236,86,TEAL_PALE,TEAL,3,17),text(82,184,"QUESTION AVANT MODALITÉ",14,850,TEAL),
        text(82,217,"Le résultat peut-il modifier volumes, parcours local ou stratégie systémique ?",19,800,INK),
    ]
    cards=[
        (58,BLUE,BLUE_PALE,"FAIBLE / INTERMÉDIAIRE FAVORABLE",["EAU : pas d’imagerie", "additionnelle de stadification", "en routine"]),
        (470,ORANGE,ORANGE_PALE,"INTERMÉDIAIRE DÉFAVORABLE",["PSMA-PET si disponible", "sinon au minimum imagerie", "abdominopelvienne + osseuse"]),
        (882,CORAL,CORAL_PALE,"HAUT RISQUE / LOCALEMENT AVANCÉ",["Dépistage métastatique", "PSMA-PET si disponible", "ou imagerie conventionnelle"]),
    ]
    for x,color,pale,title_value,lines in cards:
        p += [rect(x,268,382,280,WHITE,color,3,18),text(x+24,304,title_value,14,850,color)]
        p.append(multiline(x+24,354,lines,18,750,INK,38))
    p += [
        rect(58,576,1236,100,CORAL_PALE,CORAL,2,15),
        text(82,608,"CONVENTION D’IMAGERIE À TRACER",15,850,CORAL),
        multiline(82,638,["Le PSMA-PET est plus performant, mais de nombreux essais ont défini stades et volumes en imagerie conventionnelle.", "Migration de stade moléculaire ≠ preuve que la stratégie historique garde exactement le même effet."],16,800,INK,25),
    ]
    footer(p,"SOURCES · EAU 2026 · CCAFU 2024–2026 · EANM/SNMMI 2023")
    return "\n".join(p)


def staging_psma_limits():
    p = base(
        "PSMA-PET : meilleure détection, nouvelles incertitudes",
        "Trois limites d’interprétation",
        "Trois panneaux expliquent migration de stade, faux négatif à faible volume ou faible expression, et faux positif ou fixation non spécifique.",
    )
    cards=[
        (58,TEAL,TEAL_PALE,"1 · MIGRATION DE STADE",["Lésion auparavant invisible", "catégorie moléculaire plus avancée", "biologie non soudainement changée"],"Ne pas copier sans nuance les essais historiques"),
        (470,BLUE,BLUE_PALE,"2 · NÉGATIF ≠ STÉRILE",["Micrométastases sous résolution", "tumeur faiblement PSMA", "risque prétest persistant"],"Absence de cible certaine au seuil de méthode"),
        (882,ORANGE,ORANGE_PALE,"3 · FIXATION ≠ CANCER",["ganglions sympathiques", "lésions bénignes / inflammation", "autres tumeurs possibles"],"Corrélat morphologique et confirmation si enjeu majeur"),
    ]
    for x,color,pale,title_value,lines,note in cards:
        p += [rect(x,158,382,432,WHITE,color,3,18),text(x+24,194,title_value,15,850,color)]
        yy=238
        for line in lines:
            p += [rect(x+24,yy,334,52,pale,pale,0,12),text(x+42,yy+32,line,15,750,INK)];yy+=66
        p += [rect(x+24,454,334,106,CORAL_PALE,CORAL,2,13),multiline(x+43,486,note.split(" | "),15,850,CORAL,22)]
    p += [rect(58,620,1236,56,INK,INK,0,13),text(676,655,"Interpréter localisation + intensité + morphologie + risque prétest + conséquence de la décision.",16,750,WHITE,"middle")]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · EANM/SNMMI 2023")
    return "\n".join(p)


def staging_germline_somatic():
    p = base(
        "Germinal ou somatique : deux échantillons, deux responsabilités",
        "Comparaison des voies de test",
        "Comparaison entre test germinal constitutionnel et test somatique tumoral ou ADN tumoral circulant, avec déclencheurs d’oncogénétique et conséquences patient-famille-traitement.",
    )
    p += [
        rect(58,152,602,352,WHITE,BLUE,3,18),text(84,188,"GERMINAL",18,850,BLUE),
        rect(84,216,550,52,BLUE_PALE,BLUE,2,13),text(359,249,"SANG / SALIVE · VARIATION CONSTITUTIONNELLE",14,850,BLUE,"middle"),
        multiline(84,312,["Question : risque héréditaire", "Conséquence : patient + famille", "Information / consentement / conseil", "Cascade familiale possible"],18,750,INK,42),
        rect(692,152,602,352,WHITE,TEAL,3,18),text(718,188,"SOMATIQUE",18,850,TEAL),
        rect(718,216,550,52,TEAL_PALE,TEAL,2,13),text(993,249,"TUMEUR / ctDNA · ALTÉRATION ACQUISE",14,850,TEAL,"middle"),
        multiline(718,312,["Question : option thérapeutique", "Panel / échantillon / ligne", "Altération parfois germinale", "→ confirmation dédiée si signal"],18,750,INK,42),
        rect(58,534,1236,142,ORANGE_PALE,ORANGE,2,16),text(82,567,"SIGNAUX D’ONCOGÉNÉTIQUE",15,850,ORANGE),
        multiline(82,599,["Maladie agressive ou métastatique jeune · agrégation familiale précoce · histoire sein–ovaire / Lynch", "BRCA1/2 somatique · test sans conséquence anticipée = ambiguïté, pas médecine de précision"],16,800,INK,27),
    ]
    footer(p,"SOURCES · CCAFU 2024–2026 · EAU 2026 · ASCO Genomic Testing 2025")
    return "\n".join(p)


OUTPUTS={
    FIG/"postprostatectomy-recurrence"/"03-psma.svg":postrp_psma,
    FIG/"postprostatectomy-recurrence"/"04-early-salvage.svg":early_salvage,
    FIG/"postprostatectomy-recurrence"/"05-adt.svg":postrp_adt,
    FIG/"localized-curative-options"/"01-context.svg":localized_context,
    FIG/"localized-curative-options"/"02-surgery.svg":surgery,
    FIG/"localized-curative-options"/"04-brachytherapy.svg":brachy,
    FIG/"localized-curative-options"/"05-multimodal.svg":multimodal,
    FIG/"mcrpc-precision-palliation"/"01-state.svg":mcrpc_state,
    FIG/"mcrpc-precision-palliation"/"04-rare-biomarkers.svg":mcrpc_rare,
    FIG/"mcrpc-precision-palliation"/"08-sequence.svg":mcrpc_sequence,
    FIG/"deferred-management"/"01-active-surveillance.svg":active_surveillance,
    FIG/"deferred-management"/"02-monitoring-and-reclassification.svg":surveillance_monitoring,
    FIG/"deferred-management"/"03-watchful-waiting.svg":watchful_waiting,
    FIG/"deferred-management"/"04-focal-and-shared-decision.svg":focal_therapy,
    FIG/"deferred-management"/"05-shared-decision.svg":shared_decision,
    FIG/"definitive-radiotherapy"/"01-definitive-rt-01-indications.svg":definitive_indications,
    FIG/"definitive-radiotherapy"/"04-definitive-rt-04-brachytherapy.svg":definitive_brachy,
    FIG/"definitive-radiotherapy"/"07-definitive-rt-07-adt.svg":definitive_adt,
    FIG/"staging-risk-biomarkers"/"02-risk-groups.svg":staging_risk_groups,
    FIG/"staging-risk-biomarkers"/"03-imaging-indications.svg":staging_imaging,
    FIG/"staging-risk-biomarkers"/"04-psma-limits.svg":staging_psma_limits,
    FIG/"staging-risk-biomarkers"/"06-germline-somatic.svg":staging_germline_somatic,
}

if __name__ == "__main__":
    for path,render in OUTPUTS.items():
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(render()+"\n",encoding="utf-8")
        print(path.relative_to(ROOT))
