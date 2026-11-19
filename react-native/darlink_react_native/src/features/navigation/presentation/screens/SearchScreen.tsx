// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE & FILTRES LUXE (React Native Screen 3)
// Contrôles segmented, sélecteur de prix, chambres et villes (Maquette Screen 3)
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property } from '../../../properties/domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';
import { MapScreen } from '../../../map/presentation/screens/MapScreen';

const SEGMENTS = ['Acheter', 'Louer', 'Vendu'] as const;
const PROPERTY_TYPES = ['Tous', 'Appartement', 'Villa', 'Maison'] as const;
const BEDROOMS = ['Tous', 'Studio', '1+', '2+', '3+', '4+'] as const;
const CITIES = ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Monastir', 'Sfax'] as const;

export const SearchScreen: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('Acheter');
  const [selectedType, setSelectedType] = useState<string>('Tous');
  const [priceMode, setPriceMode] = useState<'total' | 'monthly'>('total');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('Tous');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const { isDark, colors } = useTheme();

  useEffect(() => {
    fetchFilteredProperties();
  }, [selectedSegment, selectedType, selectedCity, selectedBedrooms]);

  const fetchFilteredProperties = async () => {
    let minBeds: number | undefined;
    if (selectedBedrooms === '1+') minBeds = 1;
    if (selectedBedrooms === '2+') minBeds = 2;
    if (selectedBedrooms === '3+') minBeds = 3;
    if (selectedBedrooms === '4+') minBeds = 4;

    const list = await propertyApiService.getProperties({
      city: selectedCity || undefined,
      type: selectedType !== 'Tous' ? selectedType : undefined,
      isRental: selectedSegment === 'Louer' ? true : selectedSegment === 'Acheter' ? false : undefined,
      minBedrooms: minBeds,
    });
    setProperties(list);
  };

  const filteredProperties = properties.filter((p) => {
    if (selectedSegment === 'Louer' && !p.estLocation) return false;
    if (selectedSegment === 'Acheter' && p.estLocation) return false;
    if (selectedType !== 'Tous' && p.type.toLowerCase() !== selectedType.toLowerCase()) return false;
    if (selectedCity && !p.localisation.toLowerCase().includes(selectedCity.toLowerCase())) return false;
    if (selectedBedrooms !== 'Tous') {
      let minBeds = 1;
      if (selectedBedrooms === '2+') minBeds = 2;
      if (selectedBedrooms === '3+') minBeds = 3;
      if (selectedBedrooms === '4+') minBeds = 4;
      if (p.nombreChambres < minBeds) return false;
    }
    return true;
  });

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
    Alert.alert(
      'Filtres appliqués',
      `${filteredProperties.length} bien(s) trouvé(s) pour : ${selectedSegment} • ${selectedType} • ${selectedBedrooms} ch. ${selectedCity ? `• ${selectedCity}` : ''}`
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. BARRE SUPÉRIEURE FLOTTANTE (Screen 3) */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={[
              styles.glassCircleBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.circleIcon, { color: colors.textPrimary }]}>←</Text>
          </TouchableOpacity>

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
              activeOpacity={0.8}
            >
              <Text style={[styles.circleIcon, { color: colors.textPrimary }]}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. CONTRÔLEUR SEGMENTÉ : ACHETER / LOUER / VENDU (Screen 3) */}
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
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.08,
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
                      color: isSelected ? '#0F1015' : colors.textSecondary,
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

        {/* 3. SÉLECTION TYPE DE BIEN */}
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
                    styles.pill,
                    {
                      backgroundColor: isSelected
                        ? (isDark ? '#FFFFFF' : '#0F1015')
                        : colors.surface,
                      borderColor: isSelected ? 'transparent' : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: isSelected
                          ? (isDark ? '#0F1015' : '#FFFFFF')
                          : colors.textSecondary,
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

        {/* 4. MODE DE PRIX (PRIX TOTAL VS PAIEMENT MENSUEL) */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Mode de tarification
          </Text>
          <View style={styles.priceModeContainer}>
            <TouchableOpacity
              style={[
                styles.priceModeBtn,
                {
                  backgroundColor: priceMode === 'total'
                    ? (isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)')
                    : colors.surface,
                  borderColor: priceMode === 'total' ? AppColors.accentBlue : colors.border,
                },
              ]}
              onPress={() => setPriceMode('total')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.priceModeText,
                  {
                    color: priceMode === 'total' ? AppColors.accentBlue : colors.textSecondary,
                    fontWeight: priceMode === 'total' ? '700' : '500',
                  },
                ]}
              >
                Prix total (DT)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priceModeBtn,
                {
                  backgroundColor: priceMode === 'monthly'
                    ? (isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)')
                    : colors.surface,
                  borderColor: priceMode === 'monthly' ? AppColors.accentBlue : colors.border,
                },
              ]}
              onPress={() => setPriceMode('monthly')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.priceModeText,
                  {
                    color: priceMode === 'monthly' ? AppColors.accentBlue : colors.textSecondary,
                    fontWeight: priceMode === 'monthly' ? '700' : '500',
                  },
                ]}
              >
                Paiement mensuel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. ÉCHELLE DE BUDGET */}
        <View
          style={[
            styles.budgetCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowOpacity: isDark ? 0.25 : 0.04,
            },
          ]}
        >
          <View style={styles.budgetRangeRow}>
            <View style={styles.budgetCol}>
              <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
                Budget Minimum
              </Text>
              <Text style={[styles.budgetValue, { color: colors.textPrimary }]}>
                100 000 DT
              </Text>
            </View>
            <View style={[styles.budgetDivider, { backgroundColor: colors.border }]} />
            <View style={[styles.budgetCol, { alignItems: 'flex-end' }]}>
              <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
                Budget Maximum
              </Text>
              <Text style={[styles.budgetValue, { color: colors.textPrimary }]}>
                1 500 000 DT
              </Text>
            </View>
          </View>
        </View>

        {/* 6. SÉLECTION DU NOMBRE DE CHAMBRES (Screen 3) */}
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
                    styles.pill,
                    {
                      backgroundColor: isSelected
                        ? (isDark ? '#FFFFFF' : '#0F1015')
                        : colors.surface,
                      borderColor: isSelected ? 'transparent' : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedBedrooms(bed)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: isSelected
                          ? (isDark ? '#0F1015' : '#FFFFFF')
                          : colors.textSecondary,
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

        {/* 7. VILLES POPULAIRES EN TUNISIE */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
            Villes populaires en Tunisie
          </Text>
          <View style={styles.citiesWrap}>
            {CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.cityChip,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(37, 99, 235, 0.15)'
                        : colors.surface,
                      borderColor: isSelected ? AppColors.accentBlue : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCity(isSelected ? '' : city)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cityPin}>📍</Text>
                  <Text
                    style={[
                      styles.cityName,
                      {
                        color: isSelected ? AppColors.accentBlue : colors.textSecondary,
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

        {/* 8. RÉSULTATS DYNAMIQUES DE RECHERCHE (V5-V8) */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>
            Biens trouvés ({filteredProperties.length})
          </Text>
          {(selectedCity !== '' || selectedType !== 'Tous' || selectedBedrooms !== 'Tous' || selectedSegment !== 'Acheter') && (
            <TouchableOpacity
              onPress={() => {
                setSelectedCity('');
                setSelectedType('Tous');
                setSelectedBedrooms('Tous');
                setSelectedSegment('Acheter');
              }}
            >
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredProperties.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Aucun bien ne correspond à ces critères
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Essayez de modifier votre recherche ou de réinitialiser les filtres.
            </Text>
          </View>
        ) : (
          filteredProperties.map((p) => (
            <PropertyCard
              key={p.id || p.titre}
              property={p}
              onPress={() => setSelectedProperty(p)}
            />
          ))
        )}

        <View style={{ height: 100 }} />

        {/* 9. BOUTONS D'ACTION FLOTTANTS EN BAS DE SCREEN 3 */}
        <View style={styles.bottomDock}>
          <TouchableOpacity
            style={[
              styles.contactAgentBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              Alert.alert('Agent dédié', 'Contact avec Sonia Ben Salem (+216 71 888 999).')
            }
            activeOpacity={0.85}
          >
            <Text style={[styles.contactAgentText, { color: colors.textPrimary }]}>
              Contacter l'agent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.applyFilterBtn,
              {
                backgroundColor: isDark ? '#FFFFFF' : '#0F1015',
              },
            ]}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.applyFilterText,
                { color: isDark ? '#0F1015' : '#FFFFFF' },
              ]}
            >
              Appliquer les filtres
            </Text>
          </TouchableOpacity>
        </View>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  glassCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  circleIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    marginBottom: 22,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
  priceModeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priceModeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  priceModeText: {
    fontSize: 13,
  },
  budgetCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  budgetRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetCol: {
    flex: 1,
  },
  budgetDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
  },
  budgetLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  citiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  cityPin: {
    fontSize: 12,
    marginRight: 4,
  },
  cityName: {
    fontSize: 12.5,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  resetText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  bottomDock: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  contactAgentBtn: {
    flex: 4,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  contactAgentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  applyFilterBtn: {
    flex: 5,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFilterText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
