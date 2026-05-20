import type { TranslationKeys } from './he';
import { en } from './en';

/**
 * Spanish translations.
 * Currently localizes the public-facing landing page and language toggle.
 * All other keys fall back to English to ensure type safety and full coverage.
 */
export const es: TranslationKeys = {
  ...en,
  landing: {
    ...en.landing,
    header: { brand: 'EXIRE SYSTEMA' },
    widget: {
      chatLabel: 'habla con aion',
      brand: 'AION',
      invite: 'Comienza el diálogo',
      aria: 'Abrir chat de AION',
    },
    langToggle: { aria: 'Cambiar idioma', he: 'HE', en: 'EN', es: 'ES' } as typeof en.landing.langToggle & { es: string },
    hero: {
      eyebrow: 'Capítulo Uno',
      titleLine1: 'Tu consciencia',
      titleHighlight: 'no fue construida',
      titleSuffix: ' por ti',
      bodyLine1: 'La mayoría vive a través de una identidad, miedos y creencias',
      bodyLine2: 'instalados en ellos desde la edad cero.',
      bodyHighlight: 'Pocos aprenden a reescribirse a sí mismos.',
      cta: 'Comienza la reescritura',
    },
    system: {
      eyebrow: 'El Sistema',
      line1: 'Te enseñaron qué pensar.',
      line2: 'Qué temer.',
      line3: 'Qué desear.',
      line4: 'Quién ser.',
      then: 'Y luego lo llamaron:',
      life: '"Vida."',
    },
    whatIDo: {
      eyebrow: 'Lo Que Hago',
      titlePre: 'Trabajo con',
      titleHighlight: 'el subconsciente',
      titleSuffix: 'como un programador trabaja con código.',
      b1: 'Mapeando patrones.',
      b2: 'Desmantelando identidades antiguas.',
      b3: 'Reescribiendo la programación interna.',
      b4: 'Y construyendo soberanía personal real.',
    },
    method: {
      eyebrow: 'El Método',
      title: 'Exire Systema',
      stepsLabel: 'C I N C O   E T A P A S',
      s1t: 'Identificar la Programación',
      s1d: 'Mapear las capas formadas en ti desde el exterior.',
      s2t: 'Disolver la Vieja Identidad',
      s2d: 'Separar quién eres de lo que fue instalado en ti.',
      s3t: 'Trabajo Subconsciente Profundo',
      s3d: 'Acceder a las capas donde el código fue escrito por primera vez.',
      s4t: 'Reconstrucción',
      s4d: 'Crear una nueva identidad, desde la elección consciente.',
      s5t: 'Soberanía Interior',
      s5d: 'Vivir desde quien eres — no desde lo que te enseñaron a ser.',
    },
    content: {
      eyebrow: 'El Contenido',
      title: 'Campos de Indagación',
      consciousness: 'Consciencia',
      identity: 'Identidad',
      hypnosis: 'Hipnosis',
      shadow: 'Trabajo de Sombra',
      control: 'Sistemas de Control',
      sovereignty: 'Soberanía Interior',
    },
    finalCta: {
      line1a: 'O sigues viviendo',
      line1b: 'como quien te programaron para ser.',
      line2a: 'O empiezas a construirte',
      line2b: 'de nuevo.',
      button: 'Entra',
    },
    footer: {
      tagline: 'Un proceso personal para reconstruir la consciencia · Todos los derechos reservados',
    },
  },
};
