// ============================================================
// DARLINK — CONTEXTE DE LOCALISATION TRILINGUE (React Native)
// Arabe (RTL), Français (LTR), Anglais (LTR)
// Persistance AsyncStorage + détection automatique de la langue système.
// ============================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { translations, Language } from './translations';

const LANG_STORAGE_KEY = 'darlink_app_lang';

export interface LocalizationContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  formatPrice: (amount: number, isRental?: boolean) => string;
  translateAmenity: (amenity: string) => string;
  translatePropertyType: (type: string) => string;
  translateListingStatus: (status: string) => string;
}

const LocalizationContext = createContext<LocalizationContextValue>({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
  isRTL: false,
  formatPrice: (amt) => `${amt} DT`,
  translateAmenity: (a) => a,
  translatePropertyType: (t) => t,
  translateListingStatus: (s) => s,
});

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
        if (mounted && (saved === 'fr' || saved === 'ar' || saved === 'en')) {
          setLanguageState(saved);
          return;
        }
        const locales = Localization.getLocales();
        const deviceCode = locales?.[0]?.languageCode?.toLowerCase();
        if (mounted && (deviceCode === 'ar' || deviceCode === 'en' || deviceCode === 'fr')) {
          setLanguageState(deviceCode);
        }
      } catch {
        // Fallback silently to 'fr'
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_STORAGE_KEY, lang).catch(() => {});
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

  const formatPrice = (amount: number, isRental = false): string => {
    const formatted = Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const curr = t('currency');
    const suffix = isRental ? t('per_month') : '';
    return `${formatted} ${curr}${suffix}`;
  };

  const translateAmenity = (amenity: string): string => {
    const lower = amenity.toLowerCase().trim();
    if (lower.includes('wi-fi') || lower.includes('wifi')) return t('amenity_wifi');
    if (lower.includes('piscine') || lower.includes('pool')) return t('amenity_pool');
    if (lower.includes('park') || lower.includes('garage')) return t('amenity_parking');
    if (lower.includes('clim') || lower.includes('a/c')) return t('amenity_ac');
    if (lower.includes('jardin') || lower.includes('garden')) return t('amenity_garden');
    if (lower.includes('mer') || lower.includes('sea')) return t('amenity_sea_view');
    if (lower.includes('terrasse') || lower.includes('terrace')) return t('amenity_terrace');
    if (lower.includes('ascenseur') || lower.includes('elevator')) return t('amenity_elevator');
    if (lower.includes('sécurité') || lower.includes('secur') || lower.includes('alarm')) {
      return t('amenity_security');
    }
    if (lower.includes('chauff') || lower.includes('heat')) return t('amenity_heating');
    return amenity;
  };

  const translatePropertyType = (type: string): string => {
    switch (type.toLowerCase().trim()) {
      case 'tous':
      case 'all':
        return t('filter_all');
      case 'appartement':
      case 'apartment':
        return t('filter_apartment');
      case 'villa':
        return t('filter_villa');
      case 'maison':
      case 'house':
        return t('filter_house');
      case 'studio':
        return t('filter_studio');
      case 'terrain':
      case 'land':
        return t('filter_land');
      case 'commercial':
        return t('filter_commercial');
      default:
        return type;
    }
  };

  const translateListingStatus = (status: string): string => {
    switch (status.toUpperCase().trim()) {
      case 'DRAFT':
        return t('status_draft');
      case 'PENDING_REVIEW':
        return t('status_pending');
      case 'PUBLISHED':
        return t('status_published');
      case 'REJECTED':
        return t('status_rejected');
      case 'SOLD':
        return t('status_sold');
      case 'RENTED':
        return t('status_rented');
      case 'ARCHIVED':
        return t('status_archived');
      default:
        return status;
    }
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
        translatePropertyType,
        translateListingStatus,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = (): LocalizationContextValue => {
  return useContext(LocalizationContext);
};
