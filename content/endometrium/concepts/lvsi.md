# LVSI dans le cancer de l'endomètre

Status: needs_review

## Fait

Le LVSI correspond à la présence **non équivoque** de cellules tumorales dans des espaces lymphatiques ou vasculaires en dehors du massif tumoral. Il doit être rapporté selon un système à trois niveaux : absent, focal ou substantiel. Les recommandations ESGO–ESTRO–ESP 2025 retiennent la définition OMS du LVSI substantiel, soit au moins cinq vaisseaux impliqués sur au moins une lame H&E, tout en reconnaissant que le seuil d'au moins quatre vaisseaux a été utilisé dans la littérature.[^1]

## Pourquoi c'est important

Le LVSI substantiel indique que la tumeur a franchi une étape biologique de dissémination. Il est associé à un risque accru d'atteinte ganglionnaire, de rechute pelvienne régionale et de métastases à distance. Dans l'analyse groupée de PORTEC-1 et PORTEC-2, le LVSI substantiel, contrairement au LVSI focal, était le facteur pronostique indépendant le plus fort pour la rechute pelvienne régionale et la dissémination à distance.[^2]

Le signal pronostique du LVSI focal est moins reproductible. Sa présence doit être rapportée, mais elle ne doit pas être transformée automatiquement en indication thérapeutique isolée.[^1]

## Conséquence clinique

Le LVSI substantiel modifie à la fois :

- le stade FIGO 2023 dans certaines tumeurs endométrioïdes de bas grade confinées à l'utérus, qui peuvent relever du stade IIB ;
- le groupe pronostique ESGO–ESTRO–ESP, en interaction avec l'invasion myométriale, l'atteinte cervicale, la classe moléculaire, le grade, l'histotype et le statut ganglionnaire ;
- le profil de rechute à prévenir, qui ne se limite plus au fond vaginal.

Le stade FIGO et le groupe de risque ne sont pas synonymes : le premier décrit l'extension et certains paramètres biologiques, tandis que le second estime le risque de récidive pour guider le traitement adjuvant.

## Conséquence en RCP

Devant un LVSI, la RCP doit vérifier :

- la qualification absente, focale ou substantielle et la méthode de lecture anatomopathologique ;
- la profondeur d'invasion myométriale ;
- le grade, l'histotype et l'atteinte cervicale ;
- la classification moléculaire complète et le statut des récepteurs aux œstrogènes lorsque nécessaire ;
- la stadification ganglionnaire et son résultat ;
- les marges, les autres extensions extra-utérines et les facteurs liés à la patiente ;
- le groupe de risque ESGO–ESTRO–ESP actuel avant de discuter surveillance, curiethérapie vaginale, radiothérapie externe pelvienne ou traitement systémique.

Dans le groupe à risque intermédiaire élevé défini par les recommandations européennes 2025, la radiothérapie externe pelvienne est recommandée pour optimiser le contrôle pelvien. La curiethérapie vaginale peut être une alternative dans certaines situations, notamment après stadification ganglionnaire pN0. Cette logique ne signifie pas que tout LVSI substantiel impose à lui seul une radiothérapie pelvienne.[^1]

## Piège fréquent

Réduire le LVSI à une variable binaire « présent/absent », ou utiliser le LVSI substantiel comme une prescription automatique. Son effet dépend du contexte histomoléculaire et anatomique complet.

## Micro-question

Pourquoi un LVSI substantiel peut-il rendre une curiethérapie vaginale seule insuffisante sur le plan conceptuel ?

Réponse attendue : parce qu'il signale un risque de dissémination lymphovasculaire et donc un risque pelvien régional, voire distant, que l'irradiation limitée au fond vaginal ne couvre pas. La décision finale dépend néanmoins du groupe de risque complet et du statut ganglionnaire.

## Prérequis

- `pelvic_lymphatic_drainage`
- `myometrial_invasion`
- `histologic_subtypes`
- `molecular_classification`
- `risk_groups`

## Sources

- `esgo_estro_esp_2025`
- `esgo_estro_esp_2025_appendix`
- `portec_lvsi_2015`
- `portec2_10y_2018`
- `portec4a_2026`

---

[^1]: Concin N, et al. (2025). "ESGO-ESTRO-ESP guidelines for the management of patients with endometrial carcinoma: update 2025" and supplementary appendix. _The Lancet Oncology_. https://pubmed.ncbi.nlm.nih.gov/40744042/

[^2]: Bosse T, et al. (2015). "Substantial lymph-vascular space invasion is a significant risk factor for recurrence in endometrial cancer: a pooled analysis of PORTEC 1 and 2 trials." _European Journal of Cancer_. https://pubmed.ncbi.nlm.nih.gov/26049688/
