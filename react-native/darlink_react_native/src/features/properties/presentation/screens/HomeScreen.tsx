// ============================================================
// DARLINK — ÉCRAN D'ACCUEIL LUXE MODERNE (React Native)
// Chargement exclusif Cloud Firestore (zéro donnée fictive),
// icônes vectorielles Lucide, zéro emoji.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Sun,
  Moon,
  Plus,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  X,
  Building2,
  Bell,
} from 'lucide-react-native';
import { Property } from '../../domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { EmptyStateView } from '../../../../core/components/EmptyStateView';
import { PropertyDetailsScreen } from './PropertyDetailsScreen';
import { AddPropertyScreen } from './AddPropertyScreen';
import { MapScreen } from '../../../map/presentation/screens/MapScreen';
import { NotificationScreen } from '../../../notifications/presentation/screens/NotificationScreen';
import { notificationService } from '../../../notifications/services/notificationService';
import { propertyApiService } from '../../services/propertyApiService';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { authService } from '../../../auth/services/authService';
import { favoritesApiService } from '../../../favorites/services/favoritesApiService';

const FILTER_PILLS = ['Tous', 'Appartement', 'Villa', 'Maison', 'Terrain'] as const;

interface HomeScreenProps {
  onNavigateToSearch?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToSearch }) => {
  const [currentView, setCurrentView] = useState<'home' | 'map' | 'add' | 'notifications'>('home');
  const [mapFocusProperty, setMapFocusProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const { isDark, toggleTheme, colors } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const refreshNotifCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadNotifCount(count);
    } catch {
      setUnreadNotifCount(0);
    }
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const list = await propertyApiService.getProperties({ limit: 40 });
      setProperties(list);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifCount();
  }, [refreshNotifCount, currentUser]);

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
    loadProperties();
  }, [loadProperties]);

  const getFilterLabel = (pill: string) => {
    switch (pill) {
      case 'Tous':
        return t('filter_all');
      case 'Appartement':
        return t('filter_apartment');
      case 'Villa':
        return t('filter_villa');
      case 'Maison':
        return t('filter_house');
      default:
        return pill;
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (p.titre || '').toLowerCase().includes(q);
      const matchLoc = (p.localisation || '').toLowerCase().includes(q);
      const matchGov = (p.governorate || '').toLowerCase().includes(q);
      const matchType = (p.type || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchGov && !matchType) return false;
    }
    if (activeFilter === 'Tous') return true;
    return p.type.toLowerCase() === activeFilter.toLowerCase();
  });

  if (currentView === 'map') {
    return (
      <MapScreen
        initialProperty={mapFocusProperty}
        onBack={() => {
          setMapFocusProperty(null);
          setCurrentView('home');
        }}
        onSelectProperty={(prop) => {
          setMapFocusProperty(null);
          setSelectedProperty(prop);
          setCurrentView('home');
        }}
      />
    );
  }

  if (currentView === 'notifications') {
    return (
      <NotificationScreen
        onBack={() => {
          setCurrentView('home');
          refreshNotifCount();
        }}
        onOpenProperty={(prop) => {
          setSelectedProperty(prop);
          setCurrentView('home');
          refreshNotifCount();
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
        onLocateOnMap={(prop) => {
          setSelectedProperty(null);
          setMapFocusProperty(prop);
          setCurrentView('map');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProperties();
            }}
          />
        }
      >
        {/* EN-TÊTE */}
        <View style={styles.headerRow}>
          <View style={styles.userInfo}>
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
                  ? currentUser.fullName
                      .split(' ')
                      .map((e) => (e ? e[0] : ''))
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'DL'}
              </Text>
            </View>

            <View style={styles.userTextContainer}>
              <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
                {currentUser ? 'Bonjour' : 'Bienvenue sur DarLink'}
              </Text>
              <Text style={[styles.userNameText, { color: colors.textPrimary }]} numberOfLines={1}>
                {currentUser ? currentUser.fullName : 'Visiteur'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerActionBtn, { backgroundColor: colors.surface, borderColor: colors.border, position: 'relative' }]}
              onPress={() => setCurrentView('notifications')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Centre de notifications"
            >
              <Bell size={17} color={colors.textPrimary} />
              {unreadNotifCount > 0 && (
                <View style={styles.notifBadgeCircle}>
                  <Text style={styles.notifBadgeText}>
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={toggleTheme}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Basculer le thème"
            >
              {isDark ? <Sun size={17} color={colors.textPrimary} /> : <Moon size={17} color={colors.textPrimary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                if (language === 'fr') setLanguage('ar');
                else if (language === 'ar') setLanguage('en');
                else setLanguage('fr');
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Changer de langue"
            >
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: colors.textPrimary }}>
                {language === 'fr' ? 'FR' : language === 'ar' ? 'AR' : 'EN'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setCurrentView('add')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Déposer une annonce"
            >
              <Plus size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setCurrentView('map')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir la carte"
            >
              <MapIcon size={17} color={colors.accentBlue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* BARRE DE RECHERCHE */}
        <View
          testID="home_search_bar"
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border, shadowOpacity: isDark ? 0.2 : 0.04 },
          ]}
        >
          <View
            style={[
              styles.searchIconContainer,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F0F2F5' },
            ]}
          >
            <Search size={17} color={colors.accentBlue} />
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
              <X size={16} color={colors.textSecondary} />
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
              <SlidersHorizontal size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* PILLS DE FILTRE */}
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
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {getFilterLabel(filtre)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* BANNIÈRE DISCRÈTE */}
        <View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: isDark ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.08)',
              borderColor: isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)',
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Building2 size={17} color={colors.accentBlue} />
            <Text style={styles.bannerTitle}>DarLink Immobilier Tunisie</Text>
          </View>
          <Text style={[styles.bannerSubtitle, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>
            Catalogue connecté en direct à Cloud Firestore : annonces vérifiées et dépôts propriétaires.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Biens disponibles
          </Text>
          <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
            {filteredProperties.length} annonce(s)
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.accentBlue} />
          </View>
        ) : filteredProperties.length === 0 ? (
          <EmptyStateView
            title="Aucune annonce disponible"
            message="Aucun bien publié ne correspond à ce filtre pour le moment."
            actionLabel="Réinitialiser"
            onAction={() => {
              setActiveFilter('Tous');
              setSearchQuery('');
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  monogramAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  monogramText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  userTextContainer: { flex: 1, marginLeft: 10 },
  greetingText: { fontSize: 12, fontWeight: '500' },
  userNameText: { fontSize: 16, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0, backgroundColor: 'transparent' },
  clearSearchBtn: { padding: 6, marginRight: 4 },
  tuneButton: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  filterScrollView: { marginBottom: 16, marginHorizontal: -20 },
  filterContainer: { paddingHorizontal: 20, gap: 8 },
  filterPill: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 24, borderWidth: 1 },
  filterText: { fontSize: 13 },
  bannerContainer: { borderRadius: 18, padding: 16, borderWidth: 1, marginBottom: 18 },
  bannerTitle: { color: '#2563EB', fontSize: 15, fontWeight: '700' },
  bannerSubtitle: { fontSize: 12, lineHeight: 18 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sectionCount: { fontSize: 12, fontWeight: '500' },
  notifBadgeCircle: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
