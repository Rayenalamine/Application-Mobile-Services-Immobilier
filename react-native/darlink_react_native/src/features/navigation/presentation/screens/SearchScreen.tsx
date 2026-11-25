// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE & FILTRES MULTICRITÈRES (React Native)
// Icônes vectorielles Lucide, Design System unifié & support RTL
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  Map as MapIcon,
  RotateCcw,
  Search,
  X,
  MapPin,
} from 'lucide-react-native';
import { AppShadows } from '../../../../core/constants/spacing';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { EmptyStateView } from '../../../../core/components/EmptyStateView';
import { useBottomNavClearance } from '../../../../core/components/FloatingBottomNav';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property } from '../../../properties/domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';
import { MapScreen } from '../../../map/presentation/screens/MapScreen';

const SEGMENTS = ['Tous', 'Acheter', 'Louer'] as const;
const PROPERTY_TYPES = ['Tous', 'Appartement', 'Villa', 'Maison', 'Penthouse'] as const;
const BEDROOMS = ['Tous', 'Studio', '1+', '2+', '3+', '4+'] as const;
const CITIES = ['Tunis', 'La Marsa', 'Sousse', 'Hammamet', 'Djerba', 'Monastir', 'Sfax'] as const;

export const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<string>('Tous');
  const [selectedType, setSelectedType] = useState<string>('Tous');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('Tous');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { isDark, colors } = useTheme();
  const { t, isRTL } = useTranslation();
  const bottomClearance = useBottomNavClearance();

  useEffect(() => {
    fetchFilteredProperties();
  }, [selectedSegment, selectedType, selectedCity, selectedBedrooms, minPrice, maxPrice]);

  const fetchFilteredProperties = async () => {
    setLoading(true);
    let minBeds: number | undefined;
    if (selectedBedrooms === '1+') minBeds = 1;
    if (selectedBedrooms === '2+') minBeds = 2;
    if (selectedBedrooms === '3+') minBeds = 3;
    if (selectedBedrooms === '4+') minBeds = 4;

    const list = await propertyApiService.getProperties({
      search: searchQuery.trim() || undefined,
      city: selectedCity && selectedCity !== 'Toutes' ? selectedCity : undefined,
      type: selectedType !== 'Tous' ? selectedType : undefined,
      isRental: selectedSegment === 'Louer' ? true : selectedSegment === 'Acheter' ? false : undefined,
      minBedrooms: minBeds,
      minPrice: minPrice,
      maxPrice: maxPrice,
    });
    setProperties(list);
    setLoading(false);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedSegment('Tous');
    setSelectedType('Tous');
    setSelectedCity('');
    setSelectedBedrooms('Tous');
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  if (showMap) {
    return (
      <MapScreen
        onBack={() => setShowMap(false)}
        onSelectProperty={(p) => {
          setShowMap(false);
          setSelectedProperty(p);
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

  const handleApply = () => {
    fetchFilteredProperties();
    Alert.alert(
      'Filtres appliqués',
      `${properties.length} bien(s) trouvé(s) dans la base de données.`
    );
  };

  const getSegmentLabel = (seg: string) => {
    if (seg === 'Tous') return t('filter_all');
    if (seg === 'Acheter') return t('search_buy');
    if (seg === 'Louer') return t('search_rent');
    return seg;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'Tous') return t('filter_all');
    if (type === 'Appartement') return t('filter_apartment');
    if (type === 'Villa') return t('filter_villa');
    if (type === 'Maison') return t('filter_house');
    return type;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomClearance + 84 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. BARRE SUPÉRIEURE */}
        <View
          style={[
            styles.headerBar,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('search_title')}
          </Text>

          <View
            style={[
              styles.headerRightActions,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.glassCircleBtn,
                AppShadows.subtle,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowMap(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir la carte"
            >
              <MapIcon size={18} color={colors.accentBlue} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.glassCircleBtn,
                AppShadows.subtle,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={handleReset}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('btn_reset')}
            >
              <RotateCcw size={17} color={colors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. CHAMP DE RECHERCHE TEXTUELLE */}
        <View
          style={[
            styles.searchBox,
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
            testID="search_input"
            style={[
              styles.searchInput,
              { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
              Platform.OS === 'web' && ({ outlineWidth: 0, outlineStyle: 'none' } as object),
            ]}
            placeholder={t('search_placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
            }}
            onSubmitEditing={fetchFilteredProperties}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchFilteredProperties();
              }}
              style={[styles.clearBtn, { backgroundColor: colors.surfaceElevated }]}
              accessibilityRole="button"
              accessibilityLabel={t('btn_reset')}
            >
              <X size={15} color={colors.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. CONTRÔLEUR SEGMENTÉ : TOUS / ACHETER / LOUER */}
        <View
          style={[
            styles.segmentedControl,
            {
              backgroundColor: colors.segmentedBg,
              borderColor: colors.border,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          {SEGMENTS.map((seg) => {
            const isSelected = selectedSegment === seg;
            return (
              <TouchableOpacity
                key={seg}
                style={[
                  styles.segmentButton,
                  isSelected && {
                    backgroundColor: colors.accentBlue,
                    shadowColor: colors.accentBlue,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.28,
                    shadowRadius: 6,
                    elevation: 3,
                  },
                ]}
                onPress={() => setSelectedSegment(seg)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {getSegmentLabel(seg)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. SÉLECTION TYPE DE BIEN */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('search_property_type')}
          </Text>
          <View
            style={[
              styles.pillsRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {PROPERTY_TYPES.map((type) => {
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pillButton,
                    {
                      backgroundColor: isSelected ? colors.accentBlue : colors.surface,
                      borderColor: isSelected ? colors.accentBlue : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {getTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. VILLES POPULAIRES EN TUNISIE */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('search_popular_cities')}
          </Text>
          <View
            style={[
              styles.pillsRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.pillButton,
                    styles.cityPill,
                    {
                      backgroundColor: isSelected ? colors.accentBlue : colors.surface,
                      borderColor: isSelected ? colors.accentBlue : colors.border,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                  onPress={() => setSelectedCity(isSelected ? '' : city)}
                  activeOpacity={0.8}
                >
                  <MapPin
                    size={13}
                    color={isSelected ? '#FFFFFF' : colors.accentBlue}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. NOMBRE DE CHAMBRES */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('search_bedrooms')}
          </Text>
          <View
            style={[
              styles.pillsRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {BEDROOMS.map((bed) => {
              const isSelected = selectedBedrooms === bed;
              return (
                <TouchableOpacity
                  key={bed}
                  style={[
                    styles.pillButton,
                    {
                      backgroundColor: isSelected ? colors.accentBlue : colors.surface,
                      borderColor: isSelected ? colors.accentBlue : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedBedrooms(bed)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {bed === 'Tous' ? t('filter_all') : bed}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 7. FOURCHETTE DE PRIX */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('search_budget')}
          </Text>
          <View
            style={[
              styles.pillsRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {[
              { label: t('filter_all'), min: undefined, max: undefined },
              { label: '< 300k DT', min: undefined, max: 300000 },
              { label: '300k - 600k DT', min: 300000, max: 600000 },
              { label: '> 600k DT', min: 600000, max: undefined },
            ].map((budget, i) => {
              const isSelected = minPrice === budget.min && maxPrice === budget.max;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.pillButton,
                    {
                      backgroundColor: isSelected ? colors.accentBlue : colors.surface,
                      borderColor: isSelected ? colors.accentBlue : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setMinPrice(budget.min);
                    setMaxPrice(budget.max);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {budget.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 8. RÉSULTATS DYNAMIQUES EN TEMPS RÉEL */}
        <View
          style={[
            styles.resultsHeaderRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Text style={[styles.resultsCountText, { color: colors.textPrimary }]}>
            {t('search_results_count', { count: properties.length })}
          </Text>
          {(selectedCity || selectedType !== 'Tous' || selectedBedrooms !== 'Tous' || selectedSegment !== 'Tous' || searchQuery || minPrice !== undefined) && (
            <TouchableOpacity onPress={handleReset}>
              <Text style={{ color: colors.accentBlue, fontWeight: '700', fontSize: 13 }}>
                {t('btn_reset')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {properties.length === 0 && !loading ? (
          <View
            style={[
              styles.emptyStateBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <EmptyStateView
              title={t('search_empty_title')}
              message={t('search_empty_sub')}
              actionLabel={t('search_reset_all')}
              onAction={handleReset}
              style={{ padding: 8 }}
            />
          </View>
        ) : (
          properties.map((prop) => (
            <View key={prop.id} style={styles.cardWrapper}>
              <PropertyCard
                property={prop}
                onPress={() => setSelectedProperty(prop)}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* DOCK D'ACTION AU-DESSUS DE LA BARRE DE NAVIGATION FLOTTANTE */}
      <View
        style={[
          styles.bottomDock,
          AppShadows.card,
          {
            bottom: bottomClearance - 4,
            backgroundColor: isDark ? 'rgba(21, 30, 50, 0.96)' : 'rgba(255, 255, 255, 0.97)',
            borderColor: colors.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.dockOutlinedBtn, { borderColor: colors.border }]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={[styles.dockOutlinedText, { color: colors.textPrimary }]}>
            {t('btn_reset')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dockFilledBtn, { backgroundColor: colors.accentBlue }]}
          onPress={handleApply}
          activeOpacity={0.85}
        >
          <Text style={styles.dockFilledText}>{t('btn_apply_filters')}</Text>
        </TouchableOpacity>
      </View>
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
  headerBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    gap: 8,
  },
  glassCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    alignItems: 'center',
    height: 54,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 10,
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
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedControl: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  segmentText: {
    fontSize: 13,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  pillsRow: {
    flexWrap: 'wrap',
    gap: 8,
  },
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  cityPill: {
    alignItems: 'center',
    gap: 5,
  },
  pillText: {
    fontSize: 13,
  },
  resultsHeaderRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultsCountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyStateBox: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardWrapper: {
    marginBottom: 4,
  },
  bottomDock: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 10,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
  },
  dockOutlinedBtn: {
    flex: 4,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockOutlinedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dockFilledBtn: {
    flex: 5,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockFilledText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
