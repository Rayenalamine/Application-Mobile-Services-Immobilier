// ============================================================
// DARLINK — CARTE DE PROPRIÉTÉ LUXE GLASSMORPHISM (React Native)
// Parité exacte avec la maquette Screen 1 et le composant Flutter
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppColors } from '../constants/colors';
import { Property, formatPrice } from '../../features/properties/domain/models/property';

interface PropertyCardProps {
  readonly property: Property;
  readonly onPress: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(property.isFavorite ?? false);

  return (
    <View style={styles.cardContainer}>
      {/* 1. Image principale plein format */}
      <Image
        source={{ uri: property.imageUrl }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* 2. Badge supérieur gauche : Statut (Point vert lumineux + À Vendre) */}
      <View style={styles.statusPill}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>
          {property.estLocation ? 'À Louer' : 'À Vendre'}
        </Text>
      </View>

      {/* 3. Bouton supérieur droit : Bouton de favori verre dépoli */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => setIsFavorite(!isFavorite)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Ajouter aux favoris"
      >
        <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
          {isFavorite ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>

      {/* 4. Dock inférieur verre dépoli translucide (Glassmorphism) */}
      <View style={styles.glassDock}>
        {/* Ligne 1 : Prix + Bouton d'action "Voir détails" */}
        <View style={styles.dockHeader}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {property.estLocation
                ? `${formatPrice(property.prix)}/mo`
                : formatPrice(property.prix)}
            </Text>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {property.titre}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onPress(property)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Voir détails"
          >
            <Text style={styles.actionButtonText}>Voir détails</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Ligne 2 : Localisation */}
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {property.localisation}
          </Text>
        </View>

        {/* Ligne 3 : Pilules de caractéristiques (Chambres, Salles de bain, Surface) */}
        <View style={styles.specsRow}>
          <View style={styles.specPill}>
            <Text style={styles.specIcon}>🛏️</Text>
            <Text style={styles.specText}>{property.nombreChambres} Bd</Text>
          </View>

          <View style={styles.specPill}>
            <Text style={styles.specIcon}>🚿</Text>
            <Text style={styles.specText}>{property.nombreSallesDeBain} Ba</Text>
          </View>

          <View style={styles.specPill}>
            <Text style={styles.specIcon}>📐</Text>
            <Text style={styles.specText}>{property.surfaceM2 ?? 120} m²</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: AppColors.darkSurface,
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: AppColors.placeholder,
  },
  statusPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 21, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.accentGreen,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 16, 21, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  favoriteIcon: {
    fontSize: 16,
  },
  favoriteIconActive: {
    color: AppColors.accentRed,
  },
  glassDock: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(19, 20, 28, 0.88)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  dockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
    marginRight: 10,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  propertyTitle: {
    color: '#E0E0E6',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#0F1015',
    fontWeight: '700',
    fontSize: 13,
    marginRight: 4,
  },
  actionArrow: {
    color: '#0F1015',
    fontSize: 14,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationPin: {
    fontSize: 13,
    marginRight: 4,
  },
  locationText: {
    color: AppColors.darkTextSecondary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  specIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  specText: {
    color: '#CAC4D0',
    fontSize: 12,
    fontWeight: '600',
  },
});
