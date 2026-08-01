# OncoRT Academy - Content Schema Draft

## Disease Site

```json
{
  "id": "endometrium",
  "title": "Cancer de l'endometre",
  "modules": ["foundations", "diagnosis_staging", "medical_oncology", "rcp", "radiotherapy", "complex_cases", "surveillance"]
}
```

## Foundation Capsule

```json
{
  "id": "endometrium_lvsi",
  "title": "LVSI dans le cancer de l'endometre",
  "diseaseSite": "endometrium",
  "tags": ["pathology", "prognosis", "lymphatic_spread"],
  "level": "foundation",
  "fact": "",
  "mechanism": "",
  "clinicalConsequence": "",
  "rcpConsequence": "",
  "commonTrap": "",
  "prerequisites": ["pelvic_lymphatic_drainage", "myometrial_invasion"],
  "checkQuestionIds": [],
  "sources": [],
  "status": "draft"
}
```

## Course Card

```json
{
  "id": "endometrium_adjuvant_risk_groups",
  "title": "Groupes de risque et traitement adjuvant dans le cancer de l'endometre",
  "diseaseSite": "endometrium",
  "clinicalSituation": "localized_postoperative",
  "learningObjectives": [],
  "sections": {
    "essentialKnowledge": "",
    "whyItMatters": "",
    "diagnosticChecklist": "",
    "stagingLogic": "",
    "medicalOncology": "",
    "radiotherapy": "",
    "surveillance": "",
    "traps": ""
  },
  "prerequisites": [],
  "questions": [],
  "cases": [],
  "sources": [],
  "status": "draft",
  "lastReviewed": null
}
```

## Clinical Case

```json
{
  "id": "endometrium_case_001",
  "title": "RCP postoperatoire - endometre",
  "diseaseSite": "endometrium",
  "difficulty": 1,
  "vignette": "",
  "availableData": {
    "clinical": "",
    "pathology": "",
    "imaging": "",
    "surgery": "",
    "biomarkers": ""
  },
  "tasks": [
    "identify_missing_data",
    "stage",
    "risk_stratify",
    "propose_treatment",
    "justify"
  ],
  "expectedReasoning": [],
  "acceptedAnswers": [],
  "commonErrors": [],
  "linkedConcepts": [],
  "sources": [],
  "status": "draft"
}
```

## Question

```json
{
  "id": "q_endometrium_lvsi_001",
  "type": "qroc",
  "diseaseSite": "endometrium",
  "linkedConcepts": ["endometrium_lvsi"],
  "prompt": "",
  "expectedAnswer": "",
  "gradingRubric": {
    "mustMention": [],
    "partialCredit": [],
    "criticalErrors": []
  },
  "explanation": "",
  "sources": [],
  "status": "draft"
}
```

## User Mastery Event

```json
{
  "userId": "sami",
  "timestamp": "",
  "objectType": "clinical_case",
  "objectId": "",
  "score": 0,
  "confidence": 0,
  "detectedGaps": [],
  "reasoningErrors": [],
  "nextRecommendedItems": []
}
```
