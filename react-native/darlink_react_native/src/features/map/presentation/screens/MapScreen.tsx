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
  Platform,
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
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { LiquidGlassView } from '../../../../core/designSystem/LiquidGlass';
import { triggerHaptic } from '../../../../core/designSystem/tokens';
import { findGovernorate } from '../../../../core/constants/tunisiaLocations';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property, formatPrice } from '../../../properties/domain/models/property';

interface MapScreenProps {
  onBack: () => void;
  onSelectProperty?: (property: Property) => void;
  initialProperty?: Property | null;
}

function latToY(lat: number, zoom: number): number {
  const z = Math.round(zoom);
  const n = Math.pow(2.0, z);
  const clamped = Math.max(-85.0511, Math.min(85.0511, lat));
  const radClamped = (clamped * Math.PI) / 180.0;
  return (
    ((1.0 - Math.log(Math.tan(radClamped) + 1.0 / Math.cos(radClamped)) / Math.PI) / 2.0) *
    n *
    256.0
  );
}

function lngToX(lng: number, zoom: number): number {
  const z = Math.round(zoom);
  const n = Math.pow(2.0, z);
  return ((lng + 180.0) / 360.0) * n * 256.0;
}

function xToLng(x: number, zoom: number): number {
  const z = Math.round(zoom);
  const n = Math.pow(2.0, z);
  return (x / (n * 256.0)) * 360.0 - 180.0;
}

function yToLat(y: number, zoom: number): number {
  const z = Math.round(zoom);
  const n = Math.pow(2.0, z);
  const latRad = Math.atan(Math.sinh(Math.PI * (1.0 - (2.0 * y) / (n * 256.0))));
  return (latRad * 180.0) / Math.PI;
}

