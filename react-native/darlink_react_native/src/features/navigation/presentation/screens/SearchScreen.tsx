// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE & FILTRES MULTICRITÈRES (React Native V5-T02)
// Recherche textuelle réelle, filtres dynamiques, budget & thèmes
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. BARRE SUPÉRIEURE */}
        <View style={styles.headerBar}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Recherche de biens
          </Text>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={[
                styles.glassCircleBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowMap(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.circleIcon}>🗺️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.glassCircleBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.circleIcon}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. CHAMP DE RECHERCHE TEXTUELLE RÉEL (V5) */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.searchIconContainer,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F0F2F5' },
            ]}
          >
            <Text style={styles.searchBoxIcon}>🔍</Text>
          </View>
          <TextInput
            testID="search_input"
            style={[
              styles.searchInput,
              { color: colors.textPrimary },
              Platform.OS === 'web' && ({ outlineWidth: 0, outlineStyle: 'none' } as any),
            ]}
            placeholder="Rechercher par titre, quartier, mot-clé..."
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
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
            >
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. CONTRÔLEUR SEGMENTÉ : TOUS / ACHETER / LOUER */}
        <View
          style={[
            styles.segmentedControl,
            {
              backgroundColor: isDark ? '#181920' : '#E9EBF0',
              borderColor: colors.border,
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
                    shadowOpacity: 0.3,
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
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {seg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. SÉLECTION TYPE DE BIEN */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Type de bien
          </Text>
          <View style={styles.pillsRow}>
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
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. VILLES POPULAIRES EN TUNISIE */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Villes populaires en Tunisie
          </Text>
          <View style={styles.pillsRow}>
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
                    },
                  ]}
                  onPress={() => setSelectedCity(isSelected ? '' : city)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cityPin, isSelected && { color: '#FFFFFF' }]}>📍</Text>
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
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Nombre de chambres
          </Text>
          <View style={styles.pillsRow}>
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
                    {bed}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 7. FOURCHETTE DE PRIX */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Budget (DT)
          </Text>
          <View style={styles.pillsRow}>
            {[
              { label: 'Tous prix', min: undefined, max: undefined },
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
        <View style={styles.resultsHeaderRow}>
          <Text style={[styles.resultsCountText, { color: colors.textPrimary }]}>
            Résultats correspondants ({properties.length})
          </Text>
          {(selectedCity || selectedType !== 'Tous' || selectedBedrooms !== 'Tous' || selectedSegment !== 'Tous' || searchQuery || minPrice !== undefined) && (
            <TouchableOpacity onPress={handleReset}>
              <Text style={{ color: colors.accentBlue, fontWeight: '700', fontSize: 13 }}>
                Réinitialiser
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {properties.length === 0 ? (
          <View
            style={[
              styles.emptyStateBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Aucun bien ne correspond à ces critères
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Essayez de réinitialiser la recherche ou de sélectionner une autre ville.
            </Text>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.accentBlue }]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Tout réinitialiser</Text>
            </TouchableOpacity>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* DOCK FLOTTANT EN BAS */}
      <View
        style={[
          styles.bottomDock,
          {
            backgroundColor: isDark ? 'rgba(15, 16, 21, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.dockOutlinedBtn, { borderColor: colors.border }]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={[styles.dockOutlinedText, { color: colors.textPrimary }]}>
            Réinitialiser
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dockFilledBtn, { backgroundColor: colors.accentBlue }]}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <Text style={styles.dockFilledText}>Appliquer les filtres</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 116,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
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
  circleIcon: {
    fontSize: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
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
  searchBoxIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  clearBtn: {
    padding: 6,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
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
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityPin: {
    fontSize: 12,
  },
  pillText: {
    fontSize: 13,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultsCountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyStateBox: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  bottomDock: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dockOutlinedBtn: {
    flex: 4,
    paddingVertical: 14,
    borderRadius: 16,
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
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockFilledText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
