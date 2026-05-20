/**
 * Full-spectrum holographic variant of the canonical AION orb.
 * Used in the floating widget, chat header, and assistant message avatars.
 */
import { CANONICAL_AION_PROFILE } from '@/components/orb/CanonicalAionModel';

export const HOLO_AION_PROFILE = {
  ...CANONICAL_AION_PROFILE,
  materialType: 'holographic' as const,
  gradientStops: [
    '340 90% 65%',
    '265 85% 66%',
    '220 95% 65%',
    '188 95% 65%',
    '155 80% 60%',
    '60 90% 65%',
    '20 95% 65%',
  ],
  secondaryColors: ['188 95% 65%', '60 90% 65%', '340 90% 65%'],
  particlePalette: ['188 95% 65%', '265 85% 66%', '340 90% 65%', '60 90% 65%'],
  chromaShift: 0.95,
  bloomStrength: 1.1,
  patternIntensity: 0.75,
  materialParams: {
    ...CANONICAL_AION_PROFILE.materialParams,
    clearcoat: 1.0,
    roughness: 0.12,
    emissiveIntensity: 0.7,
  },
};
