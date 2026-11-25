// ============================================================
// DARLINK — ÉCRAN D'ACCUEIL LUXE MODERNE (React Native Screen 1)
// Design adaptatif Clair / Sombre, monogramme initiales épuré
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';
import { mockProperties } from '../../data/mockProperties';
import { Property } from '../../domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
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
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToSearch }) => {
  const [currentView, setCurrentView] = useState<'home' | 'map' | 'add'>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([...mockProperties]);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const { isDark, toggleTheme, colors } = useTheme();
  const { t, language, setLanguage } = useTranslation();

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
      // Forcer la mise à jour des cartes lors d'un ajout/suppression de favori
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

  // Si un bien est sélectionné, on affiche l'écran de détails luxe (Screen 2)
  if (selectedProperty) {
    return (
      <PropertyDetailsScreen
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. EN-TÊTE UTILISATEUR AVEC MONOGRAMME INITIALES ET BASCULE DU THÈME */}
        <View style={styles.headerRow}>
          <View style={styles.userInfo}>
            {/* Monogramme épuré sans photo */}
            <View
              style={[
                styles.monogramAvatar,
                {
                  backgroundColor: isDark ? '#22242D' : '#E9EBF0',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.monogramText, { color: colors.textPrimary }]}>
                {currentUser && currentUser.fullName
                  ? currentUser.fullName.split(' ').map((e) => (e ? e[0] : '')).slice(0, 2).join('')
                  : 'IN'}
              </Text>
            </View>

            <View style={styles.userTextContainer}>
              <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
                {currentUser ? 'Bonjour ! 👋' : 'Bienvenue !'}
              </Text>
              <Text style={[styles.userNameText, { color: colors.textPrimary }]} numberOfLines={1}>
                {currentUser ? currentUser.fullName : 'Invité'}
              </Text>
            </View>
          </View>

          {/* Boutons d'action : Bascule Thème Sombre/Clair + Ajout + Carte */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Basculer le mode sombre ou clair"
            >
              <Text style={styles.actionEmoji}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            {/* Bouton de langue trilingue FR / AR / EN */}
            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                if (language === 'fr') setLanguage('ar');
                else if (language === 'ar') setLanguage('en');
                else setLanguage('fr');
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Changer de langue"
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textPrimary }}>
                {language === 'fr' ? 'FR' : language === 'ar' ? 'عربي' : 'EN'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setCurrentView('add')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Déposer une annonce"
            >
              <Text style={styles.actionEmoji}>➕</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setCurrentView('map')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir la carte"
            >
              <Text style={styles.actionEmoji}>🗺️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. BARRE DE RECHERCHE FLOTTANTE TYPE PILULE */}
        <View
          testID="home_search_bar"
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowOpacity: isDark ? 0.2 : 0.04,
            },
          ]}
        >
          <View
            style={[
              styles.searchIconContainer,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F0F2F5' },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
          <TextInput
            testID="home_search_input"
            style={[
              styles.searchInput,
              { color: colors.textPrimary },
              Platform.OS === 'web' && ({ outlineWidth: 0, outlineStyle: 'none' } as any),
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
              style={styles.clearSearchBtn}
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
            >
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onNavigateToSearch}
              style={[
                styles.tuneButton,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F0F2F5' },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Filtres avancés"
            >
              <Text style={styles.tuneIcon}>⚙️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. RANGÉE DE JETONS DE FILTRES HORIZONTAUX */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_PILLS.map((filtre) => {
            const isSelected = activeFilter === filtre;
            return (
              <TouchableOpacity
                key={filtre}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? colors.accentBlue
                      : colors.surface,
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
                      color: isSelected
                        ? '#FFFFFF'
                        : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {getFilterLabel(filtre)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. BANNIÈRE DISCRÈTE & SECTION TITRE */}
        <View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: isDark ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.08)',
              borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)',
            },
          ]}
        >
          <Text style={styles.bannerTitle}>Services Immobilier DarLink</Text>
          <Text style={[styles.bannerSubtitle, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>
            Trouvez le bien immobilier de vos rêves en Tunisie avec visite guidée.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Nos biens immobiliers
          </Text>
          <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
            {filteredProperties.length} annonces disponibles
          </Text>
        </View>

        {/* 5. LISTE IMMERSIVE DES CARTES DE BIENS */}
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id ?? property.titre}
            property={property}
            onPress={(p) => setSelectedProperty(p)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  monogramAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  monogramText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userTextContainer: {
    flex: 1,
    marginLeft: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionEmoji: {
    fontSize: 17,
  },
  searchBar: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  clearSearchBtn: {
    padding: 6,
    marginRight: 4,
  },
  tuneButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tuneIcon: {
    fontSize: 14,
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
    padding: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  bannerTitle: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
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
    fontWeight: '500',
  },
});
