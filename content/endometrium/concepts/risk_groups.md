# Groupes de risque postopératoires

Status: needs_review

## Fait

Les groupes pronostiques postopératoires ESGO–ESTRO–ESP 2025 combinent le stade FIGO 2023, l'histotype, le grade, l'intensité du LVSI, l'atteinte ganglionnaire, la classe moléculaire et, pour certaines tumeurs NSMP, le statut des récepteurs aux œstrogènes.[^1]

Ils définissent quatre catégories principales selon le risque global estimé de récidive à cinq ans :

- faible : moins de 8 % ;
- intermédiaire : 8 à 14 % ;
- intermédiaire élevé : 15 à 24 % ;
- élevé : au moins 25 %.

Certaines situations restent de risque incertain faute de données suffisantes.[^1]

## Pourquoi c'est important

Une même extension anatomique peut correspondre à des risques différents selon la biologie moléculaire. Inversement, une caractéristique défavorable isolée ne suffit pas toujours à définir le traitement. Le groupe de risque sert à estimer le profil de rechute et le bénéfice absolu attendu d'une stratégie adjuvante.

## Conséquence clinique

Dans le cadre européen 2025 :

- le faible risque conduit généralement à l'absence de traitement adjuvant ;
- le risque intermédiaire conduit à discuter principalement une curiethérapie vaginale, avec possibilité d'abstention dans des situations sélectionnées ;
- le risque intermédiaire élevé conduit à privilégier la radiothérapie externe pelvienne pour le contrôle pelvien, avec des alternatives conditionnelles ;
- le haut risque conduit à discuter une stratégie combinant radiothérapie et traitement systémique, modulée par la classe moléculaire et le stade.

Ce résumé est un cadre de raisonnement. Il ne remplace pas la table détaillée des groupes de risque ni la discussion RCP.

## Conséquence en RCP

La présentation doit expliciter :

- le stade FIGO 2023 complet, avec suffixe moléculaire lorsqu'il est applicable ;
- l'histotype et le grade ;
- l'invasion myométriale et cervicale ;
- le LVSI absent, focal ou substantiel ;
- la stadification ganglionnaire, y compris le volume des métastases ganglionnaires ;
- la classe moléculaire `POLEmut`, `MMRd`, `NSMP` ou `p53abn` ;
- le statut des récepteurs aux œstrogènes pour la stratification de certaines tumeurs NSMP ;
- le groupe de risque, la dominante vaginale, pelvienne ou distante et l'objectif de chaque traitement proposé.

## Piège fréquent

Confondre trois niveaux distincts :

1. le stade FIGO, qui décrit l'extension et certains paramètres biologiques ;
2. le groupe pronostique, qui estime la probabilité de récidive ;
3. la recommandation thérapeutique, qui ajoute le bénéfice attendu, la toxicité, la stadification ganglionnaire et les facteurs liés à la patiente.

## Point émergent

PORTEC-4a a testé un algorithme adjuvant fondé sur un profil moléculaire intégré chez des patientes à risque intermédiaire élevé. Cet essai renforce la plausibilité d'une individualisation moléculaire, mais son algorithme ne doit pas être présenté comme une règle universelle indépendante des recommandations et du contexte clinique.[^2]

## Micro-question

Quelle question doit précéder « curiethérapie ou radiothérapie pelvienne » ?

Réponse attendue : quel est le groupe pronostique complet, quel profil de rechute domine et quelle modalité traite ce profil avec le meilleur rapport bénéfice–toxicité ?

## Prérequis

- `figo_2023_staging`
- `lvsi`
- `molecular_classification`
- `histologic_subtypes`
- `myometrial_invasion`

## Sources

- `esgo_estro_esp_2025`
- `esgo_estro_esp_2025_appendix`
- `sfro_2025`
- `portec2_10y_2018`
- `portec4a_2026`

---

[^1]: Concin N, et al. (2025). "ESGO-ESTRO-ESP guidelines for the management of patients with endometrial carcinoma: update 2025." _The Lancet Oncology_. https://pubmed.ncbi.nlm.nih.gov/40744042/

[^2]: van den Heerik ASVM, et al. (2026). "Molecular profile-based adjuvant treatment for women with high-intermediate risk endometrial cancer (PORTEC-4a)." _The Lancet Oncology_. https://pubmed.ncbi.nlm.nih.gov/41449145/
