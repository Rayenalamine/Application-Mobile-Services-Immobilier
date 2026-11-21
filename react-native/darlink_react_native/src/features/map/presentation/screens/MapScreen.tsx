// ============================================================
// DARLINK — ÉCRAN DE CARTOGRAPHIE INTERACTIVE OPENSTREETMAP (React Native V8)
// Rendu réel de tuiles OpenStreetMap Slippy Map (Web Mercator)
// Géolocalisation réelle avec pins dynamiques issus de PostgreSQL
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  PanResponder,
  PanResponderGestureState,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property, formatPrice } from '../../../properties/domain/models/property';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MapScreenProps {
  onBack: () => void;
  onSelectProperty?: (property: Property) => void;
}

// ============================================================
// FORMULES DE PROJECTION WEB MERCATOR (EPSG:3857)
// ============================================================
function latToY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180.0;
  const n = Math.pow(2.0, zoom);
  const clamped = Math.max(-85.0511, Math.min(85.0511, lat));
  const radClamped = (clamped * Math.PI) / 180.0;
  return (
    ((1.0 - Math.log(Math.tan(radClamped) + 1.0 / Math.cos(radClamped)) / Math.PI) / 2.0) *
    n *
    256.0
  );
}

function lngToX(lng: number, zoom: number): number {
  const n = Math.pow(2.0, zoom);
  return ((lng + 180.0) / 360.0) * n * 256.0;
}

function xToLng(x: number, zoom: number): number {
  const n = Math.pow(2.0, zoom);
  return (x / (n * 256.0)) * 360.0 - 180.0;
}

function yToLat(y: number, zoom: number): number {
  const n = Math.pow(2.0, zoom);
  const latRad = Math.atan(Math.sinh(Math.PI * (1.0 - (2.0 * y) / (n * 256.0))));
  return (latRad * 180.0) / Math.PI;
}

const CITY_COORDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  Tunis: { lat: 36.8065, lng: 10.1815, zoom: 13 },
  'La Marsa': { lat: 36.8785, lng: 10.3247, zoom: 14 },
  Sousse: { lat: 35.8256, lng: 10.6369, zoom: 13 },
  Hammamet: { lat: 36.4, lng: 10.6167, zoom: 13 },
  Djerba: { lat: 33.8075, lng: 10.8451, zoom: 12 },
  Sfax: { lat: 34.7406, lng: 10.7603, zoom: 13 },
};

