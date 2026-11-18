// ============================================================
// DARLINK — ÉCRAN DES FAVORIS LUXE GLASSMORPHISM (React Native)
// Parité complète avec EcranFavoris Flutter et le thème sombre de luxe
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';

export const FavoritesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
      </View>

      <View style={styles.container}>
        {/* Cercle d'icône avec verre dépoli & lueur */}
        <View style={styles.iconCircle}>
          <Text style={styles.heartIcon}>❤️</Text>
        </View>

        <Text style={styles.title}>Aucun favori enregistré</Text>
        <Text style={styles.subtitle}>
          Retrouvez ici les annonces que vous aurez ajoutées à vos favoris en appuyant sur le cœur de la fiche détaillée.
        </Text>

        {/* Carte Frosted Glass note roadmap */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>🔖</Text>
          <Text style={styles.noticeText}>
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
    backgroundColor: AppColors.darkBackground,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
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
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.35)',
  },
  heartIcon: {
    fontSize: 42,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.darkTextSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.darkSurface,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  noticeText: {
    fontSize: 12,
    color: AppColors.darkTextSecondary,
    fontWeight: '500',
  },
});
