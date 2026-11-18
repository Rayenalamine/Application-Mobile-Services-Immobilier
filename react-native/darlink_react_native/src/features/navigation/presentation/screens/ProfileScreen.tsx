// ============================================================
// DARLINK — ÉCRAN DE PROFIL LUXE GLASSMORPHISM (React Native)
// Profil utilisateur Rayen Lamine et contexte académique
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';

export const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Avatar & Identité */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.avatarImage}
            />
            <View style={styles.checkBadge}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </View>

          <Text style={styles.userName}>Rayen Lamine</Text>
          <Text style={styles.userRole}>Utilisateur Invité</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleIcon}>🛡️</Text>
            <Text style={styles.roleText}>Membre 1 — Lead Repo Owner</Text>
          </View>
        </View>

        {/* Carte Contexte Académique */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🎓</Text>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Cadre Académique</Text>
              <Text style={styles.infoValue}>Mini Projet Défi — Services Immobilier</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👨‍🏫</Text>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Enseignant Encadrant</Text>
              <Text style={styles.infoValue}>M. Wahid Hamdi</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Équipe Projet</Text>
              <Text style={styles.infoValue}>3 Membres (M1 : Propriétaire du Dépôt)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📱</Text>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Version de l'application</Text>
              <Text style={styles.infoValue}>DarLink Mobile v2.0.0 (Socle V2)</Text>
            </View>
          </View>
        </View>

        {/* Note Authentification JWT V4 */}
        <View style={styles.authNotice}>
          <Text style={styles.authIcon}>🔐</Text>
          <Text style={styles.authText}>
            Connexion, inscription et gestion du profil JWT prévues en phase V4-T01 à V4-T03.
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: 'rgba(37, 99, 235, 0.6)',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.darkBackground,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  userRole: {
    color: AppColors.darkTextSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginTop: 10,
  },
  roleIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  roleText: {
    color: AppColors.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: AppColors.darkSurface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    color: AppColors.darkTextSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  authNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.darkSurface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.darkBorder,
  },
  authIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  authText: {
    flex: 1,
    color: AppColors.darkTextSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
