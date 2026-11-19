// ============================================================
// DARLINK — ÉCRAN DE CARTOGRAPHIE INTERACTIVE & GPS (React Native V8)
// Visualisation des biens géolocalisés en Tunisie avec pins interactifs
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property, formatPrice } from '../../../properties/domain/models/property';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MapScreenProps {
  onBack: () => void;
  onSelectProperty?: (property: Property) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onBack, onSelectProperty }) => {
  const { colors, isDark } = useTheme();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedCity, setSelectedCity] = useState('Toutes');
  const [loading, setLoading] = useState(true);

  const cities = ['Toutes', 'Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Monastir'];

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const list = await propertyApiService.getMapProperties();
      if (isMounted) {
        setProperties(list);
        if (list.length > 0) {
          setSelectedProperty(list[0]);
        }
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProperties = properties.filter((p) => {
    if (selectedCity === 'Toutes') return true;
    return p.localisation.toLowerCase().includes(selectedCity.toLowerCase());
  });

  // Calcul des coordonnées relatives sur la carte stylisée de Tunisie
  const getPinOffset = (localisation: string) => {
    const loc = localisation.toLowerCase();
    if (loc.includes('tunis')) return { left: SCREEN_WIDTH * 0.44, top: SCREEN_HEIGHT * 0.22 };
    if (loc.includes('hammamet')) return { left: SCREEN_WIDTH * 0.56, top: SCREEN_HEIGHT * 0.31 };
    if (loc.includes('sousse')) return { left: SCREEN_WIDTH * 0.52, top: SCREEN_HEIGHT * 0.42 };
    if (loc.includes('monastir')) return { left: SCREEN_WIDTH * 0.62, top: SCREEN_HEIGHT * 0.46 };
    if (loc.includes('djerba')) return { left: SCREEN_WIDTH * 0.64, top: SCREEN_HEIGHT * 0.72 };
    return { left: SCREEN_WIDTH * 0.48, top: SCREEN_HEIGHT * 0.48 };
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0D13' : '#E5E9F0' }]}>
      {/* 1. CARTE STYLISÉE ET PINS GPS */}
      <View style={StyleSheet.absoluteFill}>
        {/* Lignes de quadrillage cartographiques */}
        <View style={styles.gridOverlay}>
          {[...Array(6)].map((_, i) => (
            <View
              key={`h-${i}`}
              style={[
                styles.gridLineH,
                { top: (i + 1) * (SCREEN_HEIGHT / 7), borderColor: isDark ? '#1C2030' : '#D0D7E5' },
              ]}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <View
              key={`v-${i}`}
              style={[
                styles.gridLineV,
                { left: (i + 1) * (SCREEN_WIDTH / 5), borderColor: isDark ? '#1C2030' : '#D0D7E5' },
              ]}
            />
          ))}
        </View>

        {/* Repères géographiques de Tunisie */}
        <View style={[styles.geoLabel, { left: SCREEN_WIDTH * 0.54, top: SCREEN_HEIGHT * 0.22 }]}>
          <Text style={[styles.geoText, { color: isDark ? '#3A4259' : '#94A3B8' }]}>Golfe de Tunis</Text>
        </View>
        <View style={[styles.geoLabel, { left: SCREEN_WIDTH * 0.64, top: SCREEN_HEIGHT * 0.42 }]}>
          <Text style={[styles.geoText, { color: isDark ? '#3A4259' : '#94A3B8' }]}>Sahel Tunisien</Text>
        </View>
        <View style={[styles.geoLabel, { left: SCREEN_WIDTH * 0.66, top: SCREEN_HEIGHT * 0.74 }]}>
          <Text style={[styles.geoText, { color: isDark ? '#3A4259' : '#94A3B8' }]}>Île de Djerba</Text>
        </View>

        {/* PINS INTERACTIFS */}
        {filteredProperties.map((p) => {
          const { left, top } = getPinOffset(p.localisation);
          const isSelected = selectedProperty?.id === p.id;

          return (
            <TouchableOpacity
              key={p.id || p.titre}
              activeOpacity={0.85}
              style={[
                styles.pinContainer,
                {
                  left: left - 40,
                  top: top - 20,
                  backgroundColor: isSelected ? colors.accentBlue : isDark ? '#181920' : '#FFFFFF',
                  borderColor: isSelected ? '#FFFFFF' : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  shadowColor: '#000',
                  shadowOpacity: isSelected ? 0.35 : 0.15,
                  shadowRadius: isSelected ? 10 : 4,
                  elevation: isSelected ? 8 : 3,
                },
              ]}
              onPress={() => setSelectedProperty(p)}
            >
              <View
                style={[
                  styles.pinDot,
                  { backgroundColor: isSelected ? '#FFFFFF' : colors.accentBlue },
                ]}
              />
              <Text
                style={[
                  styles.pinText,
                  { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {p.estLocation ? `${Math.round(p.prix)} DT/m` : formatPrice(p.prix)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. TOP FLOATING BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.circleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onBack}
        >
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>

        <View style={[styles.titleBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.titleText, { color: colors.textPrimary }]}>
            Carte des biens en Tunisie ({filteredProperties.length})
          </Text>
        </View>
      </View>

      {/* 3. CITY FILTER CHIPS */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {cities.map((city) => {
            const active = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityFilterChip,
                  active
                    ? { backgroundColor: isDark ? '#FFFFFF' : '#0F1015' }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => setSelectedCity(city)}
              >
                <Text
                  style={[
                    styles.cityFilterText,
                    { color: active ? (isDark ? '#0F1015' : '#FFFFFF') : colors.textSecondary },
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. PREVIEW CARD FLOATING AT BOTTOM */}
      {selectedProperty && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.previewCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => onSelectProperty && onSelectProperty(selectedProperty)}
        >
          <Image source={{ uri: selectedProperty.imageUrl }} style={styles.previewImage} />

          <View style={styles.previewContent}>
            <View style={styles.previewHeaderRow}>
              <Text style={[styles.previewPrice, { color: colors.textPrimary }]}>
                {formatPrice(selectedProperty.prix)}
              </Text>
              <View
                style={[
                  styles.badgeTag,
                  { backgroundColor: selectedProperty.estLocation ? '#2563EB20' : '#16A34A20' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: selectedProperty.estLocation ? '#2563EB' : '#16A34A' },
                  ]}
                >
                  {selectedProperty.estLocation ? 'Location' : 'Vente'}
                </Text>
              </View>
            </View>

            <Text style={[styles.previewTitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {selectedProperty.titre}
            </Text>

            <Text style={[styles.previewLocation, { color: colors.textSecondary }]} numberOfLines={1}>
              📍 {selectedProperty.localisation}
            </Text>

            <View style={styles.previewFeatures}>
              <Text style={[styles.featureText, { color: colors.textPrimary }]}>
                🛏 {selectedProperty.nombreChambres} ch.
              </Text>
              <Text style={[styles.featureDot, { color: colors.textSecondary }]}>•</Text>
              <Text style={[styles.featureText, { color: colors.textPrimary }]}>
                🚿 {selectedProperty.nombreSallesDeBain} sdb
              </Text>
              {selectedProperty.surfaceM2 && (
                <>
                  <Text style={[styles.featureDot, { color: colors.textSecondary }]}>•</Text>
                  <Text style={[styles.featureText, { color: colors.textPrimary }]}>
                    📐 {selectedProperty.surfaceM2} m²
                  </Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    borderStyle: 'dashed',
  },
  geoLabel: {
    position: 'absolute',
  },
  geoText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pinContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 5,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pinText: {
    fontSize: 11,
    fontWeight: '700',
  },
  topBar: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  backIcon: {
    fontSize: 26,
    fontWeight: '300',
    marginTop: -3,
  },
  titleBubble: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    position: 'absolute',
    top: 102,
    left: 0,
    right: 0,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cityFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  cityFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  previewContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewLocation: {
    fontSize: 11,
    marginTop: 2,
  },
  previewFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
  },
  featureDot: {
    fontSize: 10,
  },
});
