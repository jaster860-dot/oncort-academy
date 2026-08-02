# État QA des figures prostate — seconde passe

_2 août 2026 · 91 figures · 15 blocs_

## Ce qui est vérifié sur tout le corpus

- **Méthode choisie figure par figure :** 91 entrées routées vers six méthodes dans `figure_method_manifest.json`; aucun moteur universel n'est imposé.
- **Rendu en contexte :** 182 contrôles, soit les 91 leçons sur desktop et mobile.
- **Design :** image chargée, dimensions minimales, largeur utile, absence de débordement gauche/droite et absence de statut technique visible.
- **Traçabilité :** les statuts internes et journaux de provenance sont conservés, mais les mentions techniques de revue ne sont plus affichées à l'apprenant.
- **Contenu :** titres, légendes et textes alternatifs sont confrontés au message scientifique de la leçon; les figures quantitatives doivent nommer population, axes, unités, comparateur, critère et origine des données.

## Figures reconstruites individuellement pendant cette passe

**48 figures à dette initiale élevée** ont reçu un brief et un rendu spécifiques, au lieu d'une simple variation de quatre libellés :

- planification RT : simulation, volumes, OAR, DVH, IGRT;
- RT définitive : pelvis et boost;
- détection : IRM–PI-RADS;
- situations complexes : MICI, post-TURP, prothèses de hanche;
- postopératoire : TEP-PSMA, salvage précoce, ADT avec salvage et lit prostatique;
- oligorecurrence : ganglions et lecture critique STOMP/RADIOSA;
- haut risque/cN1 : définition d'état, parcours locaux, STAMPEDE M0, cN1 M0, divergence des guides;
- mHSPC : doublet/triplet et RT prostatique de STAMPEDE bras H;
- traitements systémiques : ADT, ADT–RT, ARPI, taxanes et prévention osseuse/métabolique/CV.
- options curatives localisées : filtre des options, trajectoire chirurgicale, curiethérapie et parcours multimodaux; la figure EBRT spécifique était déjà jugée suffisamment informative.
- mCRPC : confirmation de l'état, matrice des biomarqueurs rares et séquençage; les autres figures du bloc avaient déjà des repères moléculaires, radiopharmaceutiques ou palliatifs spécifiques jugés suffisants à ce stade.
- stratégies différées : éligibilité à la surveillance active, calendrier de reclassification, abstention-surveillance, traitement focal et décision partagée.
- RT définitive : indications par risque, curiethérapie exclusive versus boost, et ADT associée avec durées et prévention; les figures d'hypofractionnement modéré et de SBRT étaient déjà suffisamment spécifiques.
- stadification : grille de risque EAU, indications d'imagerie, limites du PSMA-PET et voies germinale/somatique; les figures TNM et probabilité ganglionnaire étaient déjà suffisamment spécifiques.

## Règles scientifiques appliquées

1. Une coupe anatomique ou un overlay d'imagerie n'est utilisé que si la relation spatiale est le message de la leçon.
2. Un graphique n'est utilisé que pour des données agrégées publiées ou des données synthétiques explicitement déclarées.
3. Les essais ne sont pas comparés indirectement lorsque populations, traitements ou critères diffèrent.
4. Les critères d'éligibilité et les conventions d'imagerie sont affichés avant les résultats.
5. Les algorithmes ne créent pas de branches ou de causalité absentes du texte source.
6. Une checklist montre des contrôles à réaliser, jamais des cases prévalidées.
7. Si aucun visuel n'ajoute d'information, la préférence va à une comparaison structurée ou à un repli textuel plutôt qu'à une pseudo-anatomie décorative.

## Dette restante et priorité

Les 43 autres figures ont passé la remédiation de sécurité et le contrôle de rendu, mais plusieurs restent pédagogiquement moins denses que les 48 reconstructions individualisées. Elles ne sont pas déclarées équivalentes à cette seconde passe. La poursuite doit prioriser :

1. les figures restantes uniquement si leur second audit révèle un message encore sous-spécifié;
2. conserver les rendus déjà spécifiques plutôt que les remplacer pour homogénéiser artificiellement le style.

## Gate avant intégration

Une figure ne passe que si les quatre contrôles suivants sont simultanément satisfaits :

- **scientifique :** message exact, population et limites explicites, aucune extrapolation silencieuse;
- **sémiotique :** axes, formes, flèches, espaces et couleurs ont une signification défendable;
- **design :** aucune collision, troncature ou surcharge sur desktop et mobile;
- **intégration :** légende, texte alternatif, source, repli textuel, tests et build cohérents.

Ce document distingue donc clairement un **passage QA de rendu sur 91/91** d'une **seconde passe scientifique individualisée sur 48/91**. Il ne transforme pas les contrôles automatiques en validation clinique.