const QUICK_GOVERNORATES = [
  'ALL',
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
  const { t } = useTranslation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerSize, setContainerSize] = useState({
    width: windowWidth || 390,
    height: windowHeight || 700,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(initialProperty || null);
  const [selectedGov, setSelectedGov] = useState('ALL');
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
  const rafId = useRef<number | null>(null);

  const [failedTiles, setFailedTiles] = useState<Record<string, boolean>>({});

  // Synchronisation dynamique si initialProperty change (zoom entier 14)
  useEffect(() => {
    if (initialProperty) {
      setSelectedProperty(initialProperty);
      if (typeof initialProperty.latitude === 'number') {
        setCenterLat(initialProperty.latitude);
      }
      if (typeof initialProperty.longitude === 'number') {
        setCenterLng(initialProperty.longitude);
      }
      setZoom(14);
    }
  }, [initialProperty]);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const list = await propertyApiService.getMapProperties(
        selectedGov === 'ALL' ? undefined : selectedGov
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
        Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false,
      onPanResponderGrant: () => {
        startCoordsRef.current = { lat: coordsRef.current.lat, lng: coordsRef.current.lng };
      },
      onPanResponderMove: (_, g: PanResponderGestureState) => {
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
        }
        rafId.current = requestAnimationFrame(() => {
          const curZoom = Math.max(5, Math.min(18, Math.round(coordsRef.current.zoom)));
          const cx = lngToX(startCoordsRef.current.lng, curZoom);
          const cy = latToY(startCoordsRef.current.lat, curZoom);
          const nextLng = Math.max(-180, Math.min(180, xToLng(cx - g.dx, curZoom)));
          const nextLat = Math.max(-85, Math.min(85, yToLat(cy - g.dy, curZoom)));
          setCenterLng(nextLng);
          setCenterLat(nextLat);
        });
      },
      onPanResponderRelease: () => {
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
      },
    })
  ).current;

  const curZoom = Math.max(5, Math.min(18, Math.round(zoom)));
  const viewW = containerSize.width > 50 ? containerSize.width : windowWidth || 390;
  const viewH = containerSize.height > 50 ? containerSize.height : windowHeight || 700;
  const centerX = lngToX(centerLng, curZoom);
  const centerY = latToY(centerLat, curZoom);
  const viewLeft = centerX - viewW / 2;
  const viewTop = centerY - viewH / 2;

  // Extra padding de 1 tuile pour éliminer les bords vides lors du déplacement
  const minTileX = Math.floor(viewLeft / 256.0) - 1;
  const maxTileX = Math.floor((viewLeft + viewW) / 256.0) + 1;
  const minTileY = Math.floor(viewTop / 256.0) - 1;
  const maxTileY = Math.floor((viewTop + viewH) / 256.0) + 1;
  const numTiles = Math.pow(2, curZoom);

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
          key: `${curZoom}-${wrappedTx}-${ty}`,
        });
      }
    }
  }

  const handleSelectGovernorate = (gov: string) => {
    setSelectedGov(gov);
    if (gov === 'ALL') {
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
        setGpsStatusMessage(t('gps_disabled'));
        return;
      }

      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        if (!perm.canAskAgain) {
          setGpsStatusMessage(t('gps_denied_permanent'));
        } else {
          setGpsStatusMessage(t('gps_denied'));
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
      setGpsStatusMessage(t('gps_unavailable'));
    } finally {
      setLocating(false);
    }
  };

  const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY || '5y3oKTTSOXa9eD0KObiE';

  const getTileUri = (tile: { tx: number; ty: number }, fallback: boolean = false) => {
    const z = curZoom;
    if (fallback) {
      return `https://tile.openstreetmap.org/${z}/${tile.tx}/${tile.ty}.png`;
    }
    // 1. MapTiler Cloud CDN haute performance (clé utilisateur officielle)
    if (MAPTILER_KEY) {
      const style = isDark ? 'streets-v2-dark' : 'streets-v2';
      return `https://api.maptiler.com/maps/${style}/256/${z}/${tile.tx}/${tile.ty}.png?key=${MAPTILER_KEY}`;
    }
    // 2. Repli CARTO Voyager / Dark Matter
    const subdomains = ['a', 'b', 'c', 'd'];
    const s = subdomains[Math.abs(tile.tx + tile.ty) % subdomains.length];
    return isDark
      ? `https://${s}.basemaps.cartocdn.com/dark_all/${z}/${tile.tx}/${tile.ty}.png`
      : `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${tile.tx}/${tile.ty}.png`;
  };

  const precisionLabel = (precision?: string) => {
    if (precision === 'VERIFIED') return t('map_precision_verified');
    if (precision === 'APPROXIMATE') return t('map_precision_approx');
    return t('map_precision_governorate');
  };

  return (
    <View
      style={[styles.container, { backgroundColor: isDark ? '#1A1D24' : '#E5E9F0' }]}
      onLayout={handleLayout}
    >
      {/* 1. CARTE SLIPPY MAP CARTO + OSM REPLI */}
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        {visibleTiles.map((tile) => (
          <Image
            key={tile.key}
            source={{
              uri: failedTiles[tile.key]
                ? getTileUri(tile, true)
                : getTileUri(tile, false),
            }}
            onError={() => {
              if (!failedTiles[tile.key]) {
                setFailedTiles((prev) => ({ ...prev, [tile.key]: true }));
              }
            }}
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
                left: lngToX(userGps.lng, curZoom) - viewLeft - 11,
                top: latToY(userGps.lat, curZoom) - viewTop - 11,
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
          const px = lngToX(lng, curZoom) - viewLeft;
          const py = latToY(lat, curZoom) - viewTop;
          const isSelected = selectedProperty?.id === prop.id;
          const priceShort =
            prop.priceOnRequest || !prop.prix || prop.prix <= 0
              ? t('price_on_request_short')
              : `${(prop.prix / 1000).toFixed(0)}k ${t('currency')}`;

          return (
            <TouchableOpacity
              key={prop.id || prop.titre}
              activeOpacity={0.85}
              onPress={() => {
                triggerHaptic('selection');
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
                      ? isDark ? '#F5F5F7' : '#1D1D1F'
                      : isDark
                      ? colors.surfaceElevated
                      : '#FFFFFF',
                    borderColor: isSelected ? colors.accentChampagne : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priceBadgeText,
                    { color: isSelected ? (isDark ? '#1D1D1F' : '#FFFFFF') : colors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {priceShort}
                </Text>
              </View>
              <MapPin
                size={20}
                color={isSelected ? colors.accentChampagne : colors.textPrimary}
                fill={isSelected ? colors.accentChampagne : 'transparent'}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. EN-TÊTE ET GOUVERNORATS */}
      <View style={styles.headerContainer}>
        <LiquidGlassView borderRadius={22} style={styles.titleCard}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]}
            accessibilityRole="button"
            accessibilityLabel={t('btn_back')}
          >
            <ArrowLeft size={15} color={isDark ? '#1D1D1F' : '#FFFFFF'} />
            <Text style={[styles.backBtnText, { color: isDark ? '#1D1D1F' : '#FFFFFF' }]}>{t('btn_back')}</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={[styles.titleText, { color: colors.textPrimary }]}>
              {t('map_title')}
            </Text>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
              {t('map_properties_count', { count: properties.length })} • {selectedGov === 'ALL' ? t('filter_all') : selectedGov}
            </Text>
          </View>
          {loading && <ActivityIndicator size="small" color={colors.accentChampagne} />}
        </LiquidGlassView>

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
                      ? isDark ? '#F5F5F7' : '#1D1D1F'
                      : isDark
                      ? 'rgba(21,23,28,0.88)'
                      : 'rgba(255,255,255,0.90)',
                    borderColor: isSelected ? 'transparent' : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cityChipText,
                    { color: isSelected ? (isDark ? '#1D1D1F' : '#FFFFFF') : colors.textPrimary, fontWeight: isSelected ? '600' : '500' },
                  ]}
                >
                  {gov === 'ALL' ? t('filter_all') : gov}
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
          onPress={() => setZoom((z) => Math.min(18, Math.round(z) + 1))}
          accessibilityLabel="Zoom avant"
          onPress={() => setZoom((z) => Math.min(18, z + 1))}
          accessibilityLabel={t('map_zoom_in')}
        >
          <Plus size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: cardSurface(isDark), borderColor: colors.border }]}
          onPress={() => setZoom((z) => Math.max(5, Math.round(z) - 1))}
          accessibilityLabel="Zoom arrière"
          onPress={() => setZoom((z) => Math.max(5, z - 1))}
          accessibilityLabel={t('map_zoom_out')}
        >
          <Minus size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: cardSurface(isDark), borderColor: colors.border }]}
          onPress={() => setShowPermissionModal(true)}
          accessibilityLabel={t('map_my_gps')}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.accentBlue} />
          ) : (
            <Compass size={18} color={colors.accentBlue} />
          )}
        </TouchableOpacity>
      </View>

      {/* 4. ATTRIBUTION LÉGALE */}
      <View
        style={[
          styles.attributionBadge,
          {
            bottom: selectedProperty
              ? (Platform.OS === 'ios' ? 228 : 214)
              : (Platform.OS === 'ios' ? 98 : 84),
          },
        ]}
      >
        <Text style={styles.attributionText}>© MapTiler © OpenStreetMap contributors</Text>
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
              <Text style={[styles.previewPrice, { color: colors.textPrimary }]}>
                {formatPrice(
                  selectedProperty.prix,
                  Boolean(selectedProperty.estLocation),
                  Boolean(selectedProperty.priceOnRequest)
                )}
              </Text>
              <View style={[styles.consultBtn, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]}>
                <Text style={[styles.consultBtnText, { color: isDark ? '#1D1D1F' : '#FFFFFF' }]}>{t('map_view_listing')}</Text>
                <ChevronRight size={13} color={isDark ? '#1D1D1F' : '#FFFFFF'} />
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
              {t('gps_modal_title')}
            </Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              {t('gps_modal_body')}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('gps_later')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.accentBlue }]}
                onPress={handleRequestGps}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{t('gps_allow')}</Text>
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
  headerContainer: { position: 'absolute', top: 14, left: 16, right: 16 },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 10,
  },
  backBtnText: { fontWeight: '600', fontSize: 12.5 },
  titleText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.25 },
  subtitleText: { fontSize: 11, marginTop: 1 },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 0.9,
    marginBottom: 8,
  },
  gpsBannerText: { fontSize: 11.5, flex: 1 },
  citiesScroll: { paddingBottom: 4 },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0.9,
    marginRight: 8,
  },
  cityChipText: { fontSize: 12 },
  controlsContainer: { position: 'absolute', right: 16, top: 148 },
  fab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.9,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  attributionBadge: {
    position: 'absolute',
    right: 12,
    backgroundColor: 'rgba(11,12,15,0.68)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  attributionText: { color: '#FFFFFF', fontSize: 9.5, fontWeight: '500' },
  previewCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 104 : 90,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 24,
    borderWidth: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  previewImage: { width: 90, height: 84, borderRadius: 16 },
  previewContent: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  previewTitle: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  previewLocation: { fontSize: 11.5, flex: 1 },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  previewPrice: { fontSize: 14, fontWeight: '700' },
  consultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  consultBtnText: { fontSize: 11.5, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    padding: 24,
    borderWidth: 0.9,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginTop: 12, textAlign: 'center' },
  modalBody: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginTop: 8, marginBottom: 18 },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center' },
});
