// Each skill points at the project that proves it. `project` = id in projects.ts (clickable);
// no id = coursework that isn't showcased (proof text only). Evidence checked in the repos on 2026-11-23.
type L = { fr: string; en: string }
export type Skill = { name: L; proof: L; project?: string }
export type Domain = { id: string; title: L; skills: Skill[] }

const same = (s: string): L => ({ fr: s, en: s })

export const DOMAINS: Domain[] = [
  {
    id: 'front',
    title: same('Front-end'),
    skills: [
      { name: same('React + TypeScript'), proof: same('Noteo'), project: 'noteo' },
      { name: same('Tailwind CSS'), proof: same('SenTransport'), project: 'sentransport' },
      { name: same('Three.js / React Three Fiber'), proof: { fr: 'Mood Jardin — site vitrine 3D', en: 'Mood Jardin — 3D landing site' }, project: 'mood-jardin' },
      { name: same('GSAP · Framer Motion'), proof: { fr: 'Mon Comptable — site', en: 'Mon Comptable — website' }, project: 'mon-comptable' },
      { name: { fr: 'Vidéo en code (Remotion)', en: 'Video as code (Remotion)' }, proof: { fr: 'Mon Comptable — film promo 90 s', en: 'Mon Comptable — 90 s promo film' }, project: 'mon-comptable' },
    ],
  },
  {
    id: 'back',
    title: same('Back-end'),
    skills: [
      { name: same('Node.js / Express'), proof: same('AgencIA'), project: 'agencia' },
      { name: { fr: 'Supabase (auth + base)', en: 'Supabase (auth + database)' }, proof: same('AgencIA'), project: 'agencia' },
      { name: same('SQLite'), proof: same('Travel Point 2.0'), project: 'travel-point' },
      { name: { fr: 'Microservices FastAPI + Docker', en: 'FastAPI microservices + Docker' }, proof: same('SenTransport'), project: 'sentransport' },
      { name: { fr: 'API WhatsApp (Twilio)', en: 'WhatsApp API (Twilio)' }, proof: same('AgencIA'), project: 'agencia' },
      { name: same('Vercel · Railway'), proof: same('Noteo · AgencIA'), project: 'noteo' },
    ],
  },
  {
    id: 'desktop',
    title: { fr: 'Desktop & mobile', en: 'Desktop & mobile' },
    skills: [
      { name: same('Electron'), proof: same('Mon Comptable'), project: 'mon-comptable' },
      { name: { fr: 'Logiciel 100 % hors ligne', en: 'Fully offline software' }, proof: same('Mon Comptable'), project: 'mon-comptable' },
      { name: { fr: 'Android avec Capacitor', en: 'Android with Capacitor' }, proof: { fr: 'Mood Jardin — APK', en: 'Mood Jardin — APK' }, project: 'mood-jardin' },
      { name: { fr: 'Installateurs Windows', en: 'Windows installers' }, proof: { fr: 'Mood Jardin — Setup .exe', en: 'Mood Jardin — Setup .exe' }, project: 'mood-jardin' },
    ],
  },
  {
    id: 'data',
    title: { fr: 'Data & IA', en: 'Data & AI' },
    skills: [
      { name: { fr: 'Agents IA avec outils (Claude)', en: 'Tool-using AI agents (Claude)' }, proof: same('AgencIA'), project: 'agencia' },
      { name: same('Function calling (Gemini)'), proof: same('Travel Point 2.0'), project: 'travel-point' },
      { name: { fr: 'IA sur documents (PDF, DOCX → fiches, quiz)', en: 'AI on documents (PDF, DOCX → notes, quizzes)' }, proof: same('Noteo'), project: 'noteo' },
      { name: { fr: 'Prof IA conversationnelle', en: 'Conversational AI tutor' }, proof: { fr: 'Mon Comptable — Académie', en: 'Mon Comptable — Academy' }, project: 'mon-comptable' },
      { name: same('Python · Pandas · Plotly Dash'), proof: { fr: 'Dashboard Adult Income, 10 pages — projet DIT', en: 'Adult Income dashboard, 10 pages — DIT project' } },
      { name: { fr: 'Machine learning + Streamlit', en: 'Machine learning + Streamlit' }, proof: { fr: 'Modèles déployés — devoirs DIT', en: 'Deployed models — DIT coursework' } },
    ],
  },
  {
    id: 'tools',
    title: { fr: 'Outils IA', en: 'AI tools' },
    skills: [
      { name: same('Claude Code'), proof: same('Mon Comptable'), project: 'mon-comptable' },
      { name: same('Google AI Studio'), proof: same('Travel Point 2.0'), project: 'travel-point' },
      { name: same('Lovable'), proof: same("Rassoul's Archive"), project: 'archive' },
    ],
  },
]
