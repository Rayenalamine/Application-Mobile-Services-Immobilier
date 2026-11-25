// ============================================================
// DARLINK — ÉCRAN DES FAVORIS LUXE GLASSMORPHISM (React Native)
// Synchronisation réelle avec Spring Boot & PostgreSQL (V8)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { favoritesApiService } from '../../../favorites/services/favoritesApiService';
import { Property } from '../../../properties/domain/models/property';
import { PropertyCard } from '../../../../core/components/PropertyCard';
import { PropertyDetailsScreen } from '../../../properties/presentation/screens/PropertyDetailsScreen';

export const FavoritesScreen: React.FC = () => {
  const { isDark, colors } = useTheme();
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
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('favorites_title')}</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : favorites.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Cercle d'icône avec lueur discrète */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                borderColor: isDark ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.2)',
              },
            ]}
          >
            <Text style={styles.heartIcon}>❤️</Text>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('empty_favorites_title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('empty_favorites_hint')}
          </Text>

          {/* Carte note de statut */}
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.noticeIcon}>🔖</Text>
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              {t('empty_favorites_sub')}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
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
  safeArea: {
    flex: 1,
  },
  header: {
    height: 56,
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
    right: 16,
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
    paddingVertical: 40,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
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
  heartIcon: {
    fontSize: 42,
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
    marginBottom: 32,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
