// ============================================================
// DARLINK — ÉCRAN D'ACCUEIL LUXE MODERNE (React Native Screen 1)
// Design transparent glassmorphique conforme à la maquette de référence
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';
import { mockProperties } from '../../data/mockProperties';
import { Property } from '../../domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { PropertyDetailsScreen } from './PropertyDetailsScreen';

const FILTER_PILLS = [
  'Tous',
  'Prix',
  'Appartement',
  'Villa',
  'Maison',
  'Chambres',
] as const;

export const HomeScreen: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Tous');

  // Filtrage selon le filtre actif
  const filteredProperties = mockProperties.filter((p) => {
    if (activeFilter === 'Tous' || activeFilter === 'Prix' || activeFilter === 'Chambres') {
      return true;
    }
    return p.type.toLowerCase() === activeFilter.toLowerCase();
  });

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. EN-TÊTE UTILISATEUR & STATUT DU REPO OWNER */}
        <View style={styles.headerRow}>
          <View style={styles.userInfo}>
            <View style={styles.avatarBorder}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.greetingText}>Bonjour ! 👋</Text>
              <Text style={styles.userNameText}>Rayen Lamine</Text>
            </View>
          </View>

          {/* Bouton Carte / Map */}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() =>
              Alert.alert('Carte interactive', 'Affichage de la carte prévu en phase V8.')
            }
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir la carte"
          >
            <Text style={styles.mapIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>

        {/* 2. BARRE DE RECHERCHE FLOTTANTE TYPE PILULE */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Tunis, Sousse, Djerba, Hammamet...
          </Text>
          <View style={styles.tuneButton}>
            <Text style={styles.tuneIcon}>⚙️</Text>
          </View>
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
                  isSelected && styles.filterPillSelected,
                ]}
                onPress={() => setActiveFilter(filtre)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                >
                  {filtre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. BANNIÈRE DISCRÈTE & SECTION TITRE */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerTitle}>Services Immobilier</Text>
          <Text style={styles.bannerSubtitle}>
            Trouvez le bien immobilier de vos rêves en Tunisie.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nos biens immobiliers</Text>
          <Text style={styles.sectionCount}>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    backgroundColor: AppColors.darkSurface,
  },
  userTextContainer: {
    marginLeft: 12,
  },
  greetingText: {
    color: AppColors.darkTextSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  mapButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppColors.darkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
  },
  mapIcon: {
    fontSize: 16,
  },
  searchBar: {
    height: 52,
    borderRadius: 26,
    backgroundColor: AppColors.darkSurface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: AppColors.darkTextTertiary,
    fontSize: 13,
  },
  tuneButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: AppColors.darkSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterText: {
    color: AppColors.darkTextSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextSelected: {
    color: '#0F1015',
    fontWeight: '700',
  },
  bannerContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    marginBottom: 18,
  },
  bannerTitle: {
    color: '#60A5FA',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: AppColors.darkTextSecondary,
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
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    color: AppColors.darkTextSecondary,
    fontWeight: '500',
  },
});
