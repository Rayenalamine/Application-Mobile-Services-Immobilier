// ============================================================
// DARLINK — APPLE LIQUID GLASS FAVORITES SCREEN (React Native)
// Mirrors Flutter EcranFavoris with live Firestore sync & frosted UI.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { RefreshCw, Heart, BookmarkCheck } from 'lucide-react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { favoritesApiService } from '../../../favorites/services/favoritesApiService';
import { Property } from '../../../properties/domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';
import { LiquidGlassView, GlassOrbButton } from '../../../../core/designSystem/LiquidGlass';
import { TypographyScale, RadiusScale } from '../../../../core/designSystem/tokens';

export const FavoritesScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[TypographyScale.micro, { color: colors.accentChampagne }]}>COLLECTION</Text>
          <Text style={[TypographyScale.pageTitle, { color: colors.textPrimary, marginTop: 2 }]}>
            {t('favorites_title')}
          </Text>
        </View>
        <GlassOrbButton size={40} onPress={onRefresh} accessibilityLabel={t('btn_refresh')}>
          <RefreshCw size={17} color={colors.textPrimary} />
        </GlassOrbButton>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accentChampagne} />
        </View>
      ) : favorites.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <LiquidGlassView borderRadius={46} intensity={52} style={styles.heartEmblem}>
            <Heart size={38} color={colors.accentRed} fill={colors.accentRed} />
          </LiquidGlassView>

          <Text style={[TypographyScale.pageTitle, { color: colors.textPrimary, fontSize: 22, textAlign: 'center' }]}>
            {t('empty_favorites_title')}
          </Text>
          <Text style={[TypographyScale.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: 300 }]}>
            {t('empty_favorites_hint')}
          </Text>

          <LiquidGlassView borderRadius={RadiusScale.pill} intensity={45} elevated={false} style={styles.noticePill}>
            <BookmarkCheck size={16} color={colors.accentChampagne} />
            <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
              {t('empty_favorites_sub')}
            </Text>
          </LiquidGlassView>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 120,
  },
  heartEmblem: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 24,
  },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },
});
