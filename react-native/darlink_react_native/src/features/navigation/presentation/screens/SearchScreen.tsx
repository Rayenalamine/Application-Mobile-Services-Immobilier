// ============================================================
// DARLINK — APPLE LIQUID GLASS SEARCH & FILTERS (React Native)
// Mirrors Flutter EcranRecherche: frosted search, segmented
// controls, 24 governorates, range filters, and editorial cards.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Map as MapIcon, RotateCcw, Search, X, MapPin } from 'lucide-react-native';
import { TUNISIA_GOVERNORATES } from '../../../../core/constants/tunisiaLocations';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property } from '../../../properties/domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { EmptyStateView } from '../../../../core/components/EmptyStateView';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';
import { MapScreen } from '../../../map/presentation/screens/MapScreen';
import {
  LiquidGlassView,
  GlassOrbButton,
  EditorialSectionHeader,
} from '../../../../core/designSystem/LiquidGlass';
import { TypographyScale, RadiusScale, triggerHaptic } from '../../../../core/designSystem/tokens';

const SEGMENTS = ['Tous', 'Acheter', 'Louer'] as const;
const PROPERTY_TYPES = ['Tous', 'Appartement', 'Villa', 'Maison', 'Studio', 'Terrain', 'Commercial'] as const;
const BEDROOMS = ['Tous', '1+', '2+', '3+', '4+'] as const;
const BATHROOMS = ['Tous', '1+', '2+', '3+'] as const;
const SORT_OPTIONS = [
  { key: 'newest', labelKey: 'sort_newest' },
  { key: 'price_asc', labelKey: 'sort_price_asc' },
  { key: 'price_desc', labelKey: 'sort_price_desc' },
] as const;

