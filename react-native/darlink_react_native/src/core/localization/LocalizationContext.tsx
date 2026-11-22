// ============================================================
// DARLINK — CONTEXTE DE LOCALISATION TRILINGUE (React Native)
// Arabe (RTL), Français (LTR), Anglais (LTR)
// ============================================================

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language } from './translations';

export interface LocalizationContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  formatPrice: (amount: number) => string;
  translateAmenity: (amenity: string) => string;
}

const LocalizationContext = createContext<LocalizationContextValue>({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
  isRTL: false,
  formatPrice: (amt) => `${amt} DT`,
  translateAmenity: (a) => a,
});

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const isRTL = language === 'ar';

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.fr;
    let text = dict[key] || translations.fr[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return text;
  };

  const formatPrice = (amount: number): string => {
    const formatted = Math.round(amount).toLocaleString(language === 'ar' ? 'ar-TN' : 'fr-TN');
    const curr = t('currency');
    return isRTL ? `${formatted} ${curr}` : `${formatted} ${curr}`;
  };

  const translateAmenity = (amenity: string): string => {
    const keyMap: Record<string, string> = {
      'Wi-Fi haut débit': 'amenity_wifi',
      'Piscine privée': 'amenity_pool',
      'Parking sécurisé': 'amenity_parking',
      'Climatisation centrale': 'amenity_ac',
      'Jardin paysager': 'amenity_garden',
      'Vue panoramique sur mer': 'amenity_sea_view',
      'Terrasse ensoleillée': 'amenity_terrace',
      'Ascenseur': 'amenity_elevator',
      'Sécurité & Alarme 24/7': 'amenity_security',
      'Chauffage central': 'amenity_heating',
    };
    const key = keyMap[amenity];
    return key ? t(key) : amenity;
  };

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        formatPrice,
        translateAmenity,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = (): LocalizationContextValue => {
  return useContext(LocalizationContext);
};
