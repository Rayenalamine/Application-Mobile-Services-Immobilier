// ============================================================
// DARLINK — ÉCRAN DE PROFIL REACT NATIVE (V2-T04 - Membre 2)
// Parité complète avec EcranProfil Flutter
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';
import { AppSpacing } from '../../../../core/constants/spacing';

export const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* En-tête utilisateur invité */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>Utilisateur Invité</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Session Démo V2</Text>
          </View>
        </View>

        {/* Informations académiques */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>Contexte Universitaire & Projet</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Projet :</Text>
            <Text style={styles.infoValue}>DarLink Mobile</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cadre :</Text>
            <Text style={styles.infoValue}>Mini Projet Défi — Développement Mobile</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Enseignant :</Text>
            <Text style={styles.infoValue}>M. Wahid Hamdi</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Organisation :</Text>
            <Text style={styles.infoValue}>Équipe 3 membres (Rotation A/B/C)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plateformes :</Text>
            <Text style={styles.infoValue}>Flutter (Dart) & React Native (Expo)</Text>
          </View>
        </View>

        {/* Encart JWT V4 */}
        <View style={styles.authNotice}>
          <Text style={styles.authIcon}>🔐</Text>
          <View style={styles.authBody}>
            <Text style={styles.authTitle}>Authentification JWT V4-T01</Text>
            <Text style={styles.authText}>
              Le système de connexion sécurisée par jeton JWT et gestion des rôles
              (Client / Agent immobilier) sera déployé en Version 4.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  },
  content: {
    padding: AppSpacing.l,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: AppSpacing.xl,
    marginTop: AppSpacing.m,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppSpacing.s,
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  avatarText: {
    fontSize: 38,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  badge: {
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.cardRadius,
    padding: AppSpacing.l,
    borderWidth: 0.8,
    borderColor: AppColors.border,
    elevation: 2,
    marginBottom: AppSpacing.l,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.primary,
    marginBottom: AppSpacing.m,
    borderBottomWidth: 0.8,
    borderBottomColor: AppColors.border,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  authNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: AppSpacing.cardRadius,
    padding: AppSpacing.l,
    borderLeftWidth: 4,
    borderLeftColor: '#FB8C00',
  },
  authIcon: {
    fontSize: 22,
    marginRight: AppSpacing.m,
  },
  authBody: {
    flex: 1,
  },
  authTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 4,
  },
  authText: {
    fontSize: 12,
    lineHeight: 18,
    color: AppColors.textSecondary,
  },
});