export const SearchScreen: React.FC = () => {
  const { t, translatePropertyType } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<string>('Tous');
  const [selectedType, setSelectedType] = useState<string>('Tous');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('Tous');
  const [selectedBathrooms, setSelectedBathrooms] = useState<string>('Tous');
  const [selectedGov, setSelectedGov] = useState<string>('');
  const [minPriceStr, setMinPriceStr] = useState<string>('');
  const [maxPriceStr, setMaxPriceStr] = useState<string>('');
  const [minAreaStr, setMinAreaStr] = useState<string>('');
  const [maxAreaStr, setMaxAreaStr] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [limit, setLimit] = useState<number>(20);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapFocusProperty, setMapFocusProperty] = useState<Property | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { isDark, colors } = useTheme();

  const fetchFilteredProperties = useCallback(async () => {
    setLoading(true);
    const parseOpt = (val: string) => {
      const n = Number(val.trim());
      return val.trim() && !isNaN(n) && n >= 0 ? n : undefined;
    };

    const minBeds =
      selectedBedrooms === '1+' ? 1 : selectedBedrooms === '2+' ? 2 : selectedBedrooms === '3+' ? 3 : selectedBedrooms === '4+' ? 4 : undefined;
    const minBaths =
      selectedBathrooms === '1+' ? 1 : selectedBathrooms === '2+' ? 2 : selectedBathrooms === '3+' ? 3 : undefined;

    const list = await propertyApiService.getProperties({
      search: searchQuery.trim() || undefined,
      governorate: selectedGov || undefined,
      type: selectedType !== 'Tous' ? selectedType : undefined,
      isRental: selectedSegment === 'Louer' ? true : selectedSegment === 'Acheter' ? false : undefined,
      minBedrooms: minBeds,
      minBathrooms: minBaths,
      minPrice: parseOpt(minPriceStr),
      maxPrice: parseOpt(maxPriceStr),
      minArea: parseOpt(minAreaStr),
      maxArea: parseOpt(maxAreaStr),
      sort: sortBy,
      limit,
    });
    setProperties(list);
    setLoading(false);
  }, [
    searchQuery,
    selectedGov,
    selectedType,
    selectedSegment,
    selectedBedrooms,
    selectedBathrooms,
    minPriceStr,
    maxPriceStr,
    minAreaStr,
    maxAreaStr,
    sortBy,
    limit,
  ]);

  useEffect(() => {
    fetchFilteredProperties();
  }, [fetchFilteredProperties]);

  const handleReset = () => {
    triggerHaptic('light');
    setSearchQuery('');
    setSelectedSegment('Tous');
    setSelectedType('Tous');
    setSelectedGov('');
    setSelectedBedrooms('Tous');
    setSelectedBathrooms('Tous');
    setMinPriceStr('');
    setMaxPriceStr('');
    setMinAreaStr('');
    setMaxAreaStr('');
    setSortBy('newest');
    setLimit(20);
  };

  if (showMap) {
    return (
      <MapScreen
        initialProperty={mapFocusProperty}
        onBack={() => {
          setMapFocusProperty(null);
          setShowMap(false);
        }}
        onSelectProperty={(p) => {
          setMapFocusProperty(null);
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
        onLocateOnMap={(prop) => {
          setSelectedProperty(null);
          setMapFocusProperty(prop);
          setShowMap(true);
        }}
      />
    );
  }

  const activeBg = isDark ? '#F5F5F7' : '#1D1D1F';
  const activeFg = isDark ? '#1D1D1F' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBar}>
          <View>
            <Text style={[TypographyScale.micro, { color: colors.accentChampagne }]}>{t('exploration_tag')}</Text>
            <Text style={[TypographyScale.pageTitle, { color: colors.textPrimary, fontSize: 22 }]}>
              {t('search_title')}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <GlassOrbButton size={40} onPress={() => setShowMap(true)} accessibilityLabel={t('nav_map')}>
              <MapIcon size={17} color={colors.accentChampagne} />
            </GlassOrbButton>
            <GlassOrbButton size={40} onPress={handleReset} accessibilityLabel={t('btn_reset')}>
              <RotateCcw size={17} color={colors.textPrimary} />
            </GlassOrbButton>
          </View>
        </View>

        <LiquidGlassView borderRadius={RadiusScale.pill} intensity={isDark ? 45 : 62} style={styles.searchBox}>
          <View style={styles.searchInner}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              testID="search_input"
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={t('search_input_placeholder')}
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </LiquidGlassView>

        {/* Segmented Control */}
        <View style={[styles.segmentedControl, { backgroundColor: colors.segmentedBg, borderColor: colors.border }]}>
          {SEGMENTS.map((seg) => {
            const isSelected = selectedSegment === seg;
            const segLabel = seg === 'Tous' ? t('filter_all') : seg === 'Acheter' ? t('segment_buy') : t('segment_rent');
            return (
              <TouchableOpacity
                key={seg}
                style={[styles.segmentBtn, isSelected && { backgroundColor: colors.surface }]}
                onPress={() => {
                  triggerHaptic('selection');
                  setSelectedSegment(seg);
                }}
              >
                <Text style={{ color: isSelected ? colors.textPrimary : colors.textSecondary, fontWeight: isSelected ? '600' : '500', fontSize: 13 }}>
                  {segLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 15, marginBottom: 10 }]}>
            {t('governorates_24')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              style={[styles.pill, { backgroundColor: !selectedGov ? activeBg : colors.surface, borderColor: !selectedGov ? 'transparent' : colors.border }]}
              onPress={() => setSelectedGov('')}
            >
              <Text style={{ color: !selectedGov ? activeFg : colors.textSecondary, fontSize: 12.5, fontWeight: '600' }}>{t('filter_all')}</Text>
            </TouchableOpacity>
            {TUNISIA_GOVERNORATES.map((g) => {
              const active = selectedGov === g.nameFr;
              return (
                <TouchableOpacity
                  key={g.code}
                  style={[styles.pill, { backgroundColor: active ? activeBg : colors.surface, borderColor: active ? 'transparent' : colors.border }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedGov(active ? '' : g.nameFr);
                  }}
                >
                  <MapPin size={12} color={active ? activeFg : colors.accentChampagne} />
                  <Text style={{ color: active ? activeFg : colors.textSecondary, fontSize: 12.5, fontWeight: active ? '600' : '500' }}>
                    {g.nameFr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 15, marginBottom: 10 }]}>
            {t('property_type')}
          </Text>
          <View style={styles.wrapRow}>
            {PROPERTY_TYPES.map((type) => {
              const active = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.pill, { backgroundColor: active ? activeBg : colors.surface, borderColor: active ? 'transparent' : colors.border }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedType(type);
                  }}
                >
                  <Text style={{ color: active ? activeFg : colors.textSecondary, fontSize: 12.5, fontWeight: active ? '600' : '500' }}>
                    {translatePropertyType(type)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.rangeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rangeGrid}>
            <TextInput
              style={[styles.rangeInput, { backgroundColor: colors.surfaceElevated, color: colors.textPrimary }]}
              placeholder={t('search_min_price')}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={minPriceStr}
              onChangeText={setMinPriceStr}
            />
            <TextInput
              style={[styles.rangeInput, { backgroundColor: colors.surfaceElevated, color: colors.textPrimary }]}
              placeholder={t('search_max_price')}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={maxPriceStr}
              onChangeText={setMaxPriceStr}
            />
          </View>
          <View style={styles.rangeGrid}>
            <TextInput
              style={[styles.rangeInput, { backgroundColor: colors.surfaceElevated, color: colors.textPrimary }]}
              placeholder={t('min_area')}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={minAreaStr}
              onChangeText={setMinAreaStr}
            />
            <TextInput
              style={[styles.rangeInput, { backgroundColor: colors.surfaceElevated, color: colors.textPrimary }]}
              placeholder={t('max_area')}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={maxAreaStr}
              onChangeText={setMaxAreaStr}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 15, marginBottom: 10 }]}>
            {t('search_rooms_and_sort')}
          </Text>
          <View style={styles.wrapRow}>
            {BEDROOMS.map((b) => {
              const active = selectedBedrooms === b;
              return (
                <TouchableOpacity
                  key={`bed_${b}`}
                  style={[styles.pill, { backgroundColor: active ? activeBg : colors.surface, borderColor: active ? 'transparent' : colors.border }]}
                  onPress={() => setSelectedBedrooms(b)}
                >
                  <Text style={{ color: active ? activeFg : colors.textSecondary, fontSize: 12 }}>
                    {b === 'Tous' ? t('search_beds_all') : t('search_beds_prefix', { count: b })}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {BATHROOMS.map((b) => {
              const active = selectedBathrooms === b;
              return (
                <TouchableOpacity
                  key={`bath_${b}`}
                  style={[styles.pill, { backgroundColor: active ? activeBg : colors.surface, borderColor: active ? 'transparent' : colors.border }]}
                  onPress={() => setSelectedBathrooms(b)}
                >
                  <Text style={{ color: active ? activeFg : colors.textSecondary, fontSize: 12 }}>
                    {b === 'Tous' ? t('search_baths_all') : t('search_baths_prefix', { count: b })}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.pill, { backgroundColor: active ? activeBg : colors.surface, borderColor: active ? 'transparent' : colors.border }]}
                  onPress={() => setSortBy(opt.key)}
                >
                  <Text style={{ color: active ? activeFg : colors.textSecondary, fontSize: 12, fontWeight: active ? '600' : '500' }}>
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <EditorialSectionHeader
            title={t('search_results_header', { count: properties.length })}
            trailing={
              <TouchableOpacity onPress={handleReset}>
                <Text style={[TypographyScale.caption, { color: colors.accentChampagne }]}>{t('btn_reset')}</Text>
              </TouchableOpacity>
            }
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.accentChampagne} style={{ marginVertical: 28 }} />
        ) : properties.length === 0 ? (
          <EmptyStateView
            title={t('search_empty_title')}
            message={t('search_empty_message')}
            actionLabel={t('search_reset_all')}
            onAction={handleReset}
          />
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} onPress={() => setSelectedProperty(prop)} />
            ))}
            {properties.length >= limit && (
              <TouchableOpacity
                style={[styles.loadMoreBtn, { borderColor: colors.border }]}
                onPress={() => setLimit((l) => l + 20)}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{t('load_more')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  searchBox: { marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, marginTop: 4 },
  searchInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontSize: 14.5 },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 4,
    borderRadius: RadiusScale.pill,
    borderWidth: 0.8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RadiusScale.pill,
    alignItems: 'center',
  },
  section: { paddingHorizontal: 20, marginTop: 20 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RadiusScale.pill,
    borderWidth: 0.9,
  },
  rangeCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
    borderRadius: 22,
    borderWidth: 0.9,
    gap: 10,
  },
  rangeGrid: { flexDirection: 'row', gap: 10 },
  rangeInput: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
  },
  loadMoreBtn: {
    paddingVertical: 13,
    borderRadius: RadiusScale.pill,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
});
