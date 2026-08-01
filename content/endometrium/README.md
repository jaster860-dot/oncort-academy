# Pilote endomètre

*Première localisation test d'OncoRT Academy — version de travail du 31 juillet 2026*

---

## 🎯 Objectif

Prouver une boucle pédagogique clinique complète :

`cas clinique → réponse libre → analyse du raisonnement → lacune prérequise → capsule ciblée → re-test → mise à jour de la maîtrise`

Le pilote doit entraîner le raisonnement d'un oncologue radiothérapeute, pas seulement la mémorisation d'une recommandation.

## 🚦 État actuel

- Curriculum : structure corrigée, `needs_review`.
- Référentiel médical : ancré sur ESGO-ESTRO-ESP 2025 et complété par les essais structurants.
- Capsules LVSI, groupes de risque, drainage lymphatique et curiethérapie versus RT pelvienne : révisées, `needs_review`.
- Premier cas `endo_case_001_lvsi_reasoning` : cas, grille, remédiation et re-test structurés.
- Autres cas et questions : brouillons à réviser.
- Validation médicale : aucune fiche n'est encore `validated`; validation de Sami requise.

## 🧪 Première boucle jouable

Point d'entrée : `cases/seed_cases.json` → `endo_case_001_lvsi_reasoning`.

La boucle cible :

1. identifier les informations décisionnelles manquantes ;
2. expliquer le mécanisme et le profil de rechute lié au LVSI substantiel ;
3. distinguer le risque vaginal du risque pelvien et distant ;
4. router l'erreur vers une capsule unique ;
5. administrer `q_endo_lvsi_retest_001` ;
6. n'accorder qu'une maîtrise provisoire avant réussite du re-test.

## 📚 Sources prioritaires

- ESGO-ESTRO-ESP 2025 : ancre européenne pour diagnostic, stratification et traitement.
- SFRO 2025 : ancre française de radiothérapie, texte intégral à intégrer avant validation des doses et techniques.
- FIGO 2023 : ancre pour le stade.
- ESMO 2022 et GINECO 2026 : oncologie médicale et maladie avancée/récidivante.
- PORTEC, GOG-249 et KEYNOTE-B21 : preuves structurantes, avec niveau et contexte explicités.

L'index traçable se trouve dans `sources/index.json`. Le rapport d'audit se trouve dans `review/MEDICAL_CONTENT_AUDIT_2026-07-31.md`.

## 🛡️ Limite d'utilisation

Tout contenu `draft` ou `needs_review` est éducatif et ne constitue pas une recommandation clinique validée. Le passage à `validated` requiert une source vérifiée, une revue médicale explicite et une trace de validation.
