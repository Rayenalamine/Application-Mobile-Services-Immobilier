// ============================================================
// DARLINK — CARTOGRAPHIE INTERACTIVE PRODUCTION (React Native / Expo)
// Tuiles CARTO Voyager / Dark Matter (OSM) compatibles Expo Go, Web, iOS, Android.
// Icônes vectorielles Lucide, permissions GPS avec modal explicative,
// centrage sur bien, confidentialité d'adresse & repli gouvernorat.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
  LayoutChangeEvent,
  PanResponder,
  PanResponderGestureState,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import {
  ArrowLeft,
  Compass,
  MapPin,
  Plus,
  Minus,
  ChevronRight,
  Building2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { findGovernorate } from '../../../../core/constants/tunisiaLocations';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property, formatPrice } from '../../../properties/domain/models/property';

interface MapScreenProps {
  onBack: () => void;
  onSelectProperty?: (property: Property) => void;
  initialProperty?: Property | null;
}

function latToY(lat: number, zoom: number): number {
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

const QUICK_GOVERNORATES = [
  'Tous',
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Nabeul',
  'Bizerte',
  'Sousse',
  'Sfax',
  'Médenine',
  'Kairouan',
] as const;

export const MapScreen: React.FC<MapScreenProps> = ({
  onBack,
  onSelectProperty,
  initialProperty,
}) => {
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerSize, setContainerSize] = useState({
    width: windowWidth || 390,
    height: windowHeight || 700,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(initialProperty || null);
  const [selectedGov, setSelectedGov] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);

  const [centerLat, setCenterLat] = useState(initialProperty?.latitude ?? 36.8065);
  const [centerLng, setCenterLng] = useState(initialProperty?.longitude ?? 10.1815);
  const [zoom, setZoom] = useState(initialProperty ? 13 : 11);

  const startCoordsRef = useRef({ lat: centerLat, lng: centerLng });
  const coordsRef = useRef({ lat: centerLat, lng: centerLng, zoom });
  coordsRef.current = { lat: centerLat, lng: centerLng, zoom };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const list = await propertyApiService.getMapProperties(
        selectedGov === 'Tous' ? undefined : selectedGov
      );
      if (isMounted) {
        setProperties(list);
        if (!selectedProperty && list.length > 0) {
          setSelectedProperty(list[0]);
        }
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [selectedGov]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContainerSize({ width, height });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g: PanResponderGestureState) =>
        Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        startCoordsRef.current = { lat: coordsRef.current.lat, lng: coordsRef.current.lng };
      },
      onPanResponderMove: (_, g: PanResponderGestureState) => {
        const curZoom = coordsRef.current.zoom;
        const cx = lngToX(startCoordsRef.current.lng, curZoom);
        const cy = latToY(startCoordsRef.current.lat, curZoom);
        setCenterLng(xToLng(cx - g.dx, curZoom));
        setCenterLat(yToLat(cy - g.dy, curZoom));
      },
    })
  ).current;

  const viewW = containerSize.width > 0 ? containerSize.width : windowWidth || 390;
  const viewH = containerSize.height > 0 ? containerSize.height : windowHeight || 700;
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

  const handleSelectGovernorate = (gov: string) => {
    setSelectedGov(gov);
    if (gov === 'Tous') {
      setCenterLat(35.8);
      setCenterLng(9.8);
      setZoom(7);
      return;
    }
    const found = findGovernorate(gov);
    if (found) {
      setCenterLat(found.latitude);
      setCenterLng(found.longitude);
      setZoom(11);
    }
  };

  const handleRequestGps = async () => {
    setShowPermissionModal(false);
    setLocating(true);
    setGpsStatusMessage(null);
    try {
      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        setGpsStatusMessage('Services de localisation désactivés sur l’appareil.');
        return;
      }

      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        if (!perm.canAskAgain) {
          setGpsStatusMessage('Localisation refusée définitivement. Activez-la dans les réglages.');
        } else {
          setGpsStatusMessage('Permission GPS refusée. Navigation libre par gouvernorat active.');
        }
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setCenterLat(pos.coords.latitude);
      setCenterLng(pos.coords.longitude);
      setZoom(13);
    } catch {
      setGpsStatusMessage('Localisation indisponible. Affichage centré sur la Tunisie.');
    } finally {
      setLocating(false);
    }
  };

  const getTileUri = (tile: { tx: number; ty: number }) => {
    return isDark
      ? `https://basemaps.cartocdn.com/dark_all/${zoom}/${tile.tx}/${tile.ty}.png`
      : `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tile.tx}/${tile.ty}.png`;
  };

  const precisionLabel = (precision?: string) => {
    if (precision === 'VERIFIED') return 'Position vérifiée';
    if (precision === 'APPROXIMATE') return 'Zone du quartier (adresse protégée)';
    return 'Centre gouvernorat';
  };

  return (
    <View
      style={[styles.container, { backgroundColor: isDark ? '#1A1D24' : '#E5E9F0' }]}
      onLayout={handleLayout}
    >
      {/* 1. CARTE SLIPPY MAP CARTO */}
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        {visibleTiles.map((tile) => (
          <Image
            key={tile.key}
            source={{ uri: getTileUri(tile) }}
            style={[styles.tile, { left: tile.x, top: tile.y }]}
            fadeDuration={0}
            resizeMode="cover"
          />
        ))}

        {/* Marqueur GPS utilisateur (uniquement si autorisé) */}
        {userGps && (
          <View
            style={[
              styles.myLocationMarker,
              {
                left: lngToX(userGps.lng, zoom) - viewLeft - 11,
                top: latToY(userGps.lat, zoom) - viewTop - 11,
              },
            ]}
          >
            <View style={styles.myLocationDot} />
          </View>
        )}

        {/* Marqueurs des biens réels */}
        {properties.map((prop) => {
          const lat = prop.latitude ?? 36.8065;
          const lng = prop.longitude ?? 10.1815;
          const px = lngToX(lng, zoom) - viewLeft;
          const py = latToY(lat, zoom) - viewTop;
          const isSelected = selectedProperty?.id === prop.id;
          const priceShort =
            prop.priceOnRequest || !prop.prix || prop.prix <= 0
              ? 'Sur demande'
              : `${(prop.prix / 1000).toFixed(0)}k DT`;

          return (
            <TouchableOpacity
              key={prop.id || prop.titre}
              activeOpacity={0.85}
              onPress={() => {
                setSelectedProperty(prop);
                setCenterLat(lat);
                setCenterLng(lng);
              }}
              style={[
                styles.markerContainer,
                {
                  left: px - 52,
                  top: py - 42,
                  zIndex: isSelected ? 999 : 10,
                  transform: [{ scale: isSelected ? 1.12 : 1.0 }],
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
                    { color: isSelected ? '#FFFFFF' : isDark ? '#FFFFFF' : colors.accentBlue },
                  ]}
                  numberOfLines={1}
                >
                  {priceShort}
                </Text>
              </View>
              <MapPin
                size={22}
                color={isSelected ? colors.accentBlue : isDark ? '#E2E8F0' : '#0F172A'}
                fill={isSelected ? colors.accentBlue : 'transparent'}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. EN-TÊTE ET GOUVERNORATS */}
      <View style={styles.headerContainer}>
        <View
          style={[
            styles.titleCard,
            {
              backgroundColor: isDark ? 'rgba(22,25,33,0.95)' : 'rgba(255,255,255,0.95)',
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { backgroundColor: colors.accentBlue }]}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <ArrowLeft size={16} color="#FFFFFF" />
            <Text style={styles.backBtnText}>Retour</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={[styles.titleText, { color: colors.textPrimary }]}>
              Carte Immobilière Tunisie
            </Text>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
              {properties.length} bien(s) • {selectedGov}
            </Text>
          </View>
          {loading && <ActivityIndicator size="small" color={colors.accentBlue} />}
        </View>

        {gpsStatusMessage && (
          <View style={[styles.gpsBanner, { backgroundColor: cardSurface(isDark), borderColor: colors.border }]}>
            <AlertCircle size={14} color={colors.accentBlue} />
            <Text style={[styles.gpsBannerText, { color: colors.textSecondary }]}>{gpsStatusMessage}</Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.citiesScroll}
        >
          {QUICK_GOVERNORATES.map((gov) => {
            const isSelected = selectedGov === gov;
            return (
              <TouchableOpacity
                key={gov}
                activeOpacity={0.75}
                onPress={() => handleSelectGovernorate(gov)}
                style={[
                  styles.cityChip,
                  {
                    backgroundColor: isSelected
                      ? colors.accentBlue
                      : isDark
                      ? 'rgba(22,25,33,0.94)'
                      : 'rgba(255,255,255,0.95)',
                    borderColor: isSelected ? colors.accentBlue : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cityChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {gov}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. CONTRÔLES ZOOM & GPS */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: cardSurface(isDark), borderColor: colors.border }]}
          onPress={() => setZoom((z) => Math.min(18, z + 1))}
          accessibilityLabel="Zoom avant"
        >
          <Plus size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: cardSurface(isDark), borderColor: colors.border }]}
          onPress={() => setZoom((z) => Math.max(5, z - 1))}
          accessibilityLabel="Zoom arrière"
        >
          <Minus size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: cardSurface(isDark), borderColor: colors.border }]}
          onPress={() => setShowPermissionModal(true)}
          accessibilityLabel="Ma position GPS"
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.accentBlue} />
          ) : (
            <Compass size={18} color={colors.accentBlue} />
          )}
        </TouchableOpacity>
      </View>

      {/* 4. ATTRIBUTION LÉGALE */}
      <View style={[styles.attributionBadge, { bottom: selectedProperty ? 196 : 18 }]}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors © CARTO</Text>
      </View>

      {/* 5. CARTE D'APERÇU DU BIEN SÉLECTIONNÉ */}
      {selectedProperty && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onSelectProperty && onSelectProperty(selectedProperty)}
          style={[
            styles.previewCard,
            { backgroundColor: cardSurface(isDark), borderColor: colors.border },
          ]}
        >
          {selectedProperty.imageUrl ? (
            <Image source={{ uri: selectedProperty.imageUrl }} style={styles.previewImage} />
          ) : (
            <View
              style={[
                styles.previewImage,
                {
                  backgroundColor: isDark ? '#1E222B' : '#F1F5F9',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Building2 size={26} color={colors.accentBlue} />
            </View>
          )}

          <View style={styles.previewContent}>
            <Text style={[styles.previewTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {selectedProperty.titre}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPin size={12} color={colors.accentBlue} />
              <Text style={[styles.previewLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                {selectedProperty.localisation}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <ShieldCheck size={11} color={colors.textTertiary} />
              <Text style={{ fontSize: 10, color: colors.textTertiary }}>
                {precisionLabel(selectedProperty.coordinatePrecision)}
              </Text>
            </View>
            <View style={styles.previewFooter}>
              <Text style={[styles.previewPrice, { color: colors.accentBlue }]}>
                {formatPrice(
                  selectedProperty.prix,
                  Boolean(selectedProperty.estLocation),
                  Boolean(selectedProperty.priceOnRequest)
                )}
              </Text>
              <View style={[styles.consultBtn, { backgroundColor: colors.accentBlue }]}>
                <Text style={styles.consultBtnText}>Consulter</Text>
                <ChevronRight size={13} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* MODAL EXPLICATIVE AVANT PERMISSION GPS */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardSurface(isDark), borderColor: colors.border }]}>
            <Compass size={28} color={colors.accentBlue} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Centrer sur votre position ?
            </Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              DarLink utilise votre position uniquement pour afficher les annonces à proximité sur la carte. Vos coordonnées ne sont jamais enregistrées.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Plus tard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.accentBlue }]}
                onPress={handleRequestGps}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Autoriser</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

function cardSurface(isDark: boolean): string {
  return isDark ? '#181B24' : '#FFFFFF';
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', overflow: 'hidden' },
  tile: { position: 'absolute', width: 256, height: 256 },
  myLocationMarker: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(37, 99, 235, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerContainer: { position: 'absolute', alignItems: 'center', width: 104 },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 1,
    elevation: 3,
  },
  priceBadgeText: { fontSize: 10.5, fontWeight: '700' },
  headerContainer: { position: 'absolute', top: 12, left: 16, right: 16 },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    elevation: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12.5 },
  titleText: { fontSize: 14.5, fontWeight: '700' },
  subtitleText: { fontSize: 11, marginTop: 1 },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  gpsBannerText: { fontSize: 11.5, flex: 1 },
  citiesScroll: { paddingBottom: 4 },
  cityChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  cityChipText: { fontSize: 12 },
  controlsContainer: { position: 'absolute', right: 16, top: 146 },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 8,
    elevation: 4,
  },
  attributionBadge: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  attributionText: { color: '#FFFFFF', fontSize: 9.5 },
  previewCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 98,
    flexDirection: 'row',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 6,
  },
  previewImage: { width: 86, height: 80, borderRadius: 12 },
  previewContent: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  previewTitle: { fontSize: 13.5, fontWeight: '700' },
  previewLocation: { fontSize: 11, flex: 1 },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  previewPrice: { fontSize: 13.5, fontWeight: '800' },
  consultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  consultBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  modalBody: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, marginBottom: 18 },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
});
