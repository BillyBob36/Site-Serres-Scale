/**
 * Schéma de blocs pour la génération de landing pages.
 * Chaque bloc contient des champs, chacun avec un prompt éditable
 * pré-rempli par rétro-ingénierie du site serres existant.
 * 
 * Les prompts se "reposent" sur le .md d'entrée sans en dépendre :
 * ils décrivent COMMENT générer le contenu à partir du document source.
 */

export type FieldType = "text" | "textarea" | "image" | "list" | "cards";

// Mode par champ :
// - 'generated' : utilise la valeur générée par l'IA
// - 'manual' : saisie libre ou upload d'image par l'utilisateur
// - 'original' : garde le contenu original du site
export type FieldMode = 'generated' | 'manual' | 'original';

export interface BlockField {
  id: string;
  label: string;
  type: FieldType;
  prompt: string;
  value: string;
  mode?: FieldMode; // optionnel pour compatibilité, défaut géré dans page.tsx
  imagePrompt?: string; // prompt spécifique pour génération d'image
}

export interface Block {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  fields: BlockField[];
}

export interface LandingSchema {
  blocks: Block[];
}

export const defaultBlockSchema: Block[] = [
  // ═══════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════
  {
    id: "header",
    name: "Header — Bandeau haut + Navbar",
    description: "Barre de tête avec badge, arguments clés et navigation",
    enabled: true,
    fields: [
      {
        id: "header_badge",
        label: "Badge (étiquette haut de page)",
        type: "text",
        prompt: `Tu es un expert en copywriting de landing pages B2B à haute conversion. À partir du document .md fourni, génère un badge court (2-4 mots en MAJUSCULES) d'environ 18 caractères qui identifie immédiatement le dispositif ou le mécanisme de financement principal évoqué dans le document. Le badge doit créer un ancrage de crédibilité institutionnelle. Exemples de format : "PRIME CEE AGRICOLE", "AIDE MAPRIMERÉNOV", "SUBVENTION ADEME". Réponds uniquement avec le texte du badge, sans guillemets.`,
        value: "",
      },
      {
        id: "header_item1_text",
        label: "Argument clé 1 — libellé",
        type: "text",
        prompt: `À partir du document .md, identifie le principal mécanisme de financement ou d'aide mentionné et formule un libellé court (2-3 mots) d'environ 9 caractères qui le nomme clairement. Par exemple "Prime CEE" ou "Aide ADEME". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "header_item1_bold",
        label: "Argument clé 1 — chiffre fort",
        type: "text",
        prompt: `À partir du document .md, extrais le pourcentage ou montant maximal de prise en charge du financement principal et formule-le en accroche courte d'environ 23 caractères. Format attendu : "Jusqu'à X % couverte" ou "Jusqu'à X € pris en charge". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "header_item2_text",
        label: "Argument clé 2 — libellé",
        type: "text",
        prompt: `À partir du document .md, identifie le bénéfice opérationnel principal pour le client (économies, gain de performance, réduction de coûts…) et nomme-le en 2-3 mots d'environ 19 caractères. Par exemple "Économies chauffage" ou "Réduction facture". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "header_item2_bold",
        label: "Argument clé 2 — chiffre fort",
        type: "text",
        prompt: `À partir du document .md, extrais la fourchette d'économies ou de gains opérationnels chiffrés et formule-la de manière percutante d'environ 8 caractères. Format : "XX–YY %" ou "jusqu'à XX %". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "header_nav_links",
        label: "Liens de navigation (4 liens séparés par |)",
        type: "text",
        prompt: `À partir du document .md, propose 4 libellés de navigation courts (2-3 mots chacun) correspondant aux sections clés d'une landing page de ce type de service/produit. Le tout doit faire environ 53 caractères séparateurs inclus. Sépare-les par " | ". Exemple : "Solutions CEE | Agriculture | Prime CEE | Éligibilité". Réponds uniquement avec les 4 libellés séparés par |.`,
        value: "",
      },
      {
        id: "header_cta",
        label: "Bouton CTA navbar",
        type: "text",
        prompt: `Rédige un appel à l'action d'environ 33 caractères (6-8 mots max) pour le bouton principal de la barre de navigation. Il doit promettre une action rapide et sans engagement : vérification d'éligibilité, estimation gratuite, diagnostic express, etc. Le verbe doit être à l'infinitif ou à l'impératif. Réponds uniquement avec le texte du bouton.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 1 — HERO
  // ═══════════════════════════════════════════════
  {
    id: "bloc1",
    name: "Bloc 1 — Hero (accroche principale)",
    description: "Section héro avec titre fort, sous-titres, cartouche chiffre clé, CTA et image",
    enabled: true,
    fields: [
      {
        id: "hero_badge",
        label: "Badge hero (ex: Fiche CEE · AGRI-TH-117)",
        type: "text",
        prompt: `À partir du document .md, identifie la référence technique, réglementaire ou normative principale du dispositif (fiche CEE, norme, label…) et formule un badge court d'environ 23 caractères avec un ✅ devant. Format : "✅ [Référence]". Par exemple "✅ Fiche CEE · AGRI-TH-117". Réponds uniquement avec le texte du badge.`,
        value: "",
      },
      {
        id: "hero_title_line1",
        label: "Titre ligne 1",
        type: "text",
        prompt: `Tu es un copywriter expert en landing pages B2B. À partir du document .md, rédige la première ligne du titre hero d'environ 22 caractères. Elle doit exprimer le bénéfice principal chiffré que le client obtiendra. Utilise un verbe d'action à l'impératif ou au présent. Format court, percutant, environ 6-8 mots. Exemple de structure : "Réduisez de XX à YY % [bénéfice]". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "hero_title_line2",
        label: "Titre ligne 2 (italique)",
        type: "text",
        prompt: `Rédige la deuxième ligne du titre hero d'environ 22 caractères, en complément de la ligne 1. Elle doit préciser l'objet du bénéfice (coûts, facture, consommation…). Style : plus doux, explicatif, 3-5 mots. Cette ligne sera affichée en italique. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "hero_title_line3",
        label: "Titre ligne 3 (contexte)",
        type: "text",
        prompt: `Rédige la troisième ligne du titre hero d'environ 8 caractères : un complément de lieu ou de contexte en 2-4 mots qui ancre le bénéfice dans la réalité du client. Par exemple "en serre", "dans votre exploitation", "sur site industriel". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "hero_subtitle",
        label: "Sous-titre principal",
        type: "textarea",
        prompt: `Rédige un sous-titre d'environ 143 caractères (1-2 phrases, max 30 mots) qui explique concrètement comment la solution apporte le bénéfice promis dans le titre. Mentionne le mécanisme technique principal et son impact sur le quotidien du client. Ton factuel et rassurant, pas de superlatifs. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "hero_secondary_subtitle",
        label: "Sous-titre secondaire (douleur)",
        type: "textarea",
        prompt: `Rédige une phrase d'environ 117 caractères (max 20 mots) qui rappelle le coût de l'inaction : que se passe-t-il si le client ne fait rien ? Formulation factuelle, sans dramatisation excessive. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "hero_pricebox_amount",
        label: "Cartouche — chiffre clé",
        type: "text",
        prompt: `Extrais du document .md le chiffre le plus impactant sur le financement ou la prise en charge (pourcentage, montant). Formule-le de façon ultra-courte d'environ 5 caractères : "100%", "0€", "50 000€"… Réponds uniquement avec le chiffre/montant.`,
        value: "",
      },
      {
        id: "hero_pricebox_text",
        label: "Cartouche — explication",
        type: "textarea",
        prompt: `Rédige une phrase d'environ 87 caractères (max 20 mots) qui contextualise le chiffre de la cartouche. Elle doit rester prudente et factuelle ("peut être couvert", "selon votre configuration", "sous conditions"). Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "hero_cta1",
        label: "CTA principal",
        type: "text",
        prompt: `Rédige un bouton d'action principal d'environ 33 caractères (5-8 mots) orienté vers la vérification d'éligibilité ou le diagnostic. Verbe à l'infinitif. Doit donner l'impression d'un premier pas facile et rapide. Réponds uniquement avec le texte du bouton.`,
        value: "",
      },
      {
        id: "hero_cta2",
        label: "CTA secondaire",
        type: "text",
        prompt: `Rédige un bouton d'action secondaire d'environ 32 caractères (4-6 mots) orienté vers la réception d'une estimation ou d'un devis gratuit. Ton plus doux que le CTA principal. Réponds uniquement avec le texte du bouton.`,
        value: "",
      },
      {
        id: "hero_support_text",
        label: "Texte de réassurance sous CTA",
        type: "text",
        prompt: `Rédige une ligne de réassurance d'environ 49 caractères (max 10 mots) sous les boutons CTA. Doit lever les freins : sans engagement, gratuit, délai de réponse. Format : "Sans engagement · Réponse sous XXh". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "hero_image",
        label: "Image hero",
        type: "image",
        prompt: `Décris l'image idéale pour la section hero de cette landing page.`,
        imagePrompt: `Photographie professionnelle, éclairage naturel, grand angle. Montre l'équipement ou la solution technique décrite dans le document .md, installée dans son environnement réel d'utilisation (exploitation agricole, bâtiment industriel, etc.). L'image doit inspirer confiance et modernité. Style éditorial, pas de texte incrusté, pas de logo. Résolution haute, format paysage 16:10. Couleurs chaudes et lumineuses.`,
        value: "",
      },
      {
        id: "hero_stats",
        label: "3 statistiques clés (JSON array)",
        type: "cards",
        prompt: `À partir du document .md, extrais 3 statistiques ou chiffres clés qui crédibilisent l'offre. Formule chacun avec une valeur courte (environ 5 caractères) et un label court en MAJUSCULES (environ 20 caractères). Réponds en JSON array : [{"value": "...", "label": "..."}, ...].`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 4 — DÉFI
  // ═══════════════════════════════════════════════
  {
    id: "bloc4",
    name: "Bloc 4 — Défi (problème client)",
    description: "Expose les problèmes du client et pourquoi il doit agir",
    enabled: true,
    fields: [
      {
        id: "defi_badge",
        label: "Badge",
        type: "text",
        prompt: `Rédige un badge court (3-5 mots) d'environ 29 caractères qui introduit la section problème/défi. Ton empathique. Exemples : "Le défi de votre exploitation", "Le problème que vous connaissez". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "defi_title",
        label: "Titre (partie 1 + highlight)",
        type: "text",
        prompt: `Rédige un titre d'environ 50 caractères en deux parties pour la section problème. La première partie décrit la cause (6-8 mots) et la deuxième (highlight, 3-4 mots) décrit la conséquence business. Format : "[Cause] | [Conséquence]". Sépare par " | ". Exemple : "Une hygrométrie mal maîtrisée | dégrade vos marges". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "defi_subtitle",
        label: "Sous-titre",
        type: "textarea",
        prompt: `Rédige un sous-titre d'environ 124 caractères (une phrase, max 25 mots) qui résume les 2-3 conséquences principales du problème sur l'activité du client. Ton factuel. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "defi_cards",
        label: "4 cartes problème (JSON array)",
        type: "cards",
        prompt: `À partir du document .md, identifie les 4 principaux problèmes ou douleurs du client cible. Pour chacun, génère un objet JSON avec : "title" (2-3 mots, environ 20 caractères), "text" (1 phrase factuelle d'environ 95 caractères), "badge" (statistique ou conséquence chiffrée d'environ 30 caractères). Réponds en JSON array de 4 objets.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 5 — SOLUTION
  // ═══════════════════════════════════════════════
  {
    id: "bloc5",
    name: "Bloc 5 — Solution technique",
    description: "Présente la solution, son fonctionnement et ses avantages",
    enabled: true,
    fields: [
      {
        id: "solution_badge",
        label: "Badge",
        type: "text",
        prompt: `Rédige un badge court (2-3 mots) d'environ 11 caractères pour introduire la section solution. Exemples : "La solution", "Notre réponse", "L'innovation". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "solution_title",
        label: "Titre (3 lignes séparées par |)",
        type: "text",
        prompt: `Rédige un titre d'environ 40 caractères en 3 parties courtes séparées par " | ". Ligne 1 : verbe d'action décrivant ce que fait la solution (1-2 mots). Ligne 2 : en italique, le bénéfice clé (2-3 mots). Ligne 3 : complément contextuel (2-3 mots). Exemple : "Déshumidifier | sans perdre | la chaleur". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "solution_paragraph",
        label: "Paragraphe explicatif",
        type: "textarea",
        prompt: `Rédige un paragraphe d'environ 186 caractères (2 phrases, max 35 mots) expliquant le principe technique de la solution de manière accessible. Pas de jargon excessif, focus sur le "comment ça marche" et le bénéfice concret. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "solution_checklist",
        label: "5 avantages (un par ligne)",
        type: "list",
        prompt: `À partir du document .md, liste 5 avantages concrets et vérifiables de la solution. Chacun en une phrase courte d'environ 55 caractères. Un avantage par ligne. Mélange technique et bénéfice business. Réponds avec 5 lignes séparées par des retours à la ligne.`,
        value: "",
      },
      {
        id: "solution_steps",
        label: "3 étapes de fonctionnement (JSON array)",
        type: "cards",
        prompt: `Décris le fonctionnement de la solution en 3 étapes. Pour chaque étape, génère un objet JSON avec "title" (3-5 mots, environ 30 caractères) et "text" (1 phrase d'environ 78 caractères). Réponds en JSON array de 3 objets.`,
        value: "",
      },
      {
        id: "solution_image",
        label: "Image solution / schéma",
        type: "image",
        prompt: `Décris l'image pour illustrer la solution technique.`,
        imagePrompt: `Infographie technique épurée, style flat design professionnel. Illustre le principe de fonctionnement de la solution décrite dans le document. Schéma avec flèches montrant le flux d'énergie ou de matière. Palette de couleurs : vert (#2D9F46), jaune (#FFE500), blanc, noir. Pas de texte incrusté. Format carré 1:1.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 3 — CONFIANCE / PREUVES SOCIALES
  // ═══════════════════════════════════════════════
  {
    id: "bloc3",
    name: "Bloc 3 — Confiance & preuves sociales",
    description: "Chiffres clés, partenaires, témoignage client",
    enabled: true,
    fields: [
      {
        id: "confiance_badge",
        label: "Badge",
        type: "text",
        prompt: `Rédige un badge court (3-5 mots) d'environ 23 caractères pour la section preuve sociale. Exemples : "Ils nous font confiance", "Nos résultats terrain". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "confiance_title",
        label: "Titre",
        type: "text",
        prompt: `Rédige un titre d'environ 80 caractères qui combine un chiffre de crédibilité (nombre de projets, clients, surface…) extrait du .md et une promesse de résultats. Max 12 mots. Utilise le format : "+[Chiffre] [contexte] — [promesse]". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "confiance_subtitle",
        label: "Sous-titre",
        type: "textarea",
        prompt: `Rédige un sous-titre d'environ 145 caractères (une phrase, max 25 mots) qui contextualise les résultats mentionnés : sur quel type de client, avec quel accompagnement. Ton factuel et rassurant. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "confiance_partners",
        label: "6 noms de partenaires/clients (un par ligne)",
        type: "list",
        prompt: `Invente 6 noms crédibles de structures partenaires ou clients types pour le secteur décrit dans le .md. Noms en MAJUSCULES d'environ 22 caractères chacun, style coopérative ou entreprise sectorielle. Un par ligne. Réponds avec 6 noms.`,
        value: "",
      },
      {
        id: "confiance_stats",
        label: "3 statistiques clés (JSON array)",
        type: "cards",
        prompt: `À partir du document .md, extrais ou déduis 3 statistiques d'impact impressionnantes. Pour chacune : "value" (chiffre court d'environ 6 caractères), "label" (description d'environ 35 caractères). Réponds en JSON array.`,
        value: "",
      },
      {
        id: "confiance_testimonial_text",
        label: "Témoignage client",
        type: "textarea",
        prompt: `Rédige un témoignage client fictif mais crédible d'environ 191 caractères (2 phrases, max 40 mots) d'un professionnel du secteur décrit dans le .md. Il doit mentionner un résultat concret et la facilité du processus. Style oral, authentique. Réponds uniquement avec le texte du témoignage.`,
        value: "",
      },
      {
        id: "confiance_testimonial_author",
        label: "Auteur du témoignage",
        type: "text",
        prompt: `Invente un auteur crédible d'environ 72 caractères pour le témoignage : prénom + initiale, métier, localisation, surface ou taille de projet. Format : "Prénom I., [métier], [lieu] · [détail projet]". Réponds uniquement avec le texte.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 2 — PARTENAIRE
  // ═══════════════════════════════════════════════
  {
    id: "bloc2",
    name: "Bloc 2 — Partenaire stratégique",
    description: "Mise en avant du partenariat et de l'accompagnement unique",
    enabled: true,
    fields: [
      {
        id: "partenaire_title",
        label: "Titre (3 lignes séparées par |)",
        type: "text",
        prompt: `Rédige un titre d'environ 49 caractères en 3 parties séparées par " | " pour la section partenariat. Ligne 1 : contexte (2-3 mots). Ligne 2 highlight : bénéfice clé (2-3 mots). Ligne 3 : objet (3-4 mots). Exemple : "Un partenariat | qui sécurise | votre dossier CEE". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "partenaire_paragraph",
        label: "Paragraphe descriptif",
        type: "textarea",
        prompt: `Rédige un paragraphe d'environ 170 caractères (1-2 phrases, max 30 mots) qui explique le partenariat stratégique mentionné dans le .md et son bénéfice direct pour le client (simplification, sécurisation…). Utilise des balises <strong> pour les termes importants. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "partenaire_section2_title",
        label: "Titre section 2",
        type: "text",
        prompt: `Rédige un titre d'environ 68 caractères pour la deuxième section du bloc partenaire. Format : "[Highlight] | [suite]". Exemple : "Un interlocuteur | unique pour l'étude, le dossier et l'installation". Sépare par " | ". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "partenaire_section2_text",
        label: "Texte section 2",
        type: "textarea",
        prompt: `Rédige une phrase d'environ 135 caractères (max 25 mots) qui résume l'avantage de travailler avec un interlocuteur unique du début à la fin du projet. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "partenaire_features",
        label: "4 points forts (un par ligne)",
        type: "list",
        prompt: `Liste 4 points forts d'environ 48 caractères chacun qui crédibilisent le partenariat décrit dans le .md. Chacun doit être une phrase nominale ou courte commençant par un nom. Un par ligne. Réponds avec 4 lignes.`,
        value: "",
      },
      {
        id: "partenaire_image",
        label: "Image partenariat",
        type: "image",
        prompt: `Décris l'image pour le bloc partenaire.`,
        imagePrompt: `Photographie professionnelle montrant une poignée de main ou une réunion entre deux professionnels dans un cadre lié au secteur du document. Éclairage studio doux, arrière-plan flouté montrant l'environnement professionnel. Ton de confiance et de collaboration. Format paysage 16:9.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 9 — DISPOSITIF CEE / FINANCEMENT
  // ═══════════════════════════════════════════════
  {
    id: "bloc9",
    name: "Bloc 9 — Dispositif de financement",
    description: "Explication détaillée du mécanisme de financement avec calculs",
    enabled: true,
    fields: [
      {
        id: "cee_badge",
        label: "Badge",
        type: "text",
        prompt: `Rédige un badge (4-6 mots) d'environ 34 caractères identifiant le dispositif de financement principal du document .md, avec sa référence. Exemple : "Dispositif CEE · Fiche AGRI-TH-117". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "cee_title",
        label: "Titre",
        type: "text",
        prompt: `Rédige un titre d'environ 49 caractères pour la section financement. Format : "[Partie 1] | [highlight]". La partie 1 introduit le sujet, le highlight résume l'action. Exemple : "Comment la prime CEE | finance votre installation". Sépare par " | ". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "cee_subtitle",
        label: "Sous-titre",
        type: "textarea",
        prompt: `Rédige un sous-titre d'environ 198 caractères (1-2 phrases, max 35 mots) qui simplifie le concept de financement pour le client. Il doit transformer la complexité perçue en repère simple. Ton pédagogique. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "cee_formula_title",
        label: "Titre formule de calcul",
        type: "text",
        prompt: `Rédige un titre court (3-5 mots) d'environ 22 caractères pour la carte de formule de calcul. Exemple : "Règle simple de calcul". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "cee_formula",
        label: "Équation",
        type: "text",
        prompt: `À partir du document .md, extrais ou déduis la formule de calcul du financement et formule-la simplement d'environ 27 caractères. Format : "Variable = coefficient × paramètre". Exemple : "CEE = 710 × surface équipée". Réponds uniquement avec la formule.`,
        value: "",
      },
      {
        id: "cee_example_rows",
        label: "Lignes de l'exemple chiffré (JSON array)",
        type: "cards",
        prompt: `À partir du document .md, construis un exemple chiffré concret de calcul de financement. Génère un JSON array de 4-5 lignes avec "label" et "value". Inclus : la donnée d'entrée, le calcul, le résultat estimé, le coût estimé, et le reste à charge. Réponds en JSON array.`,
        value: "",
      },
      {
        id: "cee_reglementary",
        label: "Points réglementaires (un par ligne)",
        type: "list",
        prompt: `Liste 4 points réglementaires clés du dispositif de financement décrit dans le .md. Chacun en une phrase courte d'environ 45 caractères. Un par ligne. Réponds avec 4 lignes.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 10 — CONDITIONS D'ÉLIGIBILITÉ
  // ═══════════════════════════════════════════════
  {
    id: "bloc10",
    name: "Bloc 10 — Conditions d'éligibilité",
    description: "Checklist des conditions pour bénéficier du dispositif",
    enabled: true,
    fields: [
      {
        id: "conditions_badge",
        label: "Badge",
        type: "text",
        prompt: `Rédige un badge court (2-3 mots) d'environ 19 caractères pour la section conditions. Exemple : "Conditions requises". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "conditions_title",
        label: "Titre",
        type: "text",
        prompt: `Rédige un titre d'environ 56 caractères en 3 parties séparées par " | " pour la section éligibilité. Format : "[Question] | [highlight] | [contexte]". Exemple : "Votre exploitation est-elle | éligible | à AGRI-TH-117 ?". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "conditions_subtitle",
        label: "Sous-titre",
        type: "text",
        prompt: `Rédige un sous-titre d'environ 81 caractères (max 15 mots) qui invite le client à se positionner par rapport aux critères. Exemple : "Si vous cochez au moins 4 critères sur 6, une étude personnalisée est pertinente." Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "conditions_cards",
        label: "6 critères d'éligibilité (JSON array)",
        type: "cards",
        prompt: `À partir du document .md, identifie 6 conditions d'éligibilité au dispositif. Pour chacune, génère un objet JSON avec "title" (2-3 mots, environ 25 caractères) et "text" (1 phrase d'environ 94 caractères, format "Oui si… ; non si…" ou similaire). Réponds en JSON array de 6 objets.`,
        value: "",
      },
      {
        id: "conditions_cta",
        label: "CTA",
        type: "text",
        prompt: `Rédige un bouton CTA d'environ 34 caractères (5-7 mots) incitant à vérifier son éligibilité. Réponds uniquement avec le texte.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 12 — MÉTHODE / PROCESSUS
  // ═══════════════════════════════════════════════
  {
    id: "bloc12",
    name: "Bloc 12 — Méthode d'accompagnement",
    description: "Les 5 étapes du processus, de l'étude à la prime",
    enabled: true,
    fields: [
      {
        id: "methode_badge",
        label: "Badge",
        type: "text",
        prompt: `Rédige un badge court (2-3 mots) d'environ 13 caractères pour la section méthode. Exemples : "Notre méthode", "Le processus". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "methode_title",
        label: "Titre",
        type: "text",
        prompt: `Rédige un titre d'environ 71 caractères pour la section méthode. Format : "[Partie 1] | [highlight] | [Partie 2]". Exemple : "Un accompagnement | clé en main | — de l'étude au versement de la prime". Sépare par " | ". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "methode_subtitle",
        label: "Sous-titre",
        type: "text",
        prompt: `Rédige un sous-titre d'environ 68 caractères (max 12 mots) résumant la promesse de simplicité du processus. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "methode_steps",
        label: "5 étapes (JSON array)",
        type: "cards",
        prompt: `Décris un processus d'accompagnement en 5 étapes adapté au dispositif du document .md. Pour chaque étape : "number" (1-5), "title" (2-3 mots, environ 13 caractères), "text" (1 phrase d'environ 45 caractères). Réponds en JSON array de 5 objets.`,
        value: "",
      },
      {
        id: "methode_banner_heading",
        label: "Bannière — accroche",
        type: "text",
        prompt: `Rédige une phrase d'accroche d'environ 62 caractères (max 12 mots) pour la bannière de conclusion de la méthode. Elle doit résumer la promesse d'accompagnement. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "methode_banner_text",
        label: "Bannière — texte",
        type: "text",
        prompt: `Rédige une phrase d'environ 52 caractères (max 12 mots) qui complète l'accroche de la bannière. Elle doit rassurer sur la clarté du processus. Réponds uniquement avec le texte.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 13 — FAQ
  // ═══════════════════════════════════════════════
  {
    id: "bloc13",
    name: "Bloc 13 — FAQ",
    description: "Questions-réponses pour lever les derniers freins",
    enabled: true,
    fields: [
      {
        id: "faq_badge",
        label: "Badge",
        type: "text",
        prompt: `Rédige un badge (2-3 mots) d'environ 20 caractères pour la section FAQ. Exemples : "Questions fréquentes", "Vos questions". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "faq_title",
        label: "Titre",
        type: "text",
        prompt: `Rédige un titre d'environ 40 caractères (max 10 mots) pour la FAQ qui mentionne le nombre de questions et oriente vers l'action. Exemple : "4 réponses avant de demander votre étude". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "faq_subtitle",
        label: "Sous-titre",
        type: "text",
        prompt: `Rédige un sous-titre d'environ 65 caractères (max 12 mots) qui résume l'objectif de la FAQ : rassurer avant de passer à l'action. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "faq_items",
        label: "4 questions-réponses (JSON array)",
        type: "cards",
        prompt: `À partir du document .md et des préoccupations probables du client cible, rédige 4 paires question/réponse. Pour chacune : "question" (formulation client d'environ 60 caractères), "answers" (array de 2 phrases d'environ 100 caractères chacune, factuelles et rassurantes). Réponds en JSON array de 4 objets.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 15 — CONTACT / FORMULAIRE
  // ═══════════════════════════════════════════════
  {
    id: "bloc15",
    name: "Bloc 15 — Formulaire de contact",
    description: "Formulaire de conversion avec accroche et réassurance",
    enabled: true,
    fields: [
      {
        id: "contact_title",
        label: "Titre du formulaire",
        type: "text",
        prompt: `Rédige un titre d'environ 60 caractères orienté action pour le formulaire de contact (max 8 mots). Il doit promettre une estimation ou un retour personnalisé avec un délai. Exemple : "Recevez votre estimation personnalisée sous 48h". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "contact_subtitle",
        label: "Sous-titre réassurance",
        type: "text",
        prompt: `Rédige une ligne de réassurance d'environ 97 caractères (max 15 mots) pour le formulaire. Doit mentionner le peu d'informations nécessaires, l'absence d'engagement, et la personnalisation de la réponse. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "contact_subtitle2",
        label: "Sous-titre complémentaire",
        type: "text",
        prompt: `Rédige une deuxième ligne d'environ 93 caractères (max 18 mots) qui explique ce que le client va obtenir en remplissant le formulaire (savoir si son projet est éligible, etc.). Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "contact_submit",
        label: "Texte du bouton submit",
        type: "text",
        prompt: `Rédige le texte du bouton d'envoi du formulaire d'environ 32 caractères (4-6 mots). Orienté bénéfice, pas "Envoyer". Exemple : "Recevoir mon estimation gratuite". Réponds uniquement avec le texte.`,
        value: "",
      },
    ],
  },

  // ═══════════════════════════════════════════════
  // BLOC 16 — FOOTER
  // ═══════════════════════════════════════════════
  {
    id: "bloc16",
    name: "Bloc 16 — Footer",
    description: "Pied de page avec description, liens et mentions",
    enabled: true,
    fields: [
      {
        id: "footer_description",
        label: "Description entreprise",
        type: "textarea",
        prompt: `Rédige une description d'environ 176 caractères (max 25 mots) de l'entreprise pour le footer. Elle doit résumer le positionnement et l'historique succinctement. Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "footer_copyright",
        label: "Copyright",
        type: "text",
        prompt: `Rédige une ligne de copyright d'environ 77 caractères incluant le nom de l'entreprise du .md et une mention courte de l'activité principale. Format : "© [Entreprise] — [activité]". Réponds uniquement avec le texte.`,
        value: "",
      },
      {
        id: "footer_legal",
        label: "Mention légale courte",
        type: "text",
        prompt: `Rédige une ligne légale d'environ 53 caractères (max 10 mots) mentionnant la référence du dispositif et le type de service. Exemple : "AGRI-TH-117 · Estimation sur étude · Réponse sous 48h". Réponds uniquement avec le texte.`,
        value: "",
      },
    ],
  },
];
