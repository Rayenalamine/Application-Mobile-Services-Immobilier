// ============================================================
// DARLINK — RECHERCHE & FILTRES AVANCÉS CLOUD FIRESTORE (React Native)
// 24 Gouvernorats, transaction, type, prix/surface min-max, chambres, SDB, tri & pagination.
// Icônes Lucide sans emoji.
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
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Map as MapIcon, RotateCcw, Search, X, MapPin } from 'lucide-react-native';
import { TUNISIA_GOVERNORATES } from '../../../../core/constants/tunisiaLocations';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property } from '../../../properties/domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { EmptyStateView } from '../../../../core/components/EmptyStateView';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';
import { MapScreen } from '../../../map/presentation/screens/MapScreen';

const SEGMENTS = ['Tous', 'Acheter', 'Louer'] as const;
const PROPERTY_TYPES = ['Tous', 'Appartement', 'Villa', 'Maison', 'Studio', 'Terrain', 'Commercial'] as const;
const BEDROOMS = ['Tous', '1+', '2+', '3+', '4+'] as const;
const BATHROOMS = ['Tous', '1+', '2+', '3+'] as const;
const SORT_OPTIONS = [
  { key: 'newest', label: 'Plus récentes' },
  { key: 'price_asc', label: 'Prix croissant' },
  { key: 'price_desc', label: 'Prix décroissant' },
] as const;

