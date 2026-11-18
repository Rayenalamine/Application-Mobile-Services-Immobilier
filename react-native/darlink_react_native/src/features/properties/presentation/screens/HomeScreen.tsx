// ============================================================
// DARLINK — ÉCRAN D'ACCUEIL REACT NATIVE (V2-T04 - Membre 2)
// Parité complète avec EcranAccueil Flutter
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
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';
import { AppSpacing } from '../../../../core/constants/spacing';
import { mockProperties } from '../../data/mockProperties';
import { Property, formatPrice } from '../../domain/models/property';

export const HomeScreen: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  if (selectedProperty) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Détails du bien</Text>
        </View>
        <ScrollView style={styles.container} contentContainerStyle={styles.detailsContent}>
          <Image
            source={{ uri: selectedProperty.imageUrl }}
            style={styles.detailsImage}
            resizeMode="cover"
          />
          <View style={styles.detailsBody}>
            <View style={styles.detailsBadgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{selectedProperty.type}</Text>
              </View>
              <Text style={styles.detailsPrice}>{formatPrice(selectedProperty.prix)}</Text>
            </View>

            <Text style={styles.detailsTitle}>{selectedProperty.titre}</Text>
            <Text style={styles.detailsLocation}>📍 {selectedProperty.localisation}</Text>

            <View style={styles.specsRow}>
              <View style={styles.specBox}>
                <Text style={styles.specNumber}>{selectedProperty.nombreChambres}</Text>
                <Text style={styles.specLabel}>Chambres</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specNumber}>{selectedProperty.nombreSallesDeBain}</Text>
                <Text style={styles.specLabel}>Salles de bain</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Description</Text>
            <Text style={styles.descriptionText}>{selectedProperty.description}</Text>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedProperty(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>← Retour à la liste</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services Immobilier</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Bannière de bienvenue */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>Trouvez votre futur logement en Tunisie</Text>
          <Text style={styles.welcomeSubtitle}>
            Découvrez notre sélection exclusive d'appartements, villas et maisons traditionnelles.
          </Text>
        </View>

        {/* Titre de section */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Nos biens immobiliers</Text>
          <Text style={styles.sectionSubtitle}>{mockProperties.length} annonces disponibles</Text>
        </View>

        {/* Liste des cartes */}
        {mockProperties.map((prop) => (
          <View key={prop.id ?? prop.titre} style={styles.card}>
            <Image source={{ uri: prop.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.badgeOverlay}>
              <Text style={styles.badgeText}>{prop.type}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {prop.titre}
              </Text>
              <Text style={styles.cardLocation} numberOfLines={1}>
                📍 {prop.localisation}
              </Text>

              <View style={styles.cardFeatures}>
                <Text style={styles.featureText}>🛏️ {prop.nombreChambres} ch.</Text>
                <Text style={styles.featureText}>🚿 {prop.nombreSallesDeBain} sdb.</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{formatPrice(prop.prix)}</Text>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => setSelectedProperty(prop)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.detailsButtonText}>Voir détails</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    height: 56,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    paddingHorizontal: AppSpacing.l,
  },
  welcomeBanner: {
    backgroundColor: AppColors.primary,
    borderRadius: AppSpacing.cardRadius,
    padding: AppSpacing.l,
    marginTop: AppSpacing.m,
    marginBottom: AppSpacing.m,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: AppSpacing.xs,
  },
  welcomeSubtitle: {
    color: '#E3F2FD',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitleContainer: {
    marginVertical: AppSpacing.s,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.cardRadius,
    marginBottom: AppSpacing.l,
    overflow: 'hidden',
    borderColor: AppColors.border,
    borderWidth: 0.8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 190,
    backgroundColor: AppColors.placeholder,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: AppSpacing.badgeRadius,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: AppSpacing.l,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  cardLocation: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  cardFeatures: {
    flexDirection: 'row',
    marginTop: AppSpacing.s,
    gap: 16,
  },
  featureText: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: AppSpacing.m,
    paddingTop: AppSpacing.s,
    borderTopWidth: 0.8,
    borderTopColor: AppColors.border,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.primary,
  },
  detailsButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsContent: {
    paddingBottom: 32,
  },
  detailsImage: {
    width: '100%',
    height: 260,
    backgroundColor: AppColors.placeholder,
  },
  detailsBody: {
    padding: AppSpacing.l,
    backgroundColor: AppColors.surface,
  },
  detailsBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppSpacing.m,
  },
  badge: {
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: AppSpacing.badgeRadius,
  },
  detailsPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.primary,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 6,
  },
  detailsLocation: {
    fontSize: 15,
    color: AppColors.textSecondary,
    marginBottom: AppSpacing.l,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: AppSpacing.l,
  },
  specBox: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: AppSpacing.m,
    borderRadius: 8,
    alignItems: 'center',
  },
  specNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.primary,
  },
  specLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: AppColors.textSecondary,
    marginBottom: AppSpacing.xl,
  },
  backButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
