// ============================================================
// DARLINK — CARTE DE PROPRIÉTÉ LUXE GLASSMORPHISM (React Native)
// Adaptatif Clair / Sombre, parité exacte avec le composant Flutter
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppColors } from '../constants/colors';
import { Property } from '../../features/properties/domain/models/property';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../localization/LocalizationContext';
import { favoritesApiService } from '../../features/favorites/services/favoritesApiService';

interface PropertyCardProps {
  readonly property: Property;
  readonly onPress: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    property.id ? favoritesApiService.isFavorite(property.id) : (property.isFavorite ?? false)
  );
  const { isDark, colors } = useTheme();
  const { t, formatPrice } = useTranslation();

  useEffect(() => {
    const propId = property.id;
    if (!propId) return;
    setIsFavorite(favoritesApiService.isFavorite(propId));
    const unsubscribe = favoritesApiService.addListener(() => {
      setIsFavorite(favoritesApiService.isFavorite(propId));
    });
    return unsubscribe;
  }, [property.id]);

  const handleToggleFavorite = () => {
    if (!property.id) return;
    favoritesApiService.toggleFavorite(property.id, property);
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowOpacity: isDark ? 0.35 : 0.06,
        },
      ]}
    >
      {/* 1. Image principale plein format */}
      <Image
        source={{ uri: property.imageUrl }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* 2. Badge supérieur gauche : Statut (Point vert lumineux + À Vendre) */}
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: isDark ? 'rgba(15, 16, 21, 0.75)' : 'rgba(255, 255, 255, 0.90)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        <View style={styles.statusDot} />
        <Text style={[styles.statusText, { color: isDark ? '#FFFFFF' : '#0F1015' }]}>
          {property.estLocation ? t('for_rent') : t('for_sale')}
        </Text>
      </View>

      {/* 3. Bouton supérieur droit : Bouton de favori verre dépoli */}
      <TouchableOpacity
        style={[
          styles.favoriteButton,
          {
            backgroundColor: isDark ? 'rgba(15, 16, 21, 0.65)' : 'rgba(255, 255, 255, 0.90)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
        onPress={handleToggleFavorite}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? t('removed_from_favorites') : t('added_to_favorites')}
      >
        <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
          {isFavorite ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>

      {/* 4. Dock inférieur verre dépoli translucide (Glassmorphism) */}
      <View
        style={[
          styles.glassDock,
          {
            backgroundColor: isDark ? 'rgba(19, 20, 28, 0.88)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        {/* Ligne 1 : Prix + Bouton d'action "Voir détails" */}
        <View style={styles.dockHeader}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: colors.textPrimary }]}>
              {property.estLocation
                ? `${formatPrice(property.prix)} ${t('per_month')}`
                : formatPrice(property.prix)}
            </Text>
            <Text style={[styles.propertyTitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {property.titre}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? '#FFFFFF' : AppColors.accentBlue,
              },
            ]}
            onPress={() => onPress(property)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('btn_details')}
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: isDark ? '#0F1015' : '#FFFFFF' },
              ]}
            >
              {t('btn_details')}
            </Text>
            <Text
              style={[
                styles.actionArrow,
                { color: isDark ? '#0F1015' : '#FFFFFF' },
              ]}
            >
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ligne 2 : Localisation */}
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {property.localisation}
          </Text>
        </View>

        {/* Ligne 3 : Pilules de caractéristiques (Chambres, Salles de bain, Surface) */}
        <View style={styles.specsRow}>
          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <Text style={styles.specIcon}>🛏️</Text>
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.nombreChambres} {t('bedrooms_short')}
            </Text>
          </View>

          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <Text style={styles.specIcon}>🚿</Text>
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.nombreSallesDeBain} {t('bathrooms_short')}
            </Text>
          </View>

          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <Text style={styles.specIcon}>📐</Text>
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.surfaceM2 ?? 120} {t('area_unit')}
            </Text>
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
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  statusPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.accentGreen,
    marginRight: 6,
  },
  statusText: {
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
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
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  actionButtonText: {
    fontWeight: '700',
    fontSize: 13,
    marginRight: 4,
  },
  actionArrow: {
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  specIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