export const SearchScreen: React.FC = () => {
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBar}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Recherche avancée</Text>
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={[styles.glassCircleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowMap(true)}
              accessibilityLabel="Carte"
            >
              <MapIcon size={17} color={colors.accentBlue} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.glassCircleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleReset}
              accessibilityLabel="Réinitialiser"
            >
              <RotateCcw size={17} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* CHAMP TEXTE */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.searchIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F0F2F5' }]}>
            <Search size={17} color={colors.accentBlue} />
          </View>
          <TextInput
            testID="search_input"
            style={[
              styles.searchInput,
              { color: colors.textPrimary },
              Platform.OS === 'web' && ({ outlineWidth: 0, outlineStyle: 'none' } as any),
            ]}
            placeholder="Ville, délégation, résidence, mot-clé..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* SEGMENT TRANSACTION */}
        <View style={[styles.segmentedControl, { backgroundColor: isDark ? '#181920' : '#E9EBF0', borderColor: colors.border }]}>
          {SEGMENTS.map((seg) => {
            const isSelected = selectedSegment === seg;
            return (
              <TouchableOpacity
                key={seg}
                style={[styles.segmentButton, isSelected && { backgroundColor: colors.accentBlue }]}
                onPress={() => setSelectedSegment(seg)}
              >
                <Text style={[styles.segmentText, { color: isSelected ? '#FFFFFF' : colors.textSecondary, fontWeight: isSelected ? '800' : '600' }]}>
                  {seg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 24 GOUVERNORATS DE TUNISIE */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Gouvernorat (24)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              style={[
                styles.pillButton,
                { backgroundColor: !selectedGov ? colors.accentBlue : colors.surface, borderColor: !selectedGov ? colors.accentBlue : colors.border },
              ]}
              onPress={() => setSelectedGov('')}
            >
              <Text style={[styles.pillText, { color: !selectedGov ? '#FFFFFF' : colors.textSecondary, fontWeight: '600' }]}>
                Tous
              </Text>
            </TouchableOpacity>
            {TUNISIA_GOVERNORATES.map((g) => {
              const active = selectedGov === g.nameFr;
              return (
                <TouchableOpacity
                  key={g.code}
                  style={[
                    styles.pillButton,
                    styles.cityPill,
                    { backgroundColor: active ? colors.accentBlue : colors.surface, borderColor: active ? colors.accentBlue : colors.border },
                  ]}
                  onPress={() => setSelectedGov(active ? '' : g.nameFr)}
                >
                  <MapPin size={12} color={active ? '#FFFFFF' : colors.accentBlue} />
                  <Text style={[styles.pillText, { color: active ? '#FFFFFF' : colors.textSecondary, fontWeight: active ? '700' : '500' }]}>
                    {g.nameFr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* TYPE DE BIEN */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Type de bien</Text>
          <View style={styles.pillsRow}>
            {PROPERTY_TYPES.map((type) => {
              const active = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.pillButton, { backgroundColor: active ? colors.accentBlue : colors.surface, borderColor: active ? colors.accentBlue : colors.border }]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.pillText, { color: active ? '#FFFFFF' : colors.textSecondary, fontWeight: active ? '700' : '500' }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* BUDGET & SURFACE MIN/MAX */}
        <View style={styles.rangeGrid}>
          <TextInput
            style={[styles.rangeInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Prix min (DT)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={minPriceStr}
            onChangeText={setMinPriceStr}
          />
          <TextInput
            style={[styles.rangeInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Prix max (DT)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={maxPriceStr}
            onChangeText={setMaxPriceStr}
          />
        </View>
        <View style={styles.rangeGrid}>
          <TextInput
            style={[styles.rangeInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Surface min (m²)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={minAreaStr}
            onChangeText={setMinAreaStr}
          />
          <TextInput
            style={[styles.rangeInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Surface max (m²)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={maxAreaStr}
            onChangeText={setMaxAreaStr}
          />
        </View>

        {/* CHAMBRES & SALLES DE BAIN */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Chambres & Salles de bain</Text>
          <View style={styles.pillsRow}>
            {BEDROOMS.map((b) => (
              <TouchableOpacity
                key={'bed_' + b}
                style={[styles.pillButton, { backgroundColor: selectedBedrooms === b ? colors.accentBlue : colors.surface, borderColor: selectedBedrooms === b ? colors.accentBlue : colors.border }]}
                onPress={() => setSelectedBedrooms(b)}
              >
                <Text style={[styles.pillText, { color: selectedBedrooms === b ? '#FFFFFF' : colors.textSecondary }]}>
                  {b === 'Tous' ? 'Ch: Toutes' : `Ch: ${b}`}
                </Text>
              </TouchableOpacity>
            ))}
            {BATHROOMS.map((b) => (
              <TouchableOpacity
                key={'bath_' + b}
                style={[styles.pillButton, { backgroundColor: selectedBathrooms === b ? colors.accentBlue : colors.surface, borderColor: selectedBathrooms === b ? colors.accentBlue : colors.border }]}
                onPress={() => setSelectedBathrooms(b)}
              >
                <Text style={[styles.pillText, { color: selectedBathrooms === b ? '#FFFFFF' : colors.textSecondary }]}>
                  {b === 'Tous' ? 'SDB: Toutes' : `SDB: ${b}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TRI */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Trier par</Text>
          <View style={styles.pillsRow}>
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.pillButton, { backgroundColor: active ? colors.accentBlue : colors.surface, borderColor: active ? colors.accentBlue : colors.border }]}
                  onPress={() => setSortBy(opt.key)}
                >
                  <Text style={[styles.pillText, { color: active ? '#FFFFFF' : colors.textSecondary, fontWeight: active ? '700' : '500' }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* RÉSULTATS */}
        <View style={styles.resultsHeaderRow}>
          <Text style={[styles.resultsCountText, { color: colors.textPrimary }]}>
            Résultats ({properties.length})
          </Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={{ color: colors.accentBlue, fontWeight: '700', fontSize: 13 }}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.accentBlue} style={{ marginVertical: 24 }} />
        ) : properties.length === 0 ? (
          <EmptyStateView
            title="Aucun bien trouvé"
            message="Modifiez vos filtres (gouvernorat, prix, surface) ou réinitialisez la recherche."
            actionLabel="Tout réinitialiser"
            onAction={handleReset}
          />
        ) : (
          <>
            {properties.map((prop) => (
              <View key={prop.id} style={styles.cardWrapper}>
                <PropertyCard property={prop} onPress={() => setSelectedProperty(prop)} />
              </View>
            ))}
            {properties.length >= limit && (
              <TouchableOpacity
                style={[styles.loadMoreBtn, { borderColor: colors.accentBlue }]}
                onPress={() => setLimit((l) => l + 20)}
              >
                <Text style={{ color: colors.accentBlue, fontWeight: '700' }}>Charger plus d’annonces</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  headerRightActions: { flexDirection: 'row', gap: 8 },
  glassCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  searchIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  clearBtn: { padding: 6 },
  segmentedControl: { flexDirection: 'row', borderRadius: 22, borderWidth: 1, padding: 4, marginBottom: 18 },
  segmentButton: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 18 },
  segmentText: { fontSize: 13 },
  sectionContainer: { marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pillButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  cityPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillText: { fontSize: 12.5 },
  rangeGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  rangeInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  resultsCountText: { fontSize: 16, fontWeight: '800' },
  cardWrapper: { marginBottom: 4 },
  loadMoreBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
});
