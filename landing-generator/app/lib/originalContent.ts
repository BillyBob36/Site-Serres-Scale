/**
 * Contenu d'origine du site serres, mappé sur les fieldId de blockSchema.ts.
 * Utilisé comme fallback quand un champ n'est pas coché (on garde l'original).
 */

export const originalContent: Record<string, string> = {
  // ── HEADER ──
  header_badge: "PRIME CEE AGRICOLE",
  header_item1_text: "Prime CEE",
  header_item1_bold: "Jusqu'à 100 % couverte",
  header_item2_text: "Économies chauffage",
  header_item2_bold: "25–40 %",
  header_nav_links: "Solutions CEE | Agriculture | Prime CEE | Éligibilité",
  header_cta: "Vérifier mon éligibilité en 2 min",

  // ── BLOC 1 — HERO ──
  hero_badge: "✅ Fiche CEE · AGRI-TH-117",
  hero_title_line1: "Réduisez de 25 à 40 %",
  hero_title_line2: "vos coûts de chauffage",
  hero_title_line3: "en serre",
  hero_subtitle: "Le déshumidificateur thermodynamique limite les pertes de chaleur, stabilise le climat de culture et réduit la charge de décision au quotidien.",
  hero_secondary_subtitle: "Chaque saison avec une hygrométrie mal maîtrisée augmente vos coûts de chauffage et vos risques de pertes culturales.",
  hero_pricebox_amount: "100%",
  hero_pricebox_text: "Jusqu'à 100 % du projet peut être couvert par la prime CEE, selon votre configuration.",
  hero_cta1: "Vérifier mon éligibilité en 2 min",
  hero_cta2: "Recevoir une estimation gratuite",
  hero_support_text: "Sans engagement · Réponse personnalisée sous 48h.",
  hero_image: "",
  hero_stats: JSON.stringify([
    { value: "100%", label: "FINANCEMENT JUSQU'À 100 %" },
    { value: "25-40%", label: "ÉCONOMIES CHAUFFAGE" },
    { value: "Stable", label: "CLIMAT PLUS STABLE" },
  ]),

  // ── BLOC 4 — DÉFI ──
  defi_badge: "Le défi de votre exploitation",
  defi_title: "Une hygrométrie mal maîtrisée | dégrade vos marges",
  defi_subtitle: "Humidité, pertes de chaleur et instabilité climatique pèsent directement sur votre rendement, vos arbitrages et vos charges.",
  defi_cards: JSON.stringify([
    { title: "Maladies cryptogamiques", text: "Au-delà de 85 % d'humidité, les conditions deviennent favorables au botrytis, au mildiou et à l'oïdium.", badge: "Jusqu'à 30 % de récolte perdue" },
    { title: "Pertes de chaleur", text: "Ventiler pour assécher la serre évacue aussi l'air chaud que vous avez déjà payé à produire.", badge: "40–60 % des pertes thermiques" },
    { title: "Rendement instable", text: "Un climat irrégulier ralentit la croissance, fragilise la qualité marchande et complique les réglages.", badge: "Qualité et rendement affectés" },
    { title: "Charges énergétiques", text: "Sans gestion active de l'humidité, gaz, fioul ou biomasse restent surconsommés toute la saison.", badge: "Charges opérationnelles en hausse" },
  ]),

  // ── BLOC 5 — SOLUTION ──
  solution_badge: "La solution",
  solution_title: "Déshumidifier | sans perdre | la chaleur",
  solution_paragraph: "Le déshumidificateur thermodynamique extrait l'humidité de l'air sans rejeter la chaleur à l'extérieur. Vous corrigez ainsi l'humidité sans sacrifier inutilement l'énergie déjà produite.",
  solution_checklist: "Hygrométrie plus stable et pilotable (55–75 % HR)\nRécupération des calories utiles issues de la condensation\nRéduction des besoins en chauffage de 25 à 40 %\nClimat de culture plus régulier et qualité mieux préservée\nIntégration simple avec les systèmes de chauffage existants",
  solution_steps: JSON.stringify([
    { title: "Extraction de l'humidité", text: "L'air humide est capté pour retirer la vapeur d'eau présente dans la serre." },
    { title: "Condensation et récupération d'énergie", text: "Les calories utiles sont récupérées au lieu d'être perdues avec la ventilation." },
    { title: "Réinjection d'air sec et chaud", text: "L'air plus sec et tempéré est redistribué pour stabiliser le climat de culture." },
  ]),
  solution_image: "",

  // ── BLOC 3 — CONFIANCE ──
  confiance_badge: "Ils nous font confiance",
  confiance_title: "+320 exploitations accompagnées en France — des résultats mesurés sur le terrain",
  confiance_subtitle: "Des résultats observés sur des serres chauffées comparables, avec un accompagnement pensé pour réduire l'incertitude technique et administrative.",
  confiance_partners: "COOPÉRATIVE LÉGUMES SUD\nSERRE NORMANDIE\nTOMATES DE FRANCE\nAGRI ÉNERGIE BRETAGNE\nPRIMEURS DU RHÔNE\nHORTICULTEURS DE L'OUEST",
  confiance_stats: JSON.stringify([
    { value: "+320", label: "projets agricoles accompagnés" },
    { value: "850 000", label: "de serres chauffées accompagnées" },
    { value: "-38%", label: "d'économie moyenne sur le chauffage" },
  ]),
  confiance_testimonial_text: "Sur 4 500 m² de serres chauffées, nous avons gagné en stabilité climatique et réduit nos consommations dès la première saison. Le projet a été simple à comprendre et fluide à mettre en place.",
  confiance_testimonial_author: "Gérard M., producteur de tomates, Pyrénées-Orientales · 4 500 m² équipés",

  // ── BLOC 2 — PARTENAIRE ──
  partenaire_title: "Un partenariat | qui sécurise | votre dossier CEE",
  partenaire_paragraph: 'Eco Environnement accompagne les dossiers CEE en lien direct avec <strong>Total Energies</strong>, pour réduire les allers-retours administratifs et sécuriser la valorisation de la prime.',
  partenaire_section2_title: "Un interlocuteur | unique pour l'étude, le dossier et l'installation",
  partenaire_section2_text: "Vous avancez avec un seul contact, un calendrier clair et plus de visibilité sur votre dossier du premier échange à la mise en service.",
  partenaire_features: "Expertise CEE agriculture depuis 2012.\nConformité PNCEE sécurisée sur chaque dossier.\nMoins d'allers-retours administratifs pour votre exploitation.\nPilotage complet avec un interlocuteur unique.",
  partenaire_image: "",

  // ── BLOC 9 — CEE ──
  cee_badge: "Dispositif CEE · Fiche AGRI-TH-117",
  cee_title: "Comment la prime CEE | finance votre installation",
  cee_subtitle: "Le montant de la prime dépend principalement de la surface équipée. Vous passez ainsi d'un sujet perçu comme complexe à un repère concret pour décider rapidement si une étude complète vaut la peine.",
  cee_formula_title: "Règle simple de calcul",
  cee_formula: "CEE = 710 × surface équipée",
  cee_example_rows: JSON.stringify([
    { label: "Surface équipée", value: "4 000 m²" },
    { label: "CEE générés (710 × 4 000)", value: "2 840 000 kWh cumac" },
    { label: "Prime CEE estimée", value: "22 700 – 28 400 €" },
    { label: "Coût installation estimé", value: "20 000 – 28 000 €" },
  ]),
  cee_reglementary: "Serres maraîchères chauffées exploitées par des professionnels.\nDemande CEE à initier avant tout démarrage de travaux.\nDurée conventionnelle : 17 ans.\nGain retenu : 710 kWh cumac/m².",

  // ── BLOC 10 — CONDITIONS ──
  conditions_badge: "Conditions requises",
  conditions_title: "Votre exploitation est-elle | éligible | à AGRI-TH-117 ?",
  conditions_subtitle: "Si vous cochez au moins 4 critères sur 6, une étude personnalisée est pertinente.",
  conditions_cards: JSON.stringify([
    { title: "Serre maraîchère chauffée", text: "Oui si votre serre dispose d'un chauffage actif ; non pour les tunnels froids ou non chauffés." },
    { title: "Demande avant travaux", text: "Oui si le dossier CEE est lancé avant le chantier ; nous sécurisons cette étape dès le premier échange." },
    { title: "Exploitant professionnel", text: "Oui si votre activité agricole dispose d'un SIREN actif ; coopératives et structures professionnelles éligibles." },
    { title: "Installation qualifiée", text: "Oui si le matériel est posé par un professionnel qualifié ; nous coordonnons la prestation." },
    { title: "Matériel conforme", text: "Oui si l'équipement respecte les exigences AGRI-TH-117 ; nous orientons vers les modèles adaptés." },
    { title: "Engagement préalable", text: "Oui si le devis est validé avant démarrage ; cette antériorité conditionne la prime." },
  ]),
  conditions_cta: "Vérifier l'éligibilité de ma serre",

  // ── BLOC 12 — MÉTHODE ──
  methode_badge: "Notre méthode",
  methode_title: "Un accompagnement | clé en main | — de l'étude au versement de la prime",
  methode_subtitle: "Un seul interlocuteur. Zéro charge administrative inutile pour vous.",
  methode_steps: JSON.stringify([
    { number: "1", title: "Étude gratuite", text: "Validation rapide de l'éligibilité et premier chiffrage." },
    { number: "2", title: "Dimensionnement", text: "Choix du matériel adapté à votre serre." },
    { number: "3", title: "Dossier CEE", text: "Montage du dossier et pièces sécurisées." },
    { number: "4", title: "Installation", text: "Pose planifiée selon votre calendrier cultural." },
    { number: "5", title: "Prime versée", text: "Contrôle final et déclenchement de la prime." },
  ]),
  methode_banner_heading: "Un seul interlocuteur du premier échange à la mise en service.",
  methode_banner_text: "Vous savez quoi faire, dans quel ordre, et avec qui.",

  // ── BLOC 13 — FAQ ──
  faq_badge: "Questions fréquentes",
  faq_title: "4 réponses avant de demander votre étude",
  faq_subtitle: "Les 4 points qui rassurent le plus avant de lancer votre dossier.",
  faq_items: JSON.stringify([
    { question: "La prime CEE couvre-t-elle vraiment le coût total de l'installation ?", answers: ["Dans de nombreux cas, la prime couvre une part très significative, voire la totalité, de l'installation.", "Le niveau exact dépend de la surface équipée, du matériel retenu et de la valeur de marché des CEE au moment du dossier."] },
    { question: "Combien de temps faut-il pour monter le dossier ?", answers: ["L'éligibilité peut être confirmée rapidement après étude, puis le calendrier dépend des pièces à réunir et du projet.", "Le point clé est d'initier le dossier avant tout démarrage de travaux pour préserver la prime."] },
    { question: "Quels documents faut-il prévoir ?", answers: ["Nous demandons uniquement les éléments utiles à votre configuration : exploitation, surface concernée, mode de chauffage et devis si disponible.", "Notre équipe vous indique précisément les pièces à fournir pour éviter les démarches inutiles."] },
    { question: "L'installation interrompt-elle la production ?", answers: ["L'installation est organisée pour limiter l'impact sur l'exploitation et s'adapter au calendrier cultural.", "Le dimensionnement, la pose et la mise en service sont planifiés avec vous en amont."] },
  ]),

  // ── BLOC 15 — CONTACT ──
  contact_title: "Recevez votre estimation personnalisée sous 48h",
  contact_subtitle: "4 informations suffisent · Sans engagement · Réponse personnalisée par un expert CEE agriculture.",
  contact_subtitle2: "Un premier retour vous permet de savoir rapidement si votre projet mérite une étude complète.",
  contact_submit: "Recevoir mon estimation gratuite",

  // ── BLOC 16 — FOOTER ──
  footer_description: "Spécialiste du financement CEE pour l'agriculture. Depuis 2012, Eco Environnement aide les exploitants à estimer rapidement leur potentiel de prime et à sécuriser leur dossier.",
  footer_copyright: "© Eco Environnement — Estimation de prime et étude d'éligibilité sur demande.",
  footer_legal: "AGRI-TH-117 · Estimation sur étude · Réponse sous 48h",
};
