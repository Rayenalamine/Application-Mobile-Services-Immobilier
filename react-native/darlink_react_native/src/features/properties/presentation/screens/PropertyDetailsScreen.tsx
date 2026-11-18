// ============================================================
// DARLINK — ÉCRAN DE DÉTAILS DU BIEN LUXE (React Native Screen 2)
// Parité complète avec la maquette Screen 2 et Flutter EcranDetails
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
import { Property, formatPrice } from '../../domain/models/property';

interface PropertyDetailsScreenProps {
  readonly property: Property;
  readonly onBack: () => void;
}

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  property,
  onBack,
}) => {
  const [displayedImage, setDisplayedImage] = useState<string>(property.imageUrl);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(property.isFavorite ?? false);

  const allImages = [property.imageUrl, ...(property.imagesGalerie ?? [])];

  const handleSelectImage = (img: string, idx: number) => {
    setDisplayedImage(img);
    setImageIndex(idx);
  };

  const handleScheduleTour = () => {
    Alert.alert(
      'Visite planifiée',
      'Votre demande de visite a bien été enregistrée pour ce bien.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HERO IMAGE IMMERSIVE AVEC ARRONDIS INFÉRIEURS */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: displayedImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Bouton 360 / Visite virtuelle en bas à gauche */}
          <View style={styles.badge360}>
            <Text style={styles.badge360Icon}>▶</Text>
          </View>

          {/* Compteur d'images en bas à droite (ex: 1/4) */}
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>
              📷 {imageIndex + 1}/{allImages.length}
            </Text>
          </View>
        </View>

        {/* 2. BARRE D'ACTION SUPÉRIEURE FLOTTANTE */}
        <View style={styles.topActionsBar}>
          <TouchableOpacity
            style={styles.glassCircleBtn}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retour à la liste"
          >
            <Text style={styles.circleBtnIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={styles.glassCircleBtn}
              onPress={() => setIsFavorite(!isFavorite)}
              activeOpacity={0.8}
            >
              <Text style={styles.circleBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.glassCircleBtn}
              onPress={() =>
                Alert.alert('Partager', 'Lien de l\'annonce copié dans le presse-papier.')
              }
              activeOpacity={0.8}
            >
              <Text style={styles.circleBtnIcon}>📤</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.glassCircleBtn} activeOpacity={0.8}>
              <Text style={styles.circleBtnIcon}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. BANDE HORIZONTALE DES MINIATURES DE PIÈCES */}
        {allImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailStrip}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {allImages.map((img, idx) => {
              const isSelected = imageIndex === idx;
              return (
                <TouchableOpacity
                  key={img + idx}
                  style={[
                    styles.thumbnailItem,
                    isSelected && styles.thumbnailItemSelected,
                  ]}
                  onPress={() => handleSelectImage(img, idx)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* 4. STATUT & TAG D'ESTIMATION MENSUELLE */}
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>
              {property.estLocation ? 'À Louer' : 'À Vendre'}
            </Text>
          </View>

          <View style={styles.estimatedBadge}>
            <Text style={styles.estimatedBadgeText}>
              {property.estLocation ? 'Bail 1 an min' : 'Estimation dispo'}
            </Text>
          </View>
        </View>

        {/* 5. PRIX & TITRE MAJEUR */}
        <View style={styles.titleSection}>
          <View style={styles.priceRow}>
            <Text style={styles.hugePrice}>{formatPrice(property.prix)}</Text>
            <Text style={styles.priceSubtext}>
              {property.estLocation ? '/mois' : `Est. ${formatPrice(Math.round(property.prix / 250))}/mo`}
            </Text>
          </View>
          <Text style={styles.mainTitle}>{property.titre}</Text>
          <Text style={styles.mainAddress}>📍 {property.localisation}</Text>
        </View>

        {/* 6. TROIS GRANDES CARTES DE CARACTÉRISTIQUES */}
        <View style={styles.specsGrid}>
          <View style={styles.specBox}>
            <Text style={styles.specBoxIcon}>🛏️</Text>
            <Text style={styles.specBoxValue}>{property.nombreChambres} Bed</Text>
            <Text style={styles.specBoxLabel}>Chambres</Text>
          </View>

          <View style={styles.specBox}>
            <Text style={styles.specBoxIcon}>🚿</Text>
            <Text style={styles.specBoxValue}>{property.nombreSallesDeBain} Bath</Text>
            <Text style={styles.specBoxLabel}>Salles de bain</Text>
          </View>

          <View style={styles.specBox}>
            <Text style={styles.specBoxIcon}>📐</Text>
            <Text style={styles.specBoxValue}>{property.surfaceM2 ?? 145} m²</Text>
            <Text style={styles.specBoxLabel}>Surface</Text>
          </View>
        </View>

        {/* 7. CARTE SPÉCIFICATIONS IMMOBILIÈRES */}
        <View style={styles.specificationsCard}>
          <View style={styles.specItem}>
            <Text style={styles.specItemIcon}>🏠</Text>
            <View>
              <Text style={styles.specItemLabel}>Type de bien</Text>
              <Text style={styles.specItemValue}>{property.type}</Text>
            </View>
          </View>

          <View style={styles.specDivider} />

          <View style={styles.specItem}>
            <Text style={styles.specItemIcon}>🛡️</Text>
            <View>
              <Text style={styles.specItemLabel}>Année / Standing</Text>
              <Text style={styles.specItemValue}>
                {property.anneeConstruction ?? 2021} • {property.standing ?? 'Haut Standing'}
              </Text>
            </View>
          </View>
        </View>

        {/* 8. DESCRIPTION */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionBody}>{property.description}</Text>
        </View>
      </ScrollView>

      {/* 9. DOCK FLOTTANT INFÉRIEUR (CTA) */}
      <View style={styles.bottomDock}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Retour à la liste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleScheduleTour}
          activeOpacity={0.85}
        >
          <Text style={styles.scheduleButtonText}>Planifier une visite</Text>
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
    paddingBottom: 110,
  },
  heroContainer: {
    height: 380,
    width: '100%',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: AppColors.darkSurface,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badge360: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(24, 25, 32, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badge360Icon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  photoCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(24, 25, 32, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  photoCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  topActionsBar: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  glassCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 16, 21, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circleBtnIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  thumbnailStrip: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  thumbnailContainer: {
    gap: 12,
  },
  thumbnailItem: {
    width: 88,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  thumbnailItemSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.accentGreen,
    marginRight: 6,
  },
  statusBadgeText: {
    color: AppColors.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  estimatedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  estimatedBadgeText: {
    color: AppColors.darkTextSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hugePrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  priceSubtext: {
    fontSize: 14,
    color: AppColors.darkTextSecondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  mainAddress: {
    fontSize: 14,
    color: AppColors.darkTextSecondary,
    marginTop: 4,
  },
  specsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  specBox: {
    flex: 1,
    backgroundColor: AppColors.darkSurface,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
  },
  specBoxIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  specBoxValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  specBoxLabel: {
    fontSize: 11,
    color: AppColors.darkTextSecondary,
    marginTop: 2,
  },
  specificationsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: AppColors.darkSurface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
    alignItems: 'center',
  },
  specItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  specItemIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  specItemLabel: {
    fontSize: 11,
    color: AppColors.darkTextSecondary,
  },
  specItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  specDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 12,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  descriptionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: AppColors.darkTextSecondary,
  },
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 16, 21, 0.92)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#0F1015',
    fontSize: 14,
    fontWeight: '800',
  },
});
