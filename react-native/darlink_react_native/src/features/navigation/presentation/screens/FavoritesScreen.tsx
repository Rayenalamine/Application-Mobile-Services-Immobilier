// ============================================================
// DARLINK — ÉCRAN DES FAVORIS REACT NATIVE (V2-T04 - Membre 2)
// Parité complète avec EcranFavoris Flutter
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';
import { AppSpacing } from '../../../../core/constants/spacing';

export const FavoritesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Text style={styles.heartIcon}>❤️</Text>
        </View>

        <Text style={styles.title}>Aucun favori pour le moment</Text>
        <Text style={styles.subtitle}>
          Explorez nos annonces immobilières et appuyez sur l'icône cœur pour retrouver vos biens préférés ici.
        </Text>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Persistance locale V6-T02</Text>
          <Text style={styles.noticeText}>
            La persistance hors-ligne des favoris sur mobile sera intégrée en Version 6
            (AsyncStorage / SQLite).
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    height: 56,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppSpacing.l,
  },
  heartIcon: {
    fontSize: 44,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: AppSpacing.s,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: AppSpacing.xl,
  },
  noticeCard: {
    backgroundColor: AppColors.surface,
    padding: AppSpacing.l,
    borderRadius: AppSpacing.cardRadius,
    borderWidth: 0.8,
    borderColor: AppColors.border,
    alignItems: 'center',
    width: '100%',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
