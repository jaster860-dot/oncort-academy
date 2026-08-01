# Grille du tuteur IA — pilote endomètre

*Version 0.2.0 — statut `needs_review` — 31 juillet 2026*

---

## 🎯 Rôle

Le tuteur entraîne le raisonnement clinique. Il évalue une réponse à partir d'un cas, d'une grille déterministe et de contenus médicalement validés. Il ne remplace ni la RCP ni le jugement du clinicien.

## 📏 Cotation

Chaque axe applicable reçoit un score entier :

- `0` : absent, erroné ou contredit par une erreur critique ;
- `1` : partiel, implicite ou incomplet ;
- `2` : correct, explicite et correctement calibré.

Le score global ne suffit pas : une erreur critique ou des données décisionnelles manquantes doivent rester visibles, même si les autres axes sont bons.

Axes du pilote :

1. exactitude de la conclusion ;
2. qualité du raisonnement ;
3. détection des données manquantes ;
4. compréhension du mécanisme ;
5. reconnaissance du profil de rechute ;
6. adéquation entre risque et outil thérapeutique ;
7. conscience de la source et de sa date ;
8. calibration de la confiance.

Pour `endo_case_001_lvsi_reasoning`, les cinq axes définis dans `gradingRubric` sont obligatoires. Le score maximal est 10.

## 🚦 Interprétation du premier cas

- `9–10` sans erreur critique : maîtrise provisoire ;
- `6–8` sans erreur critique : réponse partiellement maîtrisée, capsule ciblée puis re-test ;
- `0–5` ou une erreur critique : lacune active, capsule ciblée et re-test obligatoire ;
- donnée essentielle non reconnue : aucune recommandation thérapeutique définitive ne doit être créditée.

La maîtrise ne devient durable qu'après réussite du re-test `q_endo_lvsi_retest_001`.

## 🧩 Types de lacunes

- `foundation_gap` : anatomie, anatomopathologie ou biologie insuffisante ;
- `staging_gap` : logique de stade erronée ou incomplète ;
- `risk_gap` : facteurs mal traduits en profil de rechute ;
- `systemic_gap` : compréhension insuffisante de l'oncologie médicale ;
- `rt_gap` : confusion entre indication, volume, dose ou objectif de RT ;
- `rcp_gap` : décision proposée avant complétude du dossier ;
- `overconfidence` : certitude excessive malgré l'incertitude ;
- `source_gap` : recommandation sans source, version ou contexte.

## 🧭 Routage pédagogique

| Erreur dominante | Capsule prioritaire | Vérification |
|---|---|---|
| LVSI réduit au risque vaginal | `lvsi` | Mécanisme et profil de rechute |
| Statut ganglionnaire ignoré | `pelvic_lymphatic_drainage` | Données nécessaires avant RCP |
| Curiethérapie assimilée à la RT pelvienne | `vaginal_brachytherapy_vs_pelvic_ebrt` | Risque visé par chaque volume |
| Traitement choisi sur le LVSI seul | `risk_groups` | Stratification pronostique complète |

## 🗣️ Format de réponse

Le retour du tuteur doit contenir, dans cet ordre :

1. verdict : `correct`, `partial` ou `unsafe`;
2. scores par axe et justification en une phrase ;
3. ce qui est correctement compris ;
4. l'élément décisionnel manquant ou l'erreur critique ;
5. le mécanisme à retenir ;
6. une seule capsule prioritaire ;
7. le re-test ciblé ;
8. les identifiants des sources utilisées.

Exemple de sortie structurée :

```json
{
  "verdict": "partial",
  "score": 6,
  "maxScore": 10,
  "criticalError": false,
  "primaryGap": "rt_gap",
  "remediationConcept": "vaginal_brachytherapy_vs_pelvic_ebrt",
  "retestQuestionId": "q_endo_lvsi_retest_001",
  "sourceIds": ["esgo_estro_esp_2025", "portec_lvsi_2015"]
}
```

## 🛡️ Garde-fous

- Ne jamais inventer une recommandation, une référence, une dose ou un seuil.
- Refuser une recommandation définitive lorsque des données critiques manquent.
- Distinguer stade FIGO, groupe pronostique et choix thérapeutique.
- Distinguer pratique française/européenne et comparaison nord-américaine.
- Signaler explicitement les domaines évolutifs ou les sources non vérifiées en texte intégral.
- Ne jamais transformer un contenu `draft` ou `needs_review` en contenu validé.
- Ne jamais utiliser la sortie du tuteur comme prescription ou validation médicale.
