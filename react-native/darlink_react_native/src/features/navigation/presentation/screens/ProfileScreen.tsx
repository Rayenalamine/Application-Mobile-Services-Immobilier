// ============================================================
// DARLINK — ÉCRAN DE PROFIL CLIENT LUXE & PROFESSIONNEL (React Native)
// Profil épuré sans photo, orienté client et immobilier, bascule thème
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { authService, UserProfile } from '../../../auth/services/authService';
import { AddPropertyScreen } from '../../../properties/presentation/screens/AddPropertyScreen';
import { MapScreen } from '../../../map/presentation/screens/MapScreen';
import { contactApiService, ContactRequest } from '../../../contact/services/contactApiService';

export const ProfileScreen: React.FC = () => {
  const { isDark, toggleTheme, colors } = useTheme();
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authEmail, setAuthEmail] = useState('rayen.lamine@darlink.tn');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authName, setAuthName] = useState('Rayen Lamine');
  const [authLoading, setAuthLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(currentUser.fullName);
  const [editPhone, setEditPhone] = useState(currentUser.phone ?? '+216 20 123 456');

  const [showInquiriesModal, setShowInquiriesModal] = useState(false);
  const [inquiries, setInquiries] = useState<ContactRequest[]>([]);

  const handleOpenInquiries = async () => {
    const list = await contactApiService.getReceivedRequests();
    setInquiries(list);
    setShowInquiriesModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom complet.');
      return;
    }
    await authService.updateProfile(editName.trim(), editPhone.trim());
    setCurrentUser(authService.getCurrentUser());
    setShowEditModal(false);
    Alert.alert('Succès', 'Profil mis à jour dans PostgreSQL !');
  };

  const initials = currentUser.fullName
    .split(' ')
    .map((p: string) => p[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RL';

  const handleAuthSubmit = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir votre email et mot de passe.');
      return;
    }
    setAuthLoading(true);
    let ok = false;
    if (isRegister) {
      ok = await authService.register(authName.trim(), authEmail.trim(), authPassword.trim());
    } else {
      ok = await authService.login(authEmail.trim(), authPassword.trim());
    }
    setAuthLoading(false);
    if (ok) {
      setCurrentUser(authService.getCurrentUser());
      setShowAuthModal(false);
      Alert.alert('Succès', isRegister ? 'Compte créé avec succès !' : 'Connexion réussie !');
    } else {
      Alert.alert('Erreur', 'Impossible de se connecter.');
    }
  };

  const handleAction = (label: string) => {
    Alert.alert(label, `Action validée pour le compte de ${currentUser.fullName}.`);
  };

  if (showAddProperty) {
    return <AddPropertyScreen onBack={() => setShowAddProperty(false)} />;
  }

  if (showMap) {
    return <MapScreen onBack={() => setShowMap(false)} />;
  }

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
          <TouchableOpacity
            style={[
              styles.monogramContainer,
              {
                backgroundColor: isDark ? '#22242D' : '#E9EBF0',
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowAuthModal(true)}
          >
            <Text style={[styles.monogramText, { color: colors.textPrimary }]}>{initials}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{currentUser.fullName}</Text>
            <TouchableOpacity onPress={() => setShowEditModal(true)} activeOpacity={0.7}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {currentUser.email}
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
            icon="➕"
            title="Déposer une annonce"
            subtitle="Publier un bien immobilier haut standing (V7)"
            onPress={() => setShowAddProperty(true)}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ProfileTile
            icon="🗺️"
            title="Carte des biens en Tunisie"
            subtitle="Cartographie et repères GPS interactifs (V8)"
            onPress={() => setShowMap(true)}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
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
            icon="📬"
            title="Demandes de visite reçues"
            subtitle="Consulter les messages des acheteurs"
            badge={inquiries.length > 0 ? String(inquiries.length) : undefined}
            onPress={handleOpenInquiries}
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

        {/* 5. BOUTON DÉCONNEXION & CHANGEMENT DE COMPTE */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDark ? '#181920' : '#EFF6FF',
              borderColor: isDark ? 'rgba(37, 99, 235, 0.4)' : 'rgba(37, 99, 235, 0.25)',
            },
          ]}
          onPress={() => setShowAuthModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🔄</Text>
          <Text style={[styles.logoutText, { color: '#2563EB' }]}>
            Changer de compte / Se connecter
          </Text>
        </TouchableOpacity>

        <Text style={[styles.appVersion, { color: colors.textTertiary }]}>
          DarLink Mobile v2.0 • Plateforme Immobilière
        </Text>
      </ScrollView>

      {/* MODAL AUTHENTIFICATION / LOGIN / REGISTER */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalBar} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {isRegister ? 'Créer un compte DarLink' : 'Connexion Client DarLink'}
            </Text>

            {isRegister && (
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Nom complet"
                placeholderTextColor={colors.textSecondary}
                value={authName}
                onChangeText={setAuthName}
              />
            )}

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Adresse email"
              placeholderTextColor={colors.textSecondary}
              value={authEmail}
              onChangeText={setAuthEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={authPassword}
              onChangeText={setAuthPassword}
            />

            <TouchableOpacity
              style={[styles.modalSubmitBtn, { backgroundColor: isDark ? '#FFFFFF' : '#0F1015' }]}
              onPress={handleAuthSubmit}
              disabled={authLoading}
            >
              <Text style={[styles.modalSubmitText, { color: isDark ? '#0F1015' : '#FFFFFF' }]}>
                {authLoading ? 'Chargement...' : isRegister ? 'Créer mon compte' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalToggleBtn}
              onPress={() => setIsRegister(!isRegister)}
            >
              <Text style={styles.modalToggleText}>
                {isRegister ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowAuthModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL MODIFIER PROFIL */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalBar} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Modifier mes coordonnées</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Nom complet"
              placeholderTextColor={colors.textSecondary}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Numéro de téléphone"
              placeholderTextColor={colors.textSecondary}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={[styles.modalSubmitBtn, { backgroundColor: isDark ? '#FFFFFF' : '#0F1015' }]}
              onPress={handleUpdateProfile}
            >
              <Text style={[styles.modalSubmitText, { color: isDark ? '#0F1015' : '#FFFFFF' }]}>Enregistrer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowEditModal(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DEMANDES DE CONTACT REÇUES */}
      <Modal visible={showInquiriesModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, maxHeight: '80%' }]}>
            <View style={styles.modalBar} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Demandes de visite reçues ({inquiries.length})
            </Text>
            {inquiries.length === 0 ? (
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 24 }}>
                Aucune demande reçue pour le moment.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
                {inquiries.map((inq) => (
                  <View key={inq.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border }}>
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{inq.senderName}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{inq.senderEmail} • {inq.senderPhone}</Text>
                    <Text style={{ fontSize: 13, color: colors.textPrimary, fontStyle: 'italic', marginTop: 4 }}>
                      "{inq.message}"
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowInquiriesModal(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 24,
    paddingBottom: 40,
  },
  modalBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  modalSubmitBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalToggleBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  modalToggleText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
  },
  modalCloseBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 13,
  },
});
