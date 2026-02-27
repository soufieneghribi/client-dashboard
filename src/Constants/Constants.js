// Constants.js
export const FORM_CONFIG = {
  STEPS: {
    BASIC_INFO: 1,
    ADDITIONAL_INFO: 2,
    CONFIRMATION: 3,
    TOTAL: 3
  },
  
  VALIDATION: {
    MIN_PHONE_DIGITS: 8,
    MIN_PASSWORD_LENGTH: 8,
    EMAIL_PATTERN: /.+@.+\..+/,
    PHONE_DIGITS_PATTERN: /\D/g
  },

  PASSWORD_STRENGTH: {
    LABELS: ["Très faible", "Faible", "Moyen", "Bon", "Fort"],
    WIDTHS: ["w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"],
    COLORS: ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-500", "bg-green-500"]
  }
};

export const FORM_OPTIONS = {
  GOVERNORATES: [
    { value: "ariana", label: "Ariana" },
    { value: "beja", label: "Béja" },
    { value: "ben arous", label: "Ben Arous" },
    { value: "bizerte", label: "Bizerte" },
    { value: "gabes", label: "Gabès" },
    { value: "gafsa", label: "Gafsa" },
    { value: "jendouba", label: "Jendouba" },
    { value: "kairouan", label: "Kairouan" },
    { value: "kasserine", label: "Kasserine" },
    { value: "kebili", label: "Kébili" },
    { value: "le kef", label: "Le Kef" },
    { value: "mahdia", label: "Mahdia" },
    { value: "la mannouba", label: "La Mannouba" },
    { value: "medenine", label: "Médenine" },
    { value: "monastir", label: "Monastir" },
    { value: "nabeul", label: "Nabeul" },
    { value: "sfax", label: "Sfax" },
    { value: "sidi bouzid", label: "Sidi Bouzid" },
    { value: "siliana", label: "Siliana" },
    { value: "sousse", label: "Sousse" },
    { value: "tataouine", label: "Tataouine" },
    { value: "tozeur", label: "Tozeur" },
    { value: "tunis", label: "Tunis" },
    { value: "zaghouan", label: "Zaghouan" }
  ],

  PROFESSIONS: [
    { value: "Agriculture / Arisans", label: "Agriculture / Artisans" },
    { value: "Commerçant", label: "Commerçant" },
    { value: "Chef d'entreprise", label: "Chef d'entreprise" },
    { value: "Profession libérale", label: "Profession libérale" },
    { value: "Cadre supérieur", label: "Cadre supérieur" },
    { value: "Cadre moyen", label: "Cadre moyen" },
    { value: "Enseignant, Professeur, Professions scientifique", label: "Enseignant, Professeur, Professions scientifiques" },
    { value: "Ingénieurs / Cadre technique d'entreprise", label: "Ingénieurs / Cadre technique d'entreprise" },
    { value: "Technicien / Agent de maîtrise", label: "Technicien / Agent de maîtrise" },
    { value: "Policier / Militaire", label: "Policier / Militaire" },
    { value: "Fonction publique", label: "Fonction publique" },
    { value: "Employés administratifs d'entreprise", label: "Employés administratifs d'entreprise" },
    { value: "Ouvriers / Chauffeur", label: "Ouvriers / Chauffeur" },
    { value: "Femme au foyer", label: "Femme au foyer" },
    { value: "Elèves, Etudiants", label: "Élèves, Étudiants" },
    { value: "Sans emploi", label: "Sans emploi" },
    { value: "Autres", label: "Autres" }
  ],

  FAMILY_STATUS: [
    { value: "Célébataire", label: "Célibataire" },
    { value: "Marié", label: "Marié(e)" },
    { value: "Divorce", label: "Divorcé(e)" }
  ],

  PHONE_CODES: [
    { value: "+216", label: "+216 (Tunisie)" },
    { value: "+33", label: "+33 (France)" },
    { value: "+1", label: "+1 (USA/Canada)" },
    { value: "+44", label: "+44 (UK)" },
    { value: "+49", label: "+49 (Allemagne)" },
    { value: "+39", label: "+39 (Italie)" },
    { value: "+34", label: "+34 (Espagne)" },
    { value: "+213", label: "+213 (Algérie)" },
    { value: "+212", label: "+212 (Maroc)" }
  ],

  CIVILITY: [
    { value: "Mr", label: "Monsieur" },
    { value: "Md", label: "Madame" },
    { value: "Mlle", label: "Mademoiselle" }
  ],

  CHILDREN_COUNT: [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" }
  ]
};

export const INITIAL_STATE = {
  USER: {
    nom_et_prenom: '',
    tel: '',
    email: '',
    password: '',
    civilite: '',
    dateN: '',
    adresse: '',
    profession: '',
    situation_familiale: '',
    enfants: '',
    nom_enfant_1: '',
    nom_enfant_2: '',
    nom_enfant_3: '',
    nom_enfant_4: '',
  },
  
  GEO_STATUS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    PROMPT: 'prompt',
    ERROR: 'error'
  }
};

// Nouvelles constantes pour les conditions générales
export const TERMS_CONDITIONS = {
TITLE: "Conditions Générales",
CONTENT: [
  {
    title: "1. Collecte des données",
    text: "Nous collectons certaines informations personnelles afin de vous fournir un service personnalisé. Ces données ne seront jamais vendues à des tiers sans votre consentement."
  },
  {
    title: "2. Utilisation des services",
    text: "Vous vous engagez à utiliser notre service de manière responsable et à ne pas violer la législation en vigueur. Toute tentative de fraude entraînera une suspension immédiate de votre compte."
  },
  {
    title: "3. Propriété intellectuelle",
    text: "Tout le contenu disponible sur notre plateforme, y compris les textes, images et logos, est protégé par les lois sur la propriété intellectuelle et reste la propriété exclusive de l'entreprise."
  },
  {
    title: "4. Résiliation",
    text: "Nous nous réservons le droit de résilier ou de suspendre l'accès à nos services en cas de non-respect de ces conditions générales."
  }
],
INTRODUCTION: "Bienvenue sur notre plateforme. En utilisant nos services, vous acceptez les conditions décrites ci-dessous. Veuillez lire attentivement ce document avant de continuer.",
CLOSE_BUTTON_TEXT: "Fermer"
};
