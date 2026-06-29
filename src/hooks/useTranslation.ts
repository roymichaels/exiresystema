import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/i18n';

export const useTranslation = () => {
  const { language, isRTL } = useLanguage();

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  const l = (labels: { labelHe: string; labelEn: string; labelEs?: string }): string => {
    if (language === 'he') return labels.labelHe;
    if (language === 'es') return labels.labelEs ?? labels.labelEn;
    return labels.labelEn;
  };

  return { t, l, language, isRTL };
};
