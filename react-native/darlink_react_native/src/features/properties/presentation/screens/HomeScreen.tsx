// ============================================================
// DARLINK — APPLE-LEVEL HOME DISCOVERY SCREEN (React Native)
// Editorial typography, frosted glass search & action orbs,
// horizontal architectural collection + vertical live Firestore feed.
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
import { Property, formatPrice } from '../../domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { EmptyStateView } from '../../../../core/components/EmptyStateView';
import { LoadingSkeleton } from '../../../../core/components/LoadingSkeleton';
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
import {
  LiquidGlassView,
  GlassOrbButton,
  EditorialSectionHeader,
} from '../../../../core/designSystem/LiquidGlass';
import { TypographyScale, RadiusScale, triggerHaptic } from '../../../../core/designSystem/tokens';

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
  const [headerVisible, setHeaderVisible] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);
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

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    if (currentY <= 12) {
      setHeaderVisible(true);
    } else if (diff > 14 && currentY > 60) {
      setHeaderVisible(false);
    } else if (diff < -10) {
      setHeaderVisible(true);
    }
    lastScrollY.current = currentY;
  }, []);

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

  const monogram =
    currentUser && currentUser.fullName
      ? currentUser.fullName
          .split(' ')
          .map((e) => (e ? e[0] : ''))
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'DL';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
        {__DEV__ && headerVisible && (
          <View style={styles.diagRow}>
            <View
              style={[
                styles.diagPill,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
              ]}
            >
              <View style={[styles.diagDot, { backgroundColor: colors.accentGreen }]} />
              <Text style={[TypographyScale.micro, { color: colors.textSecondary, fontSize: 10 }]}>
                {authService.getDiagnosticInfo().projectId} • {authService.getDiagnosticInfo().authUid}
              </Text>
            </View>
          </View>
        )}

        {/* Collapsible Editorial Header */}
        {headerVisible && (
          <View style={styles.headerRow}>
            <View style={styles.userInfo}>
              <View
                style={[
                  styles.monogramAvatar,
                  { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' },
                ]}
              >
                <Text style={[styles.monogramText, { color: isDark ? '#1D1D1F' : '#FFFFFF' }]}>
                  {monogram}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[TypographyScale.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                  {currentUser ? 'Bonjour • DarLink' : 'Bienvenue • DarLink'}
                </Text>
                <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {currentUser ? currentUser.fullName : 'Visiteur'}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <GlassOrbButton
                size={38}
                onPress={toggleTheme}
                accessibilityLabel="Basculer le thème"
              >
                {isDark ? (
                  <Sun size={17} color={colors.textPrimary} />
                ) : (
                  <Moon size={17} color={colors.textPrimary} />
                )}
              </GlassOrbButton>

              <GlassOrbButton
                size={38}
                onPress={() => {
                  if (language === 'fr') setLanguage('ar');
                  else if (language === 'ar') setLanguage('en');
                  else setLanguage('fr');
                }}
                accessibilityLabel="Changer de langue"
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>
                  {language.toUpperCase()}
                </Text>
              </GlassOrbButton>

              <GlassOrbButton
                size={38}
                onPress={() => setCurrentView('add')}
                accessibilityLabel="Déposer une annonce"
              >
                <Plus size={18} color={colors.textPrimary} />
              </GlassOrbButton>

              <GlassOrbButton
                size={38}
                badgeCount={unreadNotifCount}
                onPress={() => setCurrentView('notifications')}
                accessibilityLabel="Centre de notifications"
              >
                <Bell size={17} color={colors.textPrimary} />
              </GlassOrbButton>

              <GlassOrbButton
                size={38}
                onPress={() => setCurrentView('map')}
                accessibilityLabel="Ouvrir la carte"
              >
                <MapIcon size={17} color={colors.accentChampagne} />
              </GlassOrbButton>
            </View>
          </View>
        )}

        {/* Editorial Hero Headline */}
        <View style={styles.heroBlock}>
          <Text style={[TypographyScale.micro, { color: colors.accentChampagne }]}>
            IMMOBILIER EN TUNISIE
          </Text>
          <Text style={[TypographyScale.heroDisplay, { color: colors.textPrimary, fontSize: 28, marginTop: 6 }]}>
            {t('hero_title')}
          </Text>
        </View>

        {/* Liquid Glass Search Input */}
        <LiquidGlassView borderRadius={RadiusScale.pill} intensity={isDark ? 45 : 62} style={styles.searchBar}>
          <View style={styles.searchInner}>
            <Search size={19} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={t('search_placeholder')}
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.filterOrb, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => {
                triggerHaptic('selection');
                if (onNavigateToSearch) onNavigateToSearch();
              }}
              accessibilityLabel="Filtres avancés"
            >
              <SlidersHorizontal size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </LiquidGlassView>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_PILLS.map((pill) => {
            const isSelected = activeFilter === pill;
            return (
              <TouchableOpacity
                key={pill}
                activeOpacity={0.85}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveFilter(pill);
                }}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#F5F5F7'
                        : '#1D1D1F'
                      : colors.surface,
                    borderColor: isSelected ? 'transparent' : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isSelected
                      ? isDark
                        ? '#1D1D1F'
                        : '#FFFFFF'
                      : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: isSelected ? '600' : '500',
                  }}
                >
                  {getFilterLabel(pill)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Horizontal Architectural Collection */}
        {!loading && filteredProperties.length > 1 && (
          <View style={styles.collectionSection}>
            <EditorialSectionHeader
              title="Sélection en Tunisie"
              subtitle="Références et biens disponibles"
              trailing={
                <Text style={[TypographyScale.caption, { color: colors.accentChampagne }]}>
                  {filteredProperties.length}
                </Text>
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {filteredProperties.slice(0, 6).map((prop, idx) => (
                <TouchableOpacity
                  key={`col_${prop.id || idx}`}
                  activeOpacity={0.9}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedProperty(prop);
                  }}
                  style={[
                    styles.collectionTile,
                    {
                      backgroundColor: isDark ? '#14171F' : '#EFECE5',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {prop.imageUrl ? (
                    <Image
                      source={{ uri: prop.imageUrl }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.collectionFallback}>
                      <Building2 size={28} color={colors.accentChampagne} strokeWidth={1.6} />
                      <Text style={[TypographyScale.micro, { color: colors.accentChampagne, marginTop: 6 }]}>
                        {prop.governorate || 'Tunisie'}
                      </Text>
                    </View>
                  )}

                  <LiquidGlassView borderRadius={16} intensity={55} elevated={false} style={styles.collectionGlass}>
                    <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 14.5 }]} numberOfLines={1}>
                      {formatPrice(prop.prix, Boolean(prop.estLocation), Boolean(prop.priceOnRequest))}
                    </Text>
                    <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                      {prop.titre}
                    </Text>
                  </LiquidGlassView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Vertical Catalogue Section */}
        <View style={styles.catalogueSection}>
          <EditorialSectionHeader
            title={t('our_properties')}
            trailing={
              <View style={[styles.countChip, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[TypographyScale.micro, { color: colors.textSecondary }]}>
                  {filteredProperties.length} {filteredProperties.length <= 1 ? 'bien' : 'biens'}
                </Text>
              </View>
            }
          />
        </View>

        {loading ? (
          <View style={styles.feedWrap}>
            <LoadingSkeleton height={340} borderRadius={RadiusScale.lg} style={{ marginBottom: 20 }} />
            <LoadingSkeleton height={340} borderRadius={RadiusScale.lg} />
          </View>
        ) : filteredProperties.length === 0 ? (
          <EmptyStateView
            title="Aucun bien disponible"
            message="Aucune annonce ou référence ne correspond actuellement à cette recherche."
            actionLabel="Réinitialiser"
            onAction={() => {
              setActiveFilter('Tous');
              setSearchQuery('');
            }}
          />
        ) : (
          <View style={styles.feedWrap}>
            {filteredProperties.map((prop, index) => (
              <PropertyCard
                key={prop.id ? String(prop.id) : `prop_${index}`}
                property={prop}
                onPress={(selected) => setSelectedProperty(selected)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 118 },
  diagRow: { paddingHorizontal: 20, paddingTop: 6 },
  diagPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 0.8,
  },
  diagDot: { width: 6, height: 6, borderRadius: 3 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  monogramAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: { fontSize: 13.5, fontWeight: '700' },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBlock: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  searchBar: {
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
  },
  filterOrb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 999,
    borderWidth: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  horizontalScroll: {
    paddingTop: 14,
    gap: 14,
  },
  collectionTile: {
    width: 240,
    height: 212,
    borderRadius: 22,
    borderWidth: 0.9,
    overflow: 'hidden',
  },
  collectionFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 68,
  },
  collectionGlass: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    padding: 11,
  },
  catalogueSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  countChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  feedWrap: {
    paddingHorizontal: 20,
  },
});
