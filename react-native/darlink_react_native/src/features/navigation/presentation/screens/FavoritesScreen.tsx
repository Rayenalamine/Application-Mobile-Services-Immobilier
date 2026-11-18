// ============================================================
// DARLINK — ÉCRAN DES FAVORIS LUXE GLASSMORPHISM (React Native)
// Adaptatif Clair / Sombre, parité complète avec EcranFavoris Flutter
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';

export const FavoritesScreen: React.FC = () => {
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mes Favoris</Text>
      </View>

      <View style={styles.container}>
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
          Aucun favori enregistré
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Retrouvez ici les annonces que vous aurez ajoutées à vos favoris en appuyant sur le cœur de la fiche détaillée.
        </Text>

        {/* Carte note roadmap */}
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
            Persistance locale et backend prévue en phase V6-T02
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
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
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
