# Bloc 1 — sources textuelles des schémas

_OncoRT Academy · pilote Fondations prostate · version 0.2.0 · contenu `needs_review`_

---

## 📋 Règle éditoriale

Ces diagrammes constituent la source textuelle auditable des visuels relationnels du
bloc. L'interface les traduit en composants HTML/CSS accessibles et responsives ; elle
ne doit pas en modifier le raisonnement. Les représentations anatomiques sont
schématiques, non à l'échelle et impropres au contourage. L'anatomie zonale, le rôle du
récepteur aux androgènes, l'interprétation continue du PSA et le grading ISUP sont liés
aux sources affichées dans chaque leçon.[^1][^2][^3][^4]

## 📚 Anatomie relationnelle

```mermaid
flowchart TB
    accTitle: Relations anatomiques prostatiques
    accDescr: La prostate se situe sous la vessie, autour de l'urètre, en avant du rectum, sous les vésicules séminales et au-dessus du plancher pelvien.

    seminal_vesicles["Vésicules séminales"] --> prostate["Prostate"]
    bladder["Vessie et col"] --> prostate
    prostate --> pelvic_floor["Plancher pelvien"]
    urethra["Urètre prostatique"] --> prostate
    prostate --> rectum["Rectum en arrière"]

    classDef organ fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef focus fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    class prostate focus
    class seminal_vesicles,bladder,pelvic_floor,urethra,rectum organ
```

## 📚 Histologie conceptuelle

```mermaid
flowchart LR
    accTitle: Architecture bénigne et carcinome
    accDescr: Une glande bénigne organisée avec couche basale se distingue conceptuellement d'une prolifération glandulaire infiltrante dont l'architecture fonde le diagnostic d'adénocarcinome.

    benign["Glande bénigne organisée"] --> architecture{"Architecture infiltrante ?"}
    architecture -->|Non| preserve["Conserver le contexte bénin"]
    architecture -->|Oui| morphology["Analyser la morphologie"]
    morphology --> support["Immunohistochimie si besoin"]
    support --> diagnosis["Diagnostic anatomopathologique"]

    classDef normal fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef decision fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
    classDef action fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    class benign,preserve normal
    class architecture decision
    class morphology,support,diagnosis action
```

## 📚 Axe androgénique

```mermaid
flowchart LR
    accTitle: Voie androgénique prostatique
    accDescr: La GnRH stimule la LH puis la production testiculaire de testostérone, convertie en DHT dans la prostate, où le récepteur aux androgènes active un programme transcriptionnel.

    hypothalamus["Hypothalamus"] -->|GnRH| pituitary["Hypophyse"]
    pituitary -->|LH| testis["Testicule"]
    testis -->|Testostérone| conversion["5-alpha-réductase"]
    conversion -->|DHT| receptor["Récepteur AR"]
    receptor --> transcription["Transcription génique"]

    classDef signal fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef target fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#3b0764
    class hypothalamus,pituitary,testis,conversion signal
    class receptor,transcription target
```

## 📚 Interprétation du PSA

```mermaid
flowchart TB
    accTitle: Lecture raisonnée du PSA
    accDescr: Un résultat de PSA est vérifié dans son contexte, répété si le scénario le justifie, intégré à une estimation de risque puis suivi d'un examen seulement s'il réduit une incertitude clinique.

    result(["Résultat de PSA"]) --> context["Vérifier contexte et historique"]
    context --> repeat{"Répétition indiquée ?"}
    repeat -->|Oui| standardize["Répéter en conditions standardisées"]
    repeat -->|Non| risk["Estimer le risque"]
    standardize --> risk
    risk --> next{"Examen supplémentaire utile ?"}
    next -->|Oui| investigate["IRM, biomarqueur ou biopsie"]
    next -->|Non| monitor["Surveillance contextualisée"]

    classDef process fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef decision fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
    classDef outcome fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    class result,context,standardize,risk process
    class repeat,next decision
    class investigate,monitor outcome
```

## 📚 Dimensions tumorales

```mermaid
flowchart TB
    accTitle: Dimensions du cancer prostatique
    accDescr: Le volume, le grade, le stade et le profil moléculaire décrivent quatre dimensions complémentaires qui doivent rester séparées avant leur intégration clinique.

    cancer(["Cancer prostatique"]) --> volume["Volume : combien ?"]
    cancer --> grade["Grade : quelle architecture ?"]
    cancer --> stage["Stade : jusqu'où ?"]
    cancer --> molecular["Moléculaire : quelles voies ?"]
    volume --> synthesis["Synthèse multidimensionnelle"]
    grade --> synthesis
    stage --> synthesis
    molecular --> synthesis

    classDef center fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#3b0764
    classDef dimension fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef outcome fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    class cancer center
    class volume,grade,stage,molecular dimension
    class synthesis outcome
```

## 📚 Échelle Gleason–ISUP

```mermaid
flowchart TB
    accTitle: Correspondance Gleason et ISUP
    accDescr: L'échelle distingue ISUP 1 pour Gleason 3 plus 3, ISUP 2 pour 3 plus 4, ISUP 3 pour 4 plus 3, ISUP 4 pour le score 8 et ISUP 5 pour les scores 9 à 10.

    isup1["ISUP 1 · Gleason 3+3"] --> isup2["ISUP 2 · Gleason 3+4"]
    isup2 --> isup3["ISUP 3 · Gleason 4+3"]
    isup3 --> isup4["ISUP 4 · score 8"]
    isup4 --> isup5["ISUP 5 · scores 9–10"]

    classDef lower fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef middle fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
    classDef higher fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
    class isup1,isup2 lower
    class isup3 middle
    class isup4,isup5 higher
```

---

[^1]: Fine, S. W., & Reuter, V. E. (2012). "Anatomy of the prostate revisited: implications for prostate biopsy and zonal origins of prostate cancer." _Histopathology_. https://pubmed.ncbi.nlm.nih.gov/22212083/

[^2]: Vickman, R. E., et al. (2020). "The role of the androgen receptor in prostate development and benign prostatic hyperplasia: A review." _Asian Journal of Urology_. https://pmc.ncbi.nlm.nih.gov/articles/PMC7385520/

[^3]: European Association of Urology. (2026). "EAU Guidelines on Prostate Cancer." https://uroweb.org/guidelines/prostate-cancer

[^4]: van Leenders, G. J. L. H., et al. (2020). "The 2019 International Society of Urological Pathology Consensus Conference on Grading of Prostatic Carcinoma." _American Journal of Surgical Pathology_. https://pmc.ncbi.nlm.nih.gov/articles/PMC7382533/
