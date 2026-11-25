// ============================================================
// DARLINK — ÉCRAN D'ACCUEIL MODERNE & LUXE (React Native)
// Icônes vectorielles Lucide, adaptatif Clair / Sombre & RTL
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  User,
  Moon,
  Sun,
  Languages,
  Plus,
  Settings,
  Search,
  X,
  Map as MapIcon,
  Building,
} from 'lucide-react-native';
import { AppShadows } from '../../../../core/constants/spacing';
import { mockProperties } from '../../data/mockProperties';
import { Property } from '../../domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { EmptyStateView } from '../../../../core/components/EmptyStateView';
import { useBottomNavClearance } from '../../../../core/components/FloatingBottomNav';
import { PropertyDetailsScreen } from './PropertyDetailsScreen';
import { AddPropertyScreen } from './AddPropertyScreen';
import { MapScreen } from '../../../map/presentation/screens/MapScreen';
import { propertyApiService } from '../../services/propertyApiService';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { authService } from '../../../auth/services/authService';
import { favoritesApiService } from '../../../favorites/services/favoritesApiService';

const FILTER_PILLS = [
  'Tous',
  'Prix',
  'Appartement',
  'Villa',
  'Maison',
  'Chambres',
] as const;

interface HomeScreenProps {
  onNavigateToSearch?: () => void;
  onNavigateToProfile?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSearch,
  onNavigateToProfile,
}) => {
  const [currentView, setCurrentView] = useState<'home' | 'map' | 'add'>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([...mockProperties]);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const { isDark, toggleTheme, colors } = useTheme();
  const { t, language, setLanguage, isRTL } = useTranslation();
  const bottomClearance = useBottomNavClearance();

  const getFilterLabel = (pill: string) => {
    switch (pill) {
      case 'Tous': return t('filter_all');
      case 'Prix': return t('filter_price');
      case 'Appartement': return t('filter_apartment');
      case 'Villa': return t('filter_villa');
      case 'Maison': return t('filter_house');
      case 'Chambres': return t('filter_bedrooms');
      default: return pill;
    }
  };

  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setCurrentUser(authService.getCurrentUser());
    });
    return unsub;
  }, []);

  useEffect(() => {
    favoritesApiService.init();
    const unsubFav = favoritesApiService.addListener(() => {
      setProperties((prev) => [...prev]);
    });
    return unsubFav;
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const list = await propertyApiService.getProperties();
      if (isMounted && list.length > 0) {
        setProperties(list);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtrage selon le filtre actif et la recherche textuelle
  const filteredProperties = properties.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (p.titre || '').toLowerCase().includes(q);
      const matchLoc = (p.localisation || '').toLowerCase().includes(q);
      const matchType = (p.type || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchType) return false;
    }
    if (activeFilter === 'Tous' || activeFilter === 'Prix' || activeFilter === 'Chambres') {
      return true;
    }
    return p.type.toLowerCase() === activeFilter.toLowerCase();
  });

  if (currentView === 'map') {
    return (
      <MapScreen
        onBack={() => setCurrentView('home')}
        onSelectProperty={(prop) => {
          setSelectedProperty(prop);
          setCurrentView('home');
        }}
      />
    );
  }

  if (currentView === 'add') {
    return (
      <AddPropertyScreen
        onBack={() => setCurrentView('home')}
        onPropertyCreated={(created) => {
          setProperties((prev) => [created, ...prev]);
        }}
      />
    );
  }

  if (selectedProperty) {
    return (
      <PropertyDetailsScreen
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  const cycleLanguage = () => {
    if (language === 'fr') setLanguage('ar');
    else if (language === 'ar') setLanguage('en');
    else setLanguage('fr');
  };

  const initials =
    currentUser && currentUser.fullName
      ? currentUser.fullName
          .split(' ')
          .map((e) => (e ? e[0] : ''))
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : '';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomClearance },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. EN-TÊTE : PROFIL, THÈME, LANGUE, AJOUT & PARAMÈTRES */}
        <View
          style={[
            styles.headerRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.userInfo,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
              isRTL ? { marginLeft: 8, marginRight: 0 } : { marginRight: 8 },
            ]}
            onPress={onNavigateToProfile}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={t('nav_profile')}
          >
            <View
              style={[
                styles.avatarBadge,
                {
                  backgroundColor: currentUser ? colors.accentBlue : colors.surface,
                  borderColor: currentUser ? colors.accentBlue : colors.border,
                },
              ]}
            >
              {initials ? (
                <Text style={styles.monogramText}>{initials}</Text>
              ) : (
                <User size={19} color={colors.accentBlue} strokeWidth={2} />
              )}
            </View>

            <View
              style={[
                styles.userTextContainer,
                isRTL ? { marginRight: 10, marginLeft: 0, alignItems: 'flex-end' } : { marginLeft: 10 },
              ]}
            >
              <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
                {currentUser ? t('greeting_user') : t('greeting_guest')}
              </Text>
              <Text style={[styles.userNameText, { color: colors.textPrimary }]} numberOfLines={1}>
                {currentUser ? currentUser.fullName : t('guest_name')}
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={[
              styles.headerActions,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                AppShadows.subtle,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('theme_choice')}
            >
              {isDark ? (
                <Sun size={18} color="#FBBF24" strokeWidth={2} />
              ) : (
                <Moon size={18} color={colors.textPrimary} strokeWidth={2} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.langActionBtn,
                AppShadows.subtle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={cycleLanguage}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('language_choice')}
            >
              <Languages size={15} color={colors.accentBlue} strokeWidth={2} />
              <Text style={[styles.langCodeText, { color: colors.textPrimary }]}>
                {language === 'fr' ? 'FR' : language === 'ar' ? 'AR' : 'EN'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                AppShadows.subtle,
                {
                  backgroundColor: colors.accentBlue,
                  borderColor: colors.accentBlue,
                },
              ]}
              onPress={() => setCurrentView('add')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t('profile_publish')}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                AppShadows.subtle,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={onNavigateToProfile}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('app_settings')}
            >
              <Settings size={18} color={colors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. BARRE DE RECHERCHE MODERNE */}
        <View
          testID="home_search_bar"
          style={[
            styles.searchBar,
            AppShadows.subtle,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.searchIconContainer,
              {
                backgroundColor: colors.accentBlueSoft,
                marginRight: isRTL ? 0 : 10,
                marginLeft: isRTL ? 10 : 0,
              },
            ]}
          >
            <Search size={17} color={colors.accentBlue} strokeWidth={2.2} />
          </View>
          <TextInput
            testID="home_search_input"
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                textAlign: isRTL ? 'right' : 'left',
              },
              Platform.OS === 'web' && ({ outlineWidth: 0, outlineStyle: 'none' } as object),
            ]}
            placeholder={t('search_placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={onNavigateToSearch}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={[
                styles.tuneButton,
                { backgroundColor: colors.surfaceElevated },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('btn_reset')}
            >
              <X size={16} color={colors.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onNavigateToSearch}
              style={[
                styles.tuneButton,
                { backgroundColor: colors.surfaceElevated },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('btn_filter')}
            >
              <Settings size={17} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. RANGÉE DE FILTRES IMMOBILIERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={[
            styles.filterContainer,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {FILTER_PILLS.map((filtre) => {
            const isSelected = activeFilter === filtre;
            return (
              <TouchableOpacity
                key={filtre}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.accentBlue : colors.surface,
                    borderColor: isSelected ? colors.accentBlue : colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(filtre)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {getFilterLabel(filtre)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. BANNIÈRE SERVICES DARLINK + ACCÈS CARTE */}
        <View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: colors.accentBlueSoft,
              borderColor: isDark ? 'rgba(59, 130, 246, 0.30)' : 'rgba(37, 99, 235, 0.20)',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.bannerIconBox,
              {
                backgroundColor: colors.accentBlue,
                marginRight: isRTL ? 0 : 12,
                marginLeft: isRTL ? 12 : 0,
              },
            ]}
          >
            <Building size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.bannerTextWrap}>
            <Text
              style={[
                styles.bannerTitle,
                { color: isDark ? '#93C5FD' : colors.accentBlue, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('banner_title')}
            </Text>
            <Text
              style={[
                styles.bannerSubtitle,
                { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('banner_subtitle')}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.mapPillBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setCurrentView('map')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir la carte"
          >
            <MapIcon size={17} color={colors.accentBlue} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.sectionHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('listings_title')}
          </Text>
          <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
            {t('listings_count', { count: filteredProperties.length })}
          </Text>
        </View>

        {/* 5. LISTE DES CARTES DE BIENS */}
        {filteredProperties.length === 0 ? (
          <EmptyStateView
            title={t('search_empty_title')}
            message={t('search_empty_sub')}
            actionLabel={t('search_reset_all')}
            onAction={() => {
              setSearchQuery('');
              setActiveFilter('Tous');
            }}
          />
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id ?? property.titre}
              property={property}
              onPress={(p) => setSelectedProperty(p)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    alignItems: 'center',
  },
  avatarBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  monogramText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    alignItems: 'center',
    gap: 6,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  langActionBtn: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  langCodeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  searchBar: {
    height: 54,
    borderRadius: 22,
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  tuneButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  filterScrollView: {
    marginBottom: 16,
    marginHorizontal: -20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
  },
  bannerContainer: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 18,
    alignItems: 'center',
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  mapPillBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