export const MapScreen: React.FC<MapScreenProps> = ({ onBack, onSelectProperty }) => {
  const { colors, isDark } = useTheme();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedCity, setSelectedCity] = useState('Toutes');
  const [loading, setLoading] = useState(true);

  // Coordonnées du centre de la carte
  const [centerLat, setCenterLat] = useState(36.8065);
  const [centerLng, setCenterLng] = useState(10.1815);
  const [zoom, setZoom] = useState(12);

  const startCoordsRef = useRef({ lat: 36.8065, lng: 10.1815 });

  const cities = ['Toutes', 'Tunis', 'La Marsa', 'Sousse', 'Hammamet', 'Djerba', 'Sfax'];

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

  // Gestionnaire de glisser tactile (PanResponder)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startCoordsRef.current = { lat: centerLat, lng: centerLng };
      },
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        const currentCenterX = lngToX(startCoordsRef.current.lng, zoom);
        const currentCenterY = latToY(startCoordsRef.current.lat, zoom);
        const newCenterX = currentCenterX - gestureState.dx;
        const newCenterY = currentCenterY - gestureState.dy;

        setCenterLng(xToLng(newCenterX, zoom));
        setCenterLat(yToLat(newCenterY, zoom));
      },
    })
  ).current;

  // Calcul des tuiles visibles
  const viewW = SCREEN_WIDTH;
  const viewH = SCREEN_HEIGHT;
  const centerX = lngToX(centerLng, zoom);
  const centerY = latToY(centerLat, zoom);
  const viewLeft = centerX - viewW / 2;
  const viewTop = centerY - viewH / 2;

  const minTileX = Math.floor(viewLeft / 256.0);
  const maxTileX = Math.floor((viewLeft + viewW) / 256.0);
  const minTileY = Math.floor(viewTop / 256.0);
  const maxTileY = Math.floor((viewTop + viewH) / 256.0);

  const numTiles = Math.pow(2, zoom);

  const visibleTiles: { tx: number; ty: number; x: number; y: number; key: string }[] = [];
  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      if (ty >= 0 && ty < numTiles) {
        const wrappedTx = ((tx % numTiles) + numTiles) % numTiles;
        visibleTiles.push({
          tx: wrappedTx,
          ty,
          x: tx * 256.0 - viewLeft,
          y: ty * 256.0 - viewTop,
          key: `${zoom}-${wrappedTx}-${ty}`,
        });
      }
    }
  }

  // Filtrage des biens par ville
  const filteredProperties = properties.filter((p) => {
    if (selectedCity === 'Toutes') return true;
    return p.localisation.toLowerCase().includes(selectedCity.toLowerCase());
  });

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    if (CITY_COORDS[city]) {
      const c = CITY_COORDS[city];
      setCenterLat(c.lat);
      setCenterLng(c.lng);
      setZoom(c.zoom);
    } else {
      setCenterLat(36.8065);
      setCenterLng(10.1815);
      setZoom(11);
    }
  };

  const handleCenterMyLocation = () => {
    setCenterLat(36.8065);
    setCenterLng(10.1815);
    setZoom(14);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1E2028' : '#E5E9F0' }]}>
      {/* 1. MOTEUR CARTOGRAPHIQUE SLIPPY MAP */}
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        {/* A. TUILES OPENSTREETMAP */}
        {visibleTiles.map((tile) => (
          <Image
            key={tile.key}
            source={{
              uri: `https://tile.openstreetmap.org/${zoom}/${tile.tx}/${tile.ty}.png`,
              headers: {
                'User-Agent': 'DarLink-App/1.0 (academic-project; contact: rayen@darlink.tn)',
              },
            }}
            style={[
              styles.tile,
              {
                left: tile.x,
                top: tile.y,
              },
            ]}
          />
        ))}

        {/* B. PIN MA POSITION GPS */}
        <View
          style={[
            styles.myLocationMarker,
            {
              left: lngToX(10.1815, zoom) - viewLeft - 10,
              top: latToY(36.8065, zoom) - viewTop - 10,
            },
          ]}
        >
          <View style={styles.myLocationDot} />
        </View>

        {/* C. PINS GÉOLOCALISÉS ISSUS DE POSTGRESQL */}
        {filteredProperties.map((prop) => {
          const px = lngToX(prop.longitude ?? 10.1815, zoom) - viewLeft;
          const py = latToY(prop.latitude ?? 36.8065, zoom) - viewTop;
          const isSelected = selectedProperty?.id === prop.id;

          return (
            <TouchableOpacity
              key={prop.id || prop.titre}
              activeOpacity={0.8}
              onPress={() => setSelectedProperty(prop)}
              style={[
                styles.markerContainer,
                {
                  left: px - 40,
                  top: py - 35,
                  transform: [{ scale: isSelected ? 1.15 : 1.0 }],
                },
              ]}
            >
              <View
                style={[
                  styles.priceBadge,
                  {
                    backgroundColor: isSelected
                      ? colors.accentBlue
                      : isDark
                      ? colors.surfaceElevated
                      : '#FFFFFF',
                    borderColor: isSelected ? '#FFFFFF' : colors.accentBlue,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priceBadgeText,
                    {
                      color: isSelected ? '#FFFFFF' : isDark ? '#FFFFFF' : colors.accentBlue,
                    },
                  ]}
                >
                  {((prop.prix || 0) / 1000).toFixed(0)}k DT
                </Text>
              </View>
              <Text style={{ fontSize: 20, textAlign: 'center' }}>📍</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. EN-TÊTE : RECHERCHE ET VILLES */}
      <View style={styles.headerContainer}>
        <View
          style={[
            styles.titleCard,
            {
              backgroundColor: isDark ? 'rgba(30,32,40,0.95)' : 'rgba(255,255,255,0.95)',
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.titleText, { color: colors.textPrimary }]}>
            🗺️ Cartographie OpenStreetMap
          </Text>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            {filteredProperties.length} bien(s) géolocalisé(s) en Tunisie
          </Text>
          {loading && <ActivityIndicator size="small" color={colors.accentBlue} style={{ marginTop: 4 }} />}
        </View>

        {/* PASTILLES DES VILLES */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.citiesScroll}
        >
          {cities.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                activeOpacity={0.7}
                onPress={() => handleCitySelect(city)}
                style={[
                  styles.cityChip,
                  {
                    backgroundColor: isSelected
                      ? colors.accentBlue
                      : isDark
                      ? 'rgba(30,32,40,0.95)'
                      : 'rgba(255,255,255,0.95)',
                    borderColor: isSelected ? colors.accentBlue : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cityChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. CONTRÔLES FLOTTANTS : ZOOM & MA POSITION */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
          onPress={() => setZoom((z) => Math.min(18, z + 1))}
        >
          <Text style={[styles.fabText, { color: colors.textPrimary }]}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
          onPress={() => setZoom((z) => Math.max(6, z - 1))}
        >
          <Text style={[styles.fabText, { color: colors.textPrimary }]}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
          onPress={handleCenterMyLocation}
        >
          <Text style={{ fontSize: 16 }}>🎯</Text>
        </TouchableOpacity>
      </View>

      {/* 4. ATTRIBUTION LÉGALE OPENSTREETMAP */}
      <View style={[styles.attributionBadge, { bottom: selectedProperty ? 135 : 16 }]}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
      </View>

      {/* 5. CARTE D'APERÇU DU BIEN SÉLECTIONNÉ */}
      {selectedProperty && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onSelectProperty && onSelectProperty(selectedProperty)}
          style={[
            styles.previewCard,
            {
              backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <Image source={{ uri: selectedProperty.imageUrl }} style={styles.previewImage} />
          <View style={styles.previewContent}>
            <Text
              style={[styles.previewTitle, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {selectedProperty.titre}
            </Text>
            <Text style={[styles.previewLocation, { color: colors.textSecondary }]} numberOfLines={1}>
              📍 {selectedProperty.localisation}
            </Text>
            <View style={styles.previewFooter}>
              <Text style={[styles.previewPrice, { color: colors.accentBlue }]}>
                {formatPrice(selectedProperty.prix)}
              </Text>
              <View style={[styles.consultBtn, { backgroundColor: colors.accentBlue }]}>
                <Text style={styles.consultBtnText}>Consulter →</Text>
              </View>
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
    overflow: 'hidden',
  },
  tile: {
    position: 'absolute',
    width: 256,
    height: 256,
  },
  myLocationMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  titleCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  subtitleText: {
    fontSize: 11,
    marginTop: 2,
  },
  citiesScroll: {
    paddingBottom: 4,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cityChipText: {
    fontSize: 12,
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: 140,
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  attributionBadge: {
    position: 'absolute',
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  attributionText: {
    color: '#FFFFFF',
    fontSize: 9,
  },
  previewCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  previewImage: {
    width: 85,
    height: 75,
    borderRadius: 12,
  },
  previewContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewLocation: {
    fontSize: 11,
    marginTop: 2,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  previewPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  consultBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  consultBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
