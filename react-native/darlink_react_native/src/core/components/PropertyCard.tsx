// ============================================================
// DARLINK — CARTE DE PROPRIÉTÉ MODERNE (React Native)
// Icônes vectorielles Lucide, adaptatif Clair / Sombre & RTL
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react-native';
import { AppColors } from '../constants/colors';
import { AppShadows } from '../constants/spacing';
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
  const { t, formatPrice, isRTL } = useTranslation();
  const heartScale = useRef(new Animated.Value(1)).current;

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
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.25,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 160,
        friction: 12,
      }),
    ]).start();
    favoritesApiService.toggleFavorite(property.id, property);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => onPress(property)}
      style={[
        styles.cardContainer,
        AppShadows.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowOpacity: isDark ? 0.35 : 0.08,
        },
      ]}
    >
      {/* 1. Image principale plein format */}
      <Image
        source={{ uri: property.imageUrl }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* 2. Badge supérieur : Statut À vendre / À louer */}
      <View
        style={[
          styles.statusPill,
          isRTL ? { right: 14, left: undefined } : { left: 14 },
          {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : colors.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: property.estLocation ? colors.accentBlueSecondary : colors.accentGreen,
              marginRight: isRTL ? 0 : 6,
              marginLeft: isRTL ? 6 : 0,
            },
          ]}
        />
        <Text style={[styles.statusText, { color: colors.textPrimary }]}>
          {property.estLocation ? t('for_rent') : t('for_sale')}
        </Text>
      </View>

      {/* 3. Bouton favori avec icône Heart vectorielle */}
      <TouchableOpacity
        style={[
          styles.favoriteButton,
          isRTL ? { left: 14, right: undefined } : { right: 14 },
          {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : colors.border,
          },
        ]}
        onPress={handleToggleFavorite}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? t('removed_from_favorites') : t('added_to_favorites')}
      >
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Heart
            size={19}
            color={isFavorite ? AppColors.accentRed : colors.textSecondary}
            fill={isFavorite ? AppColors.accentRed : 'transparent'}
            strokeWidth={2}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* 4. Dock inférieur d'informations */}
      <View
        style={[
          styles.glassDock,
          {
            backgroundColor: isDark ? 'rgba(21, 30, 50, 0.94)' : 'rgba(255, 255, 255, 0.97)',
            borderColor: isDark ? 'rgba(148, 163, 184, 0.22)' : colors.border,
          },
        ]}
      >
        {/* Ligne 1 : Prix + Bouton d'action "Voir détails" */}
        <View
          style={[
            styles.dockHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View
            style={[
              styles.priceContainer,
              isRTL ? { marginLeft: 10, marginRight: 0, alignItems: 'flex-end' } : { marginRight: 10 },
            ]}
          >
            <Text style={[styles.priceText, { color: colors.textPrimary }]}>
              {property.estLocation
                ? `${formatPrice(property.prix)} ${t('per_month')}`
                : formatPrice(property.prix)}
            </Text>
            <Text
              style={[
                styles.propertyTitle,
                { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
              ]}
              numberOfLines={1}
            >
              {property.titre}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.accentBlue,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={() => onPress(property)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('btn_details')}
          >
            <Text style={styles.actionButtonText}>{t('btn_details')}</Text>
            {isRTL ? (
              <ArrowLeft size={14} color="#FFFFFF" strokeWidth={2.4} />
            ) : (
              <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.4} />
            )}
          </TouchableOpacity>
        </View>

        {/* Ligne 2 : Localisation */}
        <View
          style={[
            styles.locationRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <MapPin size={14} color={colors.accentBlue} strokeWidth={2} />
          <Text
            style={[
              styles.locationText,
              {
                color: colors.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
                marginLeft: isRTL ? 0 : 6,
                marginRight: isRTL ? 6 : 0,
              },
            ]}
            numberOfLines={1}
          >
            {property.localisation}
          </Text>
        </View>

        {/* Ligne 3 : Pilules de caractéristiques (Chambres, Salles de bain, Surface) */}
        <View
          style={[
            styles.specsRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.background,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <BedDouble size={13} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.nombreChambres} {t('bedrooms_short')}
            </Text>
          </View>

          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.background,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Bath size={13} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.nombreSallesDeBain} {t('bathrooms_short')}
            </Text>
          </View>

          <View
            style={[
              styles.specPill,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.background,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Maximize2 size={13} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>
              {property.surfaceM2 ?? 120} {t('area_unit')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  statusPill: {
    position: 'absolute',
    top: 14,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
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
  dockHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  locationRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  specsRow: {
    marginTop: 11,
    gap: 8,
  },
  specPill: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
