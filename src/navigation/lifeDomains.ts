/**
 * @module navigation/lifeDomains
 * @purpose Single source of truth for domain definitions.
 * Split into CORE_DOMAINS (Core/ליבה tab) and ARENA_DOMAINS (Arena/זירה tab).
 * Consciousness is a meta-pillar at the top of Core.
 */

import {
  Orbit,
  Eye,
  Dumbbell,
  Sun,
  Crosshair,
  Swords,
  Brain,
  TrendingUp,
  Crown,
  Users,
  Briefcase,
  FolderKanban,
  Gamepad2,
  Sparkles,
  Heart,
  type LucideIcon,
} from 'lucide-react';

export interface LifeDomain {
  id: string;
  labelEn: string;
  labelHe: string;
  labelEs: string;
  icon: LucideIcon;
  color: string;
  description: string;
  descriptionHe: string;
  descriptionEs: string;
}

/** All 14 pillars — unified under Core */
export const CORE_DOMAINS: LifeDomain[] = [
  { id: 'consciousness', labelEn: 'Consciousness', labelHe: 'תודעה', labelEs: 'Conciencia', icon: Orbit, color: 'violet', description: 'Identity map, traits, consciousness patterns, self-awareness', descriptionHe: 'מפת זהות, תכונות, דפוסי תודעה, מודעות עצמית', descriptionEs: 'Mapa de identidad, rasgos, patrones de conciencia, autoconocimiento' },
  { id: 'presence',  labelEn: 'Image',     labelHe: 'תדמית',    labelEs: 'Imagen',    icon: Eye,        color: 'fuchsia',  description: 'Face, body aesthetics, grooming, posture, style',                    descriptionHe: 'פנים, אסתטיקה גופנית, טיפוח, יציבה, סגנון',                descriptionEs: 'Rostro, estética corporal, aseo, postura, estilo' },
  { id: 'power',     labelEn: 'Power',     labelHe: 'עוצמה',    labelEs: 'Poder',     icon: Dumbbell,   color: 'red',      description: 'Strength, calisthenics, skill progressions',                        descriptionHe: 'כוח, קליסטניקס, התקדמות מיומנויות',                       descriptionEs: 'Fuerza, calistenia, progresión de habilidades' },
  { id: 'vitality',  labelEn: 'Vitality',  labelHe: 'חיוניות',  labelEs: 'Vitalidad', icon: Sun,        color: 'amber',    description: 'Sleep, nutrition, recovery, hormones',                              descriptionHe: 'שינה, תזונה, התאוששות, הורמונים',                         descriptionEs: 'Sueño, nutrición, recuperación, hormonas' },
  { id: 'focus',     labelEn: 'Focus',     labelHe: 'מיקוד',    labelEs: 'Enfoque',   icon: Crosshair,  color: 'cyan',     description: 'Dopamine control, deep work, meditation',                           descriptionHe: 'שליטה בדופמין, עבודה עמוקה, מדיטציה',                    descriptionEs: 'Control de dopamina, trabajo profundo, meditación' },
  { id: 'combat',    labelEn: 'Combat',    labelHe: 'לחימה',    labelEs: 'Combate',   icon: Swords,     color: 'slate',    description: 'Technical exposure, sparring, live pressure, reaction',              descriptionHe: 'חשיפה טכנית, ספארינג, לחץ חי, תגובה',                   descriptionEs: 'Exposición técnica, combate, presión en vivo, reacción' },
  { id: 'expansion', labelEn: 'Expansion', labelHe: 'התרחבות',  labelEs: 'Expansión', icon: Brain,      color: 'indigo',   description: 'Learning, creativity, languages, philosophy',                       descriptionHe: 'למידה, יצירתיות, שפות, פילוסופיה',                        descriptionEs: 'Aprendizaje, creatividad, idiomas, filosofía' },
  { id: 'wealth',        labelEn: 'Wealth',        labelHe: 'עושר',       labelEs: 'Riqueza',       icon: TrendingUp,   color: 'emerald', description: 'Income, business, career, monetization',    descriptionHe: 'הכנסה, עסקים, קריירה, מוניטיזציה',       descriptionEs: 'Ingresos, negocios, carrera, monetización' },
  { id: 'influence',     labelEn: 'Influence',     labelHe: 'השפעה',      labelEs: 'Influencia',    icon: Crown,        color: 'purple',  description: 'Communication, leadership, charisma',       descriptionHe: 'תקשורת, מנהיגות, כריזמה',              descriptionEs: 'Comunicación, liderazgo, carisma' },
  { id: 'relationships', labelEn: 'Relationships', labelHe: 'קשרים',     labelEs: 'Relaciones',    icon: Users,        color: 'sky',     description: 'Connections, partnerships, social capital',  descriptionHe: 'קשרים, שותפויות, הון חברתי',          descriptionEs: 'Conexiones, asociaciones, capital social' },
  { id: 'business',      labelEn: 'Business',      labelHe: 'עסקים',     labelEs: 'Negocios',      icon: Briefcase,    color: 'orange',  description: 'Build & manage businesses',                  descriptionHe: 'בנייה וניהול עסקים',                   descriptionEs: 'Construir y gestionar negocios' },
  { id: 'projects',      labelEn: 'Projects',      labelHe: 'פרויקטים',  labelEs: 'Proyectos',     icon: FolderKanban, color: 'blue',    description: 'Manage projects & goals',                    descriptionHe: 'ניהול פרויקטים ויעדים',               descriptionEs: 'Gestionar proyectos y metas' },
  { id: 'play',          labelEn: 'Play',          labelHe: 'משחק',      labelEs: 'Juego',         icon: Gamepad2,     color: 'lime',    description: 'Intentional regeneration & joyful movement', descriptionHe: 'התחדשות מכוונת ותנועה משמחת',         descriptionEs: 'Regeneración intencional y movimiento alegre' },
  { id: 'order',         labelEn: 'Order',         labelHe: 'סדר',       labelEs: 'Orden',         icon: Sparkles,     color: 'teal',    description: 'Clean spaces, organized systems, environmental mastery', descriptionHe: 'סביבה נקייה, מערכות מסודרות, שליטה בסביבה', descriptionEs: 'Espacios limpios, sistemas organizados, dominio ambiental' },
  { id: 'romantics',     labelEn: 'Romantics',     labelHe: 'רומנטיקה',  labelEs: 'Romance',       icon: Heart,        color: 'rose',    description: 'Intimate relationships, dating, seduction, polarity & romantic mastery', descriptionHe: 'מערכות יחסים אינטימיות, דייטינג, פיתוי, קוטביות ושליטה רומנטית', descriptionEs: 'Relaciones íntimas, citas, seducción, polaridad y dominio romántico' },
];

/** @deprecated Use CORE_DOMAINS — kept for backwards compatibility */
export const ARENA_DOMAINS: LifeDomain[] = CORE_DOMAINS.filter(d =>
  ['wealth', 'influence', 'relationships', 'business', 'projects', 'play', 'order', 'romantics'].includes(d.id)
);

/** Combined — same as CORE_DOMAINS now */
export const LIFE_DOMAINS: LifeDomain[] = CORE_DOMAINS;

/** Lookup a domain by id */
export function getDomainById(domainId: string): LifeDomain | undefined {
  return LIFE_DOMAINS.find(d => d.id === domainId);
}
