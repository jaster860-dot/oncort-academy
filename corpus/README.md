# Corpus documentaire de l’Academy

*Catalogue France-first de recommandations, référentiels et cadres de compétences — état initial au 31 juillet 2026.*

---

## 🎯 Objectif

Le corpus relie les documents utiles aux 77 cours du curriculum. Le fichier
`source_manifest.json` est la source de vérité révisable. Le fichier
`catalog.sqlite` est un index généré pour l’application.

Un document archivé n’est pas automatiquement validé comme contenu pédagogique.
La mise en ligne d’une synthèse exige une vérification médicale et une
traçabilité des affirmations.

---

## 🧭 Hiérarchie des sources

1. Autorités et sociétés savantes françaises : INCa, HAS, SFRO, TNCD, AFU.
2. Réseaux régionaux français : Onco AURA, ARISTOT, Oncologik.
3. Sociétés européennes : ESMO, ESTRO et sociétés d’organe.
4. Sociétés internationales lorsque nécessaire.
5. Essais pivots et méta-analyses pour les controverses ou les changements de
   pratique.

La date, la juridiction, le statut et le niveau d’accès sont enregistrés pour
chaque document.

---

## 🔐 Niveaux d’accès

- `full_text_local` : copie locale techniquement validée et empreinte SHA-256.
- `web_native` : source officielle consultable en ligne, sans copie locale.
- `restricted` : métadonnées et lien seulement; aucun contournement d’accès.
- `pending_verification` : piste non admise dans le corpus clinique tant que sa
  provenance ou sa version ne sont pas confirmées.

Les PDF Onco AURA portent une interdiction de reproduction. Ils sont donc
conservés uniquement comme références privées locales, sans republication ni
réutilisation automatique du texte.

Le RecoRad 2025 transmis par Sami suit la même règle : le PDF et son extraction
plein texte restent dans des chemins ignorés par Git. Seul son index de
métadonnées (29 articles, DOI, pages et cours associés) peut alimenter le
catalogue de l’application.

---

## 🗂️ Organisation

```text
corpus/
├── documents/
│   ├── france/
│   └── europe/
├── indexes/                 # métadonnées partageables, sans plein texte privé
├── private/                 # extractions privées, ignorées par Git
├── quarantine/
├── source_manifest.json
├── catalog.sqlite
├── catalog_report.json
├── course_coverage.json
├── intervention_required.json # accès licenciés et validation attendue de Sami
└── task_state.json
```

Les réponses HTML reçues à la place d’un PDF sont placées en quarantaine et ne
sont jamais indexées comme texte intégral.

---

## ✅ Reconstruction et contrôle

```bash
python3 scripts/build_corpus_catalog.py
```

Le contrôle refuse :

- un identifiant de cours inconnu;
- un organisme inconnu;
- un fichier local manquant;
- un faux PDF;
- un texte intégral déclaré sans fichier local.

Le rapport distingue volontairement :

- une source `core`, utilisable comme référentiel clinique principal après
  revue;
- une source de contexte;
- un simple index de découverte;
- un cadre de compétences.

Cette distinction évite d’annoncer artificiellement qu’un cours est couvert
parce qu’un portail généraliste le mentionne.

`course_coverage.json` donne l’état détaillé cours par cours. Le statut
`core_started` signifie seulement qu’au moins un référentiel principal est
indexé; il ne signifie jamais que le cours est déjà exhaustif.

Au 31 juillet 2026, le catalogue contient 108 documents issus de 41 organismes,
dont 46 PDF locaux validés, 56 sources web officielles et six références
commerciales restreintes. Les 77 cours ont au moins une source cœur; 69 en ont
au moins deux et aucun cours ne repose désormais sur une seule ressource liée.

Ce jalon valide le socle documentaire et sa triangulation initiale. Il ne valide
pas encore la synthèse exhaustive de chaque cours, la résolution des divergences
entre recommandations ni la revue médicale finale.
