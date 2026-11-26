// ============================================================
// DARLINK — ARCHITECTURAL LIQUID GLASS PROPERTY CARD (React Native)
// Mirrors Flutter CartePropriete: 396px showcase, frosted BlurView
// bottom sheet, architectural fallback when photo rights unavailable.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ArrowUpRight,
  Building2,
} from 'lucide-react-native';
import { Property, formatPrice } from '../../features/properties/domain/models/property';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../localization/LocalizationContext';
import { favoritesApiService } from '../../features/favorites/services/favoritesApiService';
import { LiquidGlassView } from '../designSystem/LiquidGlass';
import { RadiusScale, TypographyScale, triggerHaptic } from '../designSystem/tokens';

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
  const cardScale = useRef(new Animated.Value(1)).current;
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
    triggerHaptic('light');
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.24, useNativeDriver: true, speed: 40 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    favoritesApiService.toggleFavorite(property.id, property);
  };

  const hasValidImage = Boolean(property.imageUrl && property.imageUrl.trim().length > 0 && !imageError);
  const isInstitutional =
    property.listingCategory === 'DEVELOPMENT_REFERENCE' ||
    Boolean(property.sourceName && !property.republicationAuthorized);

  const statusLabel = isInstitutional
    ? t('institutional_ref')
    : property.estLocation
    ? t('for_rent')
    : t('for_sale');

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPressIn={() =>
          Animated.spring(cardScale, { toValue: 0.985, useNativeDriver: true, speed: 36 }).start()
        }
        onPressOut={() =>
          Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 36 }).start()
        }
        onPress={() => {
          triggerHaptic('selection');
          onPress(property);
        }}
        style={[
          styles.cardContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowOpacity: isDark ? 0.36 : 0.06,
          },
        ]}
      >
        {hasValidImage ? (
          <Image
            source={{ uri: property.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            onError={() => setImageError(true)}
          />
        ) : (
          <View
            style={[
              styles.blueprintFallback,
              { backgroundColor: isDark ? '#14171F' : '#EFECE5' },
            ]}
          >
            <View
              style={[
                styles.emblemRing,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.78)',
                  borderColor: colors.accentChampagne,
                },
              ]}
            >
              <Building2 size={28} color={colors.accentChampagne} strokeWidth={1.6} />
            </View>
            <Text style={[TypographyScale.micro, { color: colors.accentChampagne, marginTop: 12 }]}>
              {(property.sourceName || property.type).toUpperCase()}
            </Text>
            <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, marginTop: 3 }]}>
              {property.governorate || property.city || t('tunisia')}
            </Text>
            <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2, fontSize: 11.5 }]}>
              {isInstitutional ? t('official_portal_visuals') : t('no_photo')}
            </Text>
          </View>
        )}

        {/* Top Bar: Liquid Glass Status Pill + Heart Orb */}
        <View style={styles.topRow}>
          <LiquidGlassView borderRadius={999} intensity={45} elevated={false} style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isInstitutional ? colors.accentChampagne : colors.accentGreen },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>{statusLabel}</Text>
          </LiquidGlassView>

          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? t('removed_from_favorites') : t('added_to_favorites')}
            >
              <LiquidGlassView borderRadius={20} intensity={45} elevated={false} style={styles.heartOrb}>
                <Heart
                  size={18}
                  color={isFavorite ? colors.accentRed : colors.textPrimary}
                  fill={isFavorite ? colors.accentRed : 'transparent'}
                  strokeWidth={2}
                />
              </LiquidGlassView>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Frosted Liquid Glass Sheet */}
        <LiquidGlassView borderRadius={20} intensity={isDark ? 55 : 70} elevated={false} style={styles.bottomGlass}>
          <View style={styles.dockHeader}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[TypographyScale.priceDisplay, { color: colors.textPrimary }]} numberOfLines={1}>
                {formatPrice(property.prix, Boolean(property.estLocation), Boolean(property.priceOnRequest))}
              </Text>
              <Text
                style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 14.5, marginTop: 2 }]}
                numberOfLines={1}
              >
                {property.titre}
              </Text>
            </View>

            <View
              style={[
                styles.ctaPill,
                { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' },
              ]}
            >
              <Text style={[styles.ctaText, { color: isDark ? '#1D1D1F' : '#FFFFFF' }]}>
                {t('btn_details')}
              </Text>
              <ArrowUpRight size={14} color={isDark ? '#1D1D1F' : '#FFFFFF'} />
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={13} color={colors.accentChampagne} />
            <Text style={[TypographyScale.caption, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
              {property.localisation}
            </Text>
          </View>

          <View style={styles.specsRow}>
            <View
              style={[
                styles.specPill,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(29,29,31,0.05)' },
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
                { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(29,29,31,0.05)' },
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
                { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(29,29,31,0.05)' },
              ]}
            >
              <Maximize2 size={12} color={colors.textSecondary} />
              <Text style={[styles.specText, { color: colors.textSecondary }]}>
                {property.surfaceM2 || 0} m²
              </Text>
            </View>

            {property.sourceName ? (
              <Text style={[TypographyScale.micro, { color: colors.accentChampagne, marginLeft: 'auto' }]}>
                {property.sourceName.split(' ')[0]}
              </Text>
            ) : null}
          </View>
        </LiquidGlassView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 396,
    borderRadius: RadiusScale.lg,
    borderWidth: 0.9,
    overflow: 'hidden',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 6,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  blueprintFallback: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 112,
    paddingHorizontal: 24,
  },
  emblemRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  heartOrb: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomGlass: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
  },
  specText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});
