// ============================================================
// DARLINK — ÉCRAN DE PROFIL CLIENT LUXE & PROFESSIONNEL (React Native)
// Profil épuré sans photo, orienté client et immobilier, bascule thème
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';

export const ProfileScreen: React.FC = () => {
  const { isDark, toggleTheme, colors } = useTheme();

  const handleAction = (label: string) => {
    Alert.alert(label, `Cette fonctionnalité sera disponible prochainement.`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mon Profil</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. SECTION MONOGRAMME INITIALES & IDENTITÉ ÉPURÉE (AUCUNE PHOTO) */}
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.monogramContainer,
              {
                backgroundColor: isDark ? '#22242D' : '#E9EBF0',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.monogramText, { color: colors.textPrimary }]}>RL</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>

          <Text style={[styles.userName, { color: colors.textPrimary }]}>Rayen Lamine</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            rayen.lamine@darlink.tn
          </Text>

          <View
            style={[
              styles.clientBadge,
              {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.10)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              },
            ]}
          >
            <Text style={styles.badgeDot}>●</Text>
            <Text style={styles.badgeText}>Compte Client Vérifié</Text>
          </View>
        </View>

        {/* 2. BASCULE DU THÈME (MODE SOMBRE / CLAIR) */}
        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.toggleRow}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: isDark ? '#22242D' : '#F0F2F5' },
              ]}
            >
              <Text style={styles.iconEmoji}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Mode sombre</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                {isDark ? 'Palette sombre charcoal activée' : 'Palette blanche épurée activée'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 3. SECTION MES ACTIVITÉS IMMOBILIÈRES */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          MES ACTIVITÉS IMMOBILIÈRES
        </Text>
        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ProfileTile
            icon="♡"
            title="Biens favoris"
            subtitle="Consulter vos coups de cœur enregistrés"
            badge="4"
            onPress={() => handleAction('Biens favoris')}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ProfileTile
            icon="📅"
            title="Visites planifiées"
            subtitle="Vos rendez-vous avec les agents"
            badge="2"
            onPress={() => handleAction('Visites planifiées')}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ProfileTile
            icon="🔔"
            title="Alertes de recherche"
            subtitle="Notifications nouveaux biens sur vos critères"
            onPress={() => handleAction('Alertes de recherche')}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ProfileTile
            icon="📁"
            title="Documents & Dossiers"
            subtitle="Promesses, contrats et pièces justificatives"
            onPress={() => handleAction('Documents & Dossiers')}
            colors={colors}
          />
        </View>

        {/* 4. SECTION SERVICES & FINANCEMENT */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          SERVICES & FINANCEMENT
        </Text>
        <View
          style={[
            styles.cardGroup,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ProfileTile
            icon="🏦"
            title="Simulateur de crédit immobilier"
            subtitle="Calcul des mensualités bancaires en Dinars (TMM)"
            onPress={() => handleAction('Simulateur de crédit')}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ProfileTile
            icon="👩‍💼"
            title="Contacter mon agent dédié"
            subtitle="Sonia Ben Salem — Consultante prestige DarLink"
            onPress={() => handleAction('Contacter mon agent')}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ProfileTile
            icon="🛡️"
            title="Sécurité du compte & Données"
            subtitle="Gestion mot de passe, sessions et confidentialité"
            onPress={() => handleAction('Sécurité du compte')}
            colors={colors}
          />
        </View>

        {/* 5. BOUTON DÉCONNEXION */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDark ? '#1C1618' : '#FEE2E2',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
            },
          ]}
          onPress={() => Alert.alert('Déconnexion', 'Session client fermée.')}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={[styles.appVersion, { color: colors.textTertiary }]}>
          DarLink Mobile v2.0 • Plateforme Immobilière
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

interface ProfileTileProps {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  onPress: () => void;
  colors: any;
}

const ProfileTile: React.FC<ProfileTileProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onPress,
  colors,
}) => {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.tileIconBox, { backgroundColor: colors.background }]}>
        <Text style={styles.tileIconText}>{icon}</Text>
      </View>
      <View style={styles.tileContent}>
        <Text style={[styles.tileTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.tileSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      {badge && (
        <View style={styles.tileBadge}>
          <Text style={styles.tileBadgeText}>{badge}</Text>
        </View>
      )}
      <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 110,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  monogramContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  monogramText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  clientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  badgeDot: {
    color: '#10B981',
    fontSize: 8,
  },
  badgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 18,
    marginLeft: 4,
  },
  cardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 18,
  },
  toggleTextCol: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 11.5,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  tileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tileIconText: {
    fontSize: 16,
  },
  tileContent: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: 11,
  },
  tileBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 6,
  },
  tileBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 18,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginLeft: 58,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 24,
    gap: 8,
  },
  logoutIcon: {
    fontSize: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 16,
  },
});
