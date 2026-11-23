// Every sentence comes from the project's own README / package.json / app screens (see _inventaire/INVENTAIRE.md).
// To add a project (e.g. ORBIT, Sigrún, client sites once approved): add an entry + public/projects/<id>.webp and <id>-m.webp.
export type Project = {
  id: string
  name: string
  kind: { fr: string; en: string }
  problem: { fr: string; en: string }
  stack: string[]
  links: { label: string; url: string }[]
  accent: string
}

export const PROJECTS: Project[] = [
  {
    id: 'mon-comptable',
    name: 'Mon Comptable',
    kind: { fr: 'Logiciel desktop · PME', en: 'Desktop software · SMBs' },
    problem: {
      fr: 'Une comptabilité SYSCOHADA et une trésorerie pour les PME francophones, qui tournent hors ligne sur leur PC. Avec une académie en ligne où une prof IA enseigne la compta pas à pas.',
      en: 'SYSCOHADA accounting and cash management for French-speaking SMBs, running offline on their PC. Plus an online academy where an AI teacher explains accounting step by step.',
    },
    stack: ['Electron', 'React', 'TypeScript', 'Express', 'Tailwind', 'Three.js', 'Gemini'],
    links: [
      { label: 'mon-comptable-site.vercel.app', url: 'https://mon-comptable-site.vercel.app' },
      { label: 'Académie', url: 'https://mon-comptable-academie.vercel.app' },
    ],
    accent: '#8b5cf6',
  },
  {
    id: 'agencia',
    name: 'AgencIA',
    kind: { fr: 'Agent IA · e-commerce', en: 'AI agent · e-commerce' },
    problem: {
      fr: 'Un agent IA qui répond aux clients des petites boutiques sur WhatsApp, avec un cockpit pour suivre les coûts IA et déployer les agents.',
      en: 'An AI agent answering small shops’ customers on WhatsApp, with a cockpit to track AI costs and deploy agents.',
    },
    stack: ['Node/Express', 'React', 'TypeScript', 'Supabase', 'Claude', 'WhatsApp (Twilio)', 'Electron'],
    links: [],
    accent: '#3b82f6',
  },
  {
    id: 'noteo',
    name: 'Noteo',
    kind: { fr: 'App desktop · études', en: 'Desktop app · studying' },
    problem: {
      fr: 'Importer ses cours (PDF, DOCX, PPTX), en discuter avec une IA, générer fiches et quiz, puis réviser avec des flashcards.',
      en: 'Import your courses (PDF, DOCX, PPTX), chat with an AI about them, generate summaries and quizzes, then revise with flashcards.',
    },
    stack: ['Electron', 'React', 'TypeScript', 'Tailwind', 'IA'],
    links: [{ label: 'noteo-site.vercel.app', url: 'https://noteo-site.vercel.app' }],
    accent: '#e5e5e5',
  },
  {
    id: 'travel-point',
    name: 'Travel Point 2.0',
    kind: { fr: 'Logiciel desktop · agences de voyage', en: 'Desktop software · travel agencies' },
    problem: {
      fr: 'Gérer une agence de voyage (vols, hôtels, clients, devis et factures) avec un assistant IA qui comprend les demandes en langage naturel.',
      en: 'Run a travel agency (flights, hotels, clients, quotes and invoices) with an AI assistant that understands plain-language requests.',
    },
    stack: ['Electron', 'React', 'TypeScript', 'SQLite', 'Gemini (function calling)', 'Tailwind'],
    links: [],
    accent: '#22c55e',
  },
  {
    id: 'mood-jardin',
    name: 'Mood Jardin',
    kind: { fr: 'App Windows + Android', en: 'Windows + Android app' },
    problem: {
      fr: 'Suivre son cycle, ses émotions et son quotidien dans un espace privé : les données restent sur l’appareil, sans compte.',
      en: 'Track your cycle, moods and daily life in a private space: data stays on the device, no account needed.',
    },
    stack: ['Electron', 'Capacitor', 'React', 'TypeScript', 'React Three Fiber'],
    links: [{ label: 'mood-jardin.vercel.app', url: 'https://mood-jardin.vercel.app' }],
    accent: '#ec4899',
  },
  {
    id: 'machallah',
    name: 'Machallah Pèlerinage',
    kind: { fr: 'Site client · Hajj & Oumra', en: 'Client site · Hajj & Umrah' },
    problem: {
      fr: 'Un site Hajj / Oumra immersif : on entre à La Mecque à travers le brouillard, on choisit sa formule et un assistant répond aux questions.',
      en: 'An immersive Hajj / Umrah site: you enter Mecca through the fog, pick your package, and an assistant answers questions.',
    },
    stack: ['React', 'Vite', 'TypeScript'],
    links: [{ label: 'machallah-pelerinage.vercel.app', url: 'https://machallah-pelerinage.vercel.app' }],
    accent: '#eab308',
  },
  {
    id: 'sentransport',
    name: 'SenTransport',
    kind: { fr: 'Plateforme web · logistique', en: 'Web platform · logistics' },
    problem: {
      fr: 'Un tableau de bord de suivi de colis et de livraisons pour le réseau SenTransport, avec rôles et mode démonstration.',
      en: 'A parcel and delivery tracking dashboard for the SenTransport network, with roles and a demo mode.',
    },
    stack: ['React', 'TypeScript', 'Tailwind', 'FastAPI', 'Docker'],
    links: [],
    accent: '#6366f1',
  },
  {
    id: 'archive',
    name: "Rassoul's Archive",
    kind: { fr: 'App desktop · perso', en: 'Desktop app · personal' },
    problem: {
      fr: 'Un gestionnaire de sauvegardes Pokémon pour les visualiser, toutes générations confondues.',
      en: 'A Pokémon save manager to browse saves from every generation.',
    },
    stack: ['Electron', 'React', 'TypeScript', 'Express'],
    links: [],
    accent: '#a855f7',
  },
]
