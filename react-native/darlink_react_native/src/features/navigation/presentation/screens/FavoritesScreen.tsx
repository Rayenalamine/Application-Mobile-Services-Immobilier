// ============================================================
// DARLINK — ÉCRAN DES FAVORIS LUXE (React Native)
// Icônes vectorielles Lucide, Design System unifié & support RTL
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RefreshCw, Heart, Bookmark } from 'lucide-react-native';
import { AppShadows } from '../../../../core/constants/spacing';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { useBottomNavClearance } from '../../../../core/components/FloatingBottomNav';
import { favoritesApiService } from '../../../favorites/services/favoritesApiService';
import { Property } from '../../../properties/domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';

export const FavoritesScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, isRTL } = useTranslation();
  const bottomClearance = useBottomNavClearance();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const loadFavorites = useCallback(async () => {
    try {
      const list = await favoritesApiService.getFavorites();
      setFavorites(list);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
    const unsubscribe = favoritesApiService.addListener(() => {
      setFavorites([...favoritesApiService.getCachedFavorites()]);
    });
    return unsubscribe;
  }, [loadFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  if (selectedProperty) {
    return (
      <PropertyDetailsScreen
        property={selectedProperty}
        onBack={() => {
          setSelectedProperty(null);
          loadFavorites();
        }}
      />
    );
  }

  return (
    <View style={[styles.containerRoot, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('favorites_title')}</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={[
            styles.refreshButton,
            isRTL ? { left: 16, right: undefined } : { right: 16 },
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t('btn_refresh')}
        >
          <RefreshCw size={17} color={colors.accentBlue} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accentBlue} />
        </View>
      ) : favorites.length === 0 ? (
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: bottomClearance },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.accentBlueSoft,
                borderColor: 'rgba(37, 99, 235, 0.25)',
              },
            ]}
          >
            <Heart size={40} color={colors.accentBlue} strokeWidth={1.8} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('empty_favorites_title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('empty_favorites_hint')}
          </Text>

          <View
            style={[
              styles.noticeCard,
              AppShadows.subtle,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Bookmark size={16} color={colors.accentBlue} strokeWidth={2} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              {t('empty_favorites_sub')}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomClearance },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {favorites.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onPress={(p) => setSelectedProperty(p)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerRoot: {
    flex: 1,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  refreshButton: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  noticeCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  noticeText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
});
