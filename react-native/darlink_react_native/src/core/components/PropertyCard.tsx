// ============================================================
// DARLINK — CARTE DE PROPRIÉTÉ LUXE GLASSMORPHISM (React Native)
// Design épuré, zéro emoji, icônes Lucide, attribution & repli photo sobre.
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ArrowRight,
  Building2,
} from 'lucide-react-native';
import { AppColors } from '../constants/colors';
import { Property, formatPrice } from '../../features/properties/domain/models/property';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../localization/LocalizationContext';
import { favoritesApiService } from '../../features/favorites/services/favoritesApiService';

interface PropertyCardProps {
  readonly property: Property;
  readonly onPress: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    property.id ? favoritesApiService.isFavorite(property.id) : property.isFavorite ?? false
  );
  const [imageError, setImageError] = useState(false);
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();

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

  const hasValidImage = Boolean(property.imageUrl && property.imageUrl.trim().length > 0 && !imageError);

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
      {hasValidImage ? (
        <Image
          source={{ uri: property.imageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            styles.placeholderHero,
            { backgroundColor: isDark ? '#181B24' : '#EEF2F7' },
          ]}
        >
          <Building2 size={44} color={colors.accentBlue} strokeWidth={1.6} />
          <Text style={[styles.placeholderLabel, { color: colors.textSecondary }]}>
            {property.sourceName ? `Référence officielle • ${property.sourceName}` : t('no_photo')}
          </Text>
        </View>
      )}

      {/* Badge supérieur gauche : Type transaction & source */}
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: isDark ? 'rgba(15, 16, 21, 0.80)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        <View style={styles.statusDot} />
        <Text style={[styles.statusText, { color: isDark ? '#FFFFFF' : '#0F1015' }]}>
          {property.estLocation ? t('for_rent') : t('for_sale')}
        </Text>
      </View>

      {/* Bouton favori */}
      <TouchableOpacity
        style={[
          styles.favoriteButton,
          {
            backgroundColor: isDark ? 'rgba(15, 16, 21, 0.75)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
        onPress={handleToggleFavorite}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? t('removed_from_favorites') : t('added_to_favorites')}
      >
        <Heart
          size={18}
          color={isFavorite ? AppColors.accentRed : isDark ? '#FFFFFF' : '#111827'}
          fill={isFavorite ? AppColors.accentRed : 'transparent'}
          strokeWidth={2}
        />
      </TouchableOpacity>

      {/* Dock inférieur */}
      <View
        style={[
          styles.glassDock,
          {
            backgroundColor: isDark ? 'rgba(19, 20, 28, 0.92)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        <View style={styles.dockHeader}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: colors.textPrimary }]} numberOfLines={1}>
              {formatPrice(property.prix, Boolean(property.estLocation), Boolean(property.priceOnRequest))}
            </Text>
            <Text style={[styles.propertyTitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {property.titre}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? '#FFFFFF' : AppColors.accentBlue },
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
            <ArrowRight size={15} color={isDark ? '#0F1015' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={13} color={colors.accentBlue} />
          <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {property.localisation}
          </Text>
        </View>

        <View style={styles.specsRow}>
          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <BedDouble size={13} color={colors.textSecondary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.nombreChambres} {t('bedrooms_short')}
            </Text>
          </View>

          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <Bath size={13} color={colors.textSecondary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.nombreSallesDeBain} {t('bathrooms_short')}
            </Text>
          </View>

          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <Maximize2 size={13} color={colors.textSecondary} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.surfaceM2 ?? 0} {t('area_unit')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 376,
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
  heroImage: { width: '100%', height: '100%', backgroundColor: '#E5E7EB' },
  placeholderHero: {
    width: '100%',
    height: '62%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  placeholderLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
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
  statusText: { fontSize: 12, fontWeight: '700' },
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
  dockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: { flex: 1, marginRight: 10 },
  priceText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  propertyTitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  actionButtonText: { fontWeight: '700', fontSize: 13 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  locationText: { fontSize: 13, fontWeight: '500', flex: 1 },
  specsRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  specText: { fontSize: 12, fontWeight: '600' },
});
