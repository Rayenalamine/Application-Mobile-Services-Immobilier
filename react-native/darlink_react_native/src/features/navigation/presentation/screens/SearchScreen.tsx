// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE & FILTRES LUXE (React Native Screen 3)
// Contrôles segmented, sélecteur de prix, chambres et villes (Maquette Screen 3)
// ============================================================

import React, { useState } from 'react';
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

  const handleReset = () => {
    setSelectedSegment('Acheter');
    setSelectedType('Tous');
    setPriceMode('total');
    setSelectedBedrooms('Tous');
    setSelectedCity('');
  };

  const handleApply = () => {
    Alert.alert(
      'Filtres appliqués',
      `Recherche pour : ${selectedSegment} • ${selectedType} • ${selectedBedrooms} ch. ${selectedCity ? `• ${selectedCity}` : ''}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. BARRE SUPÉRIEURE FLOTTANTE (Screen 3) */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.glassCircleBtn} activeOpacity={0.8}>
            <Text style={styles.circleIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Recherche de biens</Text>

          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.glassCircleBtn} activeOpacity={0.8}>
              <Text style={styles.circleIcon}>🗺️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.glassCircleBtn} activeOpacity={0.8}>
              <Text style={styles.circleIcon}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. CONTRÔLEUR SEGMENTÉ : ACHETER / LOUER / VENDU (Screen 3) */}
        <View style={styles.segmentedControl}>
          {SEGMENTS.map((seg) => {
            const isSelected = selectedSegment === seg;
            return (
              <TouchableOpacity
                key={seg}
                style={[
                  styles.segmentButton,
                  isSelected && styles.segmentButtonActive,
                ]}
                onPress={() => setSelectedSegment(seg)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isSelected && styles.segmentTextActive,
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
          <Text style={styles.sectionLabel}>Type de bien</Text>
          <View style={styles.pillsRow}>
            {PROPERTY_TYPES.map((type) => {
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.pillText, isSelected && styles.pillTextSelected]}
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
          <Text style={styles.sectionLabel}>Mode de tarification</Text>
          <View style={styles.priceModeContainer}>
            <TouchableOpacity
              style={[
                styles.priceModeBtn,
                priceMode === 'total' && styles.priceModeBtnActive,
              ]}
              onPress={() => setPriceMode('total')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.priceModeText,
                  priceMode === 'total' && styles.priceModeTextActive,
                ]}
              >
                Prix total (DT)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.priceModeBtn,
                priceMode === 'monthly' && styles.priceModeBtnActive,
              ]}
              onPress={() => setPriceMode('monthly')}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.priceModeText,
                  priceMode === 'monthly' && styles.priceModeTextActive,
                ]}
              >
                Paiement mensuel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. ÉCHELLE DE BUDGET */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetRangeRow}>
            <View style={styles.budgetCol}>
              <Text style={styles.budgetLabel}>Budget Minimum</Text>
              <Text style={styles.budgetValue}>100 000 DT</Text>
            </View>
            <Text style={styles.budgetSeparator}>à</Text>
            <View style={styles.budgetCol}>
              <Text style={styles.budgetLabel}>Budget Maximum</Text>
              <Text style={styles.budgetValue}>1 500 000 DT</Text>
            </View>
          </View>
        </View>

        {/* 6. SÉLECTION DU NOMBRE DE CHAMBRES (Screen 3) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Nombre de chambres</Text>
          <View style={styles.pillsRow}>
            {BEDROOMS.map((bed) => {
              const isSelected = selectedBedrooms === bed;
              return (
                <TouchableOpacity
                  key={bed}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setSelectedBedrooms(bed)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.pillText, isSelected && styles.pillTextSelected]}
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
          <Text style={styles.sectionLabel}>Villes populaires en Tunisie</Text>
          <View style={styles.pillsRow}>
            {CITIES.map((city) => {
              const isSelected = selectedCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityPill, isSelected && styles.cityPillSelected]}
                  onPress={() => setSelectedCity(isSelected ? '' : city)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.cityPillText,
                      isSelected && styles.cityPillTextSelected,
                    ]}
                  >
                    📍 {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 8. CARTE D'INFORMATION ARCHITECTURALE V5 */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <View style={styles.noticeBody}>
            <Text style={styles.noticeTitle}>
              Recherche dynamique en préparation
            </Text>
            <Text style={styles.noticeText}>
              Les filtres seront connectés à l'API Spring Boot en V5-T02.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 9. DOCK D'ACTIONS INFÉRIEUR */}
      <View style={styles.bottomDock}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>Réinitialiser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          activeOpacity={0.85}
        >
          <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.darkBackground,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  glassCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppColors.darkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
  },
  circleIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: AppColors.darkSurface,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 22,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    color: AppColors.darkTextSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#0F1015',
    fontWeight: '800',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#FFFFFF',
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
    backgroundColor: AppColors.darkSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  pillText: {
    color: AppColors.darkTextSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#0F1015',
    fontWeight: '700',
  },
  priceModeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priceModeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: AppColors.darkSurface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  priceModeBtnActive: {
    borderColor: AppColors.accentBlue,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  priceModeText: {
    color: AppColors.darkTextSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  priceModeTextActive: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  budgetCard: {
    backgroundColor: AppColors.darkSurface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
    marginBottom: 20,
  },
  budgetRangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetCol: {
    alignItems: 'center',
  },
  budgetLabel: {
    color: AppColors.darkTextTertiary,
    fontSize: 11,
    marginBottom: 4,
  },
  budgetValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  budgetSeparator: {
    color: AppColors.darkTextSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  cityPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: AppColors.darkSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cityPillSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: AppColors.accentBlue,
  },
  cityPillText: {
    color: AppColors.darkTextSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  cityPillTextSelected: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    marginTop: 8,
  },
  noticeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  noticeBody: {
    flex: 1,
  },
  noticeTitle: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  noticeText: {
    color: AppColors.darkTextSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 16, 21, 0.94)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#0F1015',
    fontSize: 14,
    fontWeight: '800',
  },
});
