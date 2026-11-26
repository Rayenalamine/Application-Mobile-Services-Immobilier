// ============================================================
// DARLINK — ÉCRAN COMPTE, PROFIL, DEMANDES, NOTIFICATIONS & PARAMÈTRES (React Native)
// Cycle complet Firebase Auth (Inscription + force MDP + confirmation + vérification email,
// Connexion, Mot de passe oublié, Changement email/MDP avec réauthentification,
// Édition profil, Suppression de compte), Icônes Lucide, zéro emoji.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import {
  Lock,
  AlertTriangle,
  Phone,
  Edit3,
  KeyRound,
  Mail,
  Trash2,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  LogOut,
  CheckCircle2,
  Bell,
  MessageSquare,
  Building2,
} from 'lucide-react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import {
  authService,
  UserProfile,
  evaluatePasswordStrength,
} from '../../../auth/services/authService';
import { contactApiService, ContactRequest } from '../../../contact/services/contactApiService';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property, formatPrice } from '../../../properties/domain/models/property';
import { AppNotification } from '../../../properties/domain/models/relationships';

interface ProfileScreenProps {
  onBack?: () => void;
  onNavigateToAddProperty?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateToAddProperty }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage, translateListingStatus } = useTranslation();

  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());

  // Formulaire auth (champs vierges par défaut — zéro compte test pré-rempli)
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestedRole, setRequestedRole] = useState<'USER' | 'OWNER' | 'AGENCY'>('USER');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);

  // Données relationnelles
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ContactRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Modales gestion compte
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [emailModal, setEmailModal] = useState(false);
  const [newEmailVal, setNewEmailVal] = useState('');

  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmailVal, setResetEmailVal] = useState('');

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    const [props, reqs, notifs] = await Promise.all([
      propertyApiService.getMyProperties(),
      contactApiService.getReceivedRequests(),
      contactApiService.getMyNotifications(),
    ]);
    setMyProperties(props);
    setReceivedRequests(reqs);
    setNotifications(notifs);
    setLoadingDashboard(false);
  }, []);

  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setUser(authService.getCurrentUser());
      setIsAuthenticated(authService.isAuthenticated());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, loadDashboard]);

  const strength = evaluatePasswordStrength(password);

  const handleAuthSubmit = async () => {
    setLoading(true);
    setAuthError(null);
    setInfoBanner(null);

    const ok = isRegisterMode
      ? await authService.register(fullName, email, password, phone, requestedRole, confirmPassword)
      : await authService.login(email, password);

    setLoading(false);
    if (!ok) {
      setAuthError(authService.lastError || 'Échec de l’authentification.');
    } else if (isRegisterMode) {
      setInfoBanner('Compte créé ! Un e-mail de vérification vient d’être envoyé à votre adresse.');
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom complet est requis.');
      return;
    }
    const ok = await authService.updateProfile(editName, editPhone, editPhoto.trim() || undefined);
    setEditModal(false);
    Alert.alert(ok ? 'Succès' : 'Erreur', ok ? 'Profil mis à jour.' : 'Mise à jour refusée.');
  };

  const handleChangePassword = async () => {
    const err = await authService.changePassword(currentPassword, newPassword);
    if (!err) {
      setPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Succès', 'Mot de passe mis à jour.');
    } else {
      Alert.alert('Erreur', err);
    }
  };

  const handleChangeEmail = async () => {
    const err = await authService.changeEmail(currentPassword, newEmailVal);
    if (!err) {
      setEmailModal(false);
      setCurrentPassword('');
      setNewEmailVal('');
      Alert.alert('E-mail mis à jour', 'Un nouvel e-mail de vérification a été envoyé.');
    } else {
      Alert.alert('Erreur', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Confirmation requise', 'Entrez votre mot de passe actuel pour confirmer.');
      return;
    }
    const err = await authService.deleteAccount(deletePassword);
    if (!err) {
      setDeleteModal(false);
      setDeletePassword('');
      Alert.alert('Compte supprimé', 'Votre compte et vos données personnelles ont été supprimés.');
    } else {
      Alert.alert('Erreur', err);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.eyebrow, { color: colors.accentChampagne }]}>ESPACE PERSONNEL</Text>
      <Text style={[styles.pageHeading, { color: colors.textPrimary }]}>
        {isAuthenticated && user ? user.fullName : 'Mon Profil'}
      </Text>

      {!isAuthenticated && (
        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: isDark ? 'rgba(22, 24, 30, 0.86)' : 'rgba(255, 255, 255, 0.94)',
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.authIconCircle,
              {
                backgroundColor: 'rgba(154, 123, 79, 0.14)',
                borderColor: 'rgba(154, 123, 79, 0.35)',
                borderWidth: 1,
              },
            ]}
          >
            <Lock size={26} color={colors.accentChampagne} />
          </View>
          <Text style={[styles.authTitle, { color: colors.textPrimary }]}>Espace DarLink</Text>
          <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
            Connectez-vous ou créez un compte sécurisé Firebase pour gérer vos biens et favoris.
          </Text>

          <View
            style={[
              styles.tabSelector,
              { backgroundColor: isDark ? '#1A1C22' : '#F2F2F7', borderColor: 'transparent' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                !isRegisterMode && { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' },
              ]}
              onPress={() => {
                setIsRegisterMode(false);
                setAuthError(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: !isRegisterMode ? (isDark ? '#1D1D1F' : '#FFFFFF') : colors.textSecondary },
                ]}
              >
                Connexion
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                isRegisterMode && { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' },
              ]}
              onPress={() => {
                setIsRegisterMode(true);
                setAuthError(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isRegisterMode ? (isDark ? '#1D1D1F' : '#FFFFFF') : colors.textSecondary },
                ]}
              >
                Inscription
              </Text>
            </TouchableOpacity>
          </View>

          {authError && (
            <View style={styles.errorBanner}>
              <AlertTriangle size={16} color="#DC2626" />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {isRegisterMode && (
            <>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? '#1E2128' : '#F5F5F7', color: colors.textPrimary, borderColor: colors.border },
                ]}
                placeholder="Nom et prénom"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? '#1E2128' : '#F5F5F7', color: colors.textPrimary, borderColor: colors.border },
                ]}
                placeholder="Téléphone (+216)"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>TYPE DE COMPTE</Text>
              <View style={styles.roleRow}>
                {[
                  { key: 'USER', label: 'Particulier' },
                  { key: 'OWNER', label: 'Propriétaire' },
                  { key: 'AGENCY', label: 'Agence' },
                ].map((r) => {
                  const active = requestedRole === r.key;
                  return (
                    <TouchableOpacity
                      key={r.key}
                      style={[
                        styles.roleChip,
                        {
                          backgroundColor: active
                            ? isDark
                              ? '#F5F5F7'
                              : '#1D1D1F'
                            : isDark
                            ? '#1E2128'
                            : '#F5F5F7',
                          borderColor: active ? 'transparent' : colors.border,
                        },
                      ]}
                      onPress={() => setRequestedRole(r.key as 'USER' | 'OWNER' | 'AGENCY')}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: active ? (isDark ? '#1D1D1F' : '#FFFFFF') : colors.textSecondary,
                        }}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E2128' : '#F5F5F7', color: colors.textPrimary, borderColor: colors.border },
            ]}
            placeholder="Adresse e-mail"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#1E2128' : '#F5F5F7', color: colors.textPrimary, borderColor: colors.border },
            ]}
            placeholder="Mot de passe"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isRegisterMode && (
            <>
              {password.length > 0 && (
                <View style={styles.strengthBox}>
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: strength.valid ? '#16A34A' : '#D97706' }}>
                    Robustesse : {strength.label}
                  </Text>
                  {strength.issues.length > 0 && (
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Requis : {strength.issues.join(' • ')}
                    </Text>
                  )}
                </View>
              )}
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? '#1E2128' : '#F5F5F7', color: colors.textPrimary, borderColor: colors.border },
                ]}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]}
            onPress={handleAuthSubmit}
            disabled={loading}
            activeOpacity={0.86}
          >
            {loading ? (
              <ActivityIndicator color={isDark ? '#1D1D1F' : '#FFFFFF'} />
            ) : (
              <Text style={[styles.submitButtonText, { color: isDark ? '#1D1D1F' : '#FFFFFF' }]}>
                {isRegisterMode ? 'Créer mon compte' : 'Se connecter'}
              </Text>
            )}
          </TouchableOpacity>

          {!isRegisterMode && (
            <TouchableOpacity
              style={{ marginTop: 14, alignItems: 'center' }}
              onPress={() => {
                setResetEmailVal(email);
                setForgotModal(true);
              }}
            >
              <Text style={{ color: colors.accentChampagne, fontSize: 13, fontWeight: '600' }}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isAuthenticated && user && (
        <View style={styles.profileSection}>
          {infoBanner && (
            <View style={[styles.infoBanner, { borderColor: colors.accentChampagne, backgroundColor: 'rgba(154,123,79,0.08)' }]}>
              <Text style={{ color: colors.accentChampagne, fontSize: 12, fontWeight: '600' }}>{infoBanner}</Text>
            </View>
          )}

          {/* CARTE UTILISATEUR LIQUID GLASS */}
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: isDark ? 'rgba(22, 24, 30, 0.88)' : 'rgba(255, 255, 255, 0.94)',
                borderColor: colors.border,
              },
            ]}
          >
            {user.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={[styles.avatarImg, { borderColor: colors.accentChampagne, borderWidth: 1.5 }]} />
            ) : (
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F',
                    borderColor: colors.accentChampagne,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={[styles.avatarText, { color: isDark ? '#1D1D1F' : '#FFFFFF' }]}>
                  {user.fullName
                    .split(' ')
                    .map((e) => e[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.fullName}</Text>
                <View style={[styles.roleBadge, { backgroundColor: 'rgba(154,123,79,0.14)' }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.accentChampagne }]}>{user.role}</Text>
                </View>
              </View>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              {user.phone ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <Phone size={12} color={colors.accentChampagne} />
                  <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{user.phone}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* VÉRIFICATION EMAIL RÉELLE */}
          <View
            style={[
              styles.verifyBanner,
              {
                backgroundColor: user.emailVerified ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)',
                borderColor: user.emailVerified ? 'rgba(22,163,74,0.3)' : 'rgba(217,119,6,0.3)',
              },
            ]}
          >
            <CheckCircle2 size={17} color={user.emailVerified ? '#16A34A' : '#D97706'} />
            <Text style={{ flex: 1, fontSize: 12.5, color: colors.textPrimary, fontWeight: '600' }}>
              {user.emailVerified ? 'Adresse e-mail vérifiée' : 'E-mail non vérifié'}
            </Text>
            {!user.emailVerified && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={async () => {
                    const sent = await authService.resendVerificationEmail();
                    Alert.alert(sent ? 'E-mail envoyé' : 'Erreur', sent ? 'Vérifiez votre boîte de réception.' : authService.lastError || 'Échec');
                  }}
                >
                  <Text style={{ color: colors.accentChampagne, fontSize: 12, fontWeight: '700' }}>Renvoyer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    const ok = await authService.refreshVerificationStatus();
                    Alert.alert('Statut', ok ? 'E-mail confirmé !' : 'Pas encore vérifié dans Firebase.');
                  }}
                >
                  <Text style={{ color: '#16A34A', fontSize: 12, fontWeight: '700' }}>Actualiser</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ACTIONS COMPTE */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => {
                setEditName(user.fullName);
                setEditPhone(user.phone || '');
                setEditPhoto(user.photoUrl || '');
                setEditModal(true);
              }}
            >
              <Edit3 size={14} color={colors.accentChampagne} />
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>{t('edit_profile_dialog')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setEmailModal(true)}
            >
              <Mail size={14} color={colors.accentChampagne} />
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>{t('change_email')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setPasswordModal(true)}
            >
              <KeyRound size={14} color={colors.accentChampagne} />
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>{t('change_password')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addPropButton, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]}
            onPress={() => onNavigateToAddProperty && onNavigateToAddProperty()}
            activeOpacity={0.86}
          >
            <Plus size={18} color={isDark ? '#1D1D1F' : '#FFFFFF'} />
            <Text style={[styles.addPropButtonText, { color: isDark ? '#1D1D1F' : '#FFFFFF' }]}>
              {t('add_title')}
            </Text>
          </TouchableOpacity>

          {/* MES ANNONCES */}
          <View style={styles.myPropsHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Building2 size={16} color={colors.accentChampagne} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {t('my_listings')} ({myProperties.length})
              </Text>
            </View>
            <TouchableOpacity onPress={loadDashboard}>
              <RefreshCw size={17} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loadingDashboard ? (
            <ActivityIndicator color={colors.accentChampagne} style={{ marginVertical: 12 }} />
          ) : myProperties.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{t('no_listings')}</Text>
            </View>
          ) : (
            myProperties.map((prop) => (
              <View key={prop.id} style={[styles.myPropCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.myPropTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {prop.titre}
                  </Text>
                  <Text style={[styles.myPropPrice, { color: colors.accentChampagne }]}>
                    {formatPrice(prop.prix, Boolean(prop.estLocation), Boolean(prop.priceOnRequest))} • {translateListingStatus(prop.listingStatus || 'DRAFT')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(t('btn_delete'), t('delete_confirm_msg'), [
                      { text: t('btn_cancel'), style: 'cancel' },
                      {
                        text: t('btn_delete'),
                        style: 'destructive',
                        onPress: async () => {
                          await propertyApiService.deleteProperty(prop.id || '');
                          loadDashboard();
                        },
                      },
                    ])
                  }
                  style={{ padding: 6 }}
                >
                  <Trash2 size={17} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* DEMANDES DE CONTACT & NOTIFICATIONS */}
          <View style={styles.myPropsHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={16} color={colors.accentChampagne} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Demandes reçues ({receivedRequests.length})
              </Text>
            </View>
          </View>
          {receivedRequests.slice(0, 5).map((req) => (
            <View key={req.id} style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                {req.senderName} ({req.status})
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{req.message}</Text>
            </View>
          ))}

          <View style={styles.myPropsHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Bell size={16} color={colors.accentChampagne} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Notifications ({notifications.length})
              </Text>
            </View>
          </View>
          {notifications.slice(0, 5).map((n) => (
            <View key={n.id} style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 8 }]}>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 13 }}>{n.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{n.body}</Text>
            </View>
          ))}
        </View>
      )}

      {/* PRÉFÉRENCES STYLE APPLE GROUPÉ */}
      <Text style={[styles.settingsSectionLabel, { color: colors.textSecondary }]}>PRÉFÉRENCES</Text>
      <View
        style={[
          styles.settingsGroup,
          {
            backgroundColor: isDark ? 'rgba(22, 24, 30, 0.86)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.settingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.settingIconBox, { backgroundColor: 'rgba(154,123,79,0.14)' }]}>
              {isDark ? <Moon size={17} color={colors.accentChampagne} /> : <Sun size={17} color={colors.accentChampagne} />}
            </View>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
              {isDark ? 'Mode sombre' : 'Mode clair'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.themeSwitchBtn, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]}
            onPress={toggleTheme}
          >
            <Text style={{ color: isDark ? '#1D1D1F' : '#FFFFFF', fontWeight: '600', fontSize: 12 }}>Basculer</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.groupDivider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.settingIconBox, { backgroundColor: 'rgba(154,123,79,0.14)' }]}>
              <Globe size={17} color={colors.accentChampagne} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('language_choice')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.langBadge, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => {
              if (language === 'fr') setLanguage('ar');
              else if (language === 'ar') setLanguage('en');
              else setLanguage('fr');
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 12 }}>
              {language === 'fr' ? 'Français' : language === 'ar' ? 'العربية' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isAuthenticated && (
        <View style={{ gap: 10, marginTop: 18 }}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => authService.logout()}
          >
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.logoutButtonText}>{t('btn_logout')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', padding: 10 }} onPress={() => setDeleteModal(true)}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Supprimer définitivement mon compte
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODALE MOT DE PASSE OUBLIÉ */}
      <Modal visible={forgotModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Réinitialiser le mot de passe</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              placeholder="Votre adresse e-mail"
              placeholderTextColor={colors.textSecondary}
              value={resetEmailVal}
              onChangeText={setResetEmailVal}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setForgotModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]}
                onPress={async () => {
                  const err = await authService.sendPasswordResetEmail(resetEmailVal);
                  setForgotModal(false);
                  Alert.alert(err ? 'Erreur' : 'E-mail envoyé', err || 'Consultez votre boîte mail pour choisir un nouveau mot de passe.');
                }}
              >
                <Text style={{ color: isDark ? '#1D1D1F' : '#FFFFFF', fontWeight: '600' }}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODALE ÉDITION PROFIL */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Modifier mon profil</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nom complet"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Téléphone"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              value={editPhoto}
              onChangeText={setEditPhoto}
              placeholder="URL photo de profil (HTTPS, optionnel)"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]} onPress={handleSaveProfile}>
                <Text style={{ color: isDark ? '#1D1D1F' : '#FFFFFF', fontWeight: '600' }}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODALE CHANGER MOT DE PASSE */}
      <Modal visible={passwordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Changer de mot de passe</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mot de passe actuel"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nouveau mot de passe (min 8 car., Maj + Chiffre)"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPasswordModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]} onPress={handleChangePassword}>
                <Text style={{ color: isDark ? '#1D1D1F' : '#FFFFFF', fontWeight: '600' }}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODALE CHANGER EMAIL */}
      <Modal visible={emailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Changer d’adresse e-mail</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mot de passe actuel (réauthentification)"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              value={newEmailVal}
              onChangeText={setNewEmailVal}
              placeholder="Nouvel e-mail"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEmailModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F' }]} onPress={handleChangeEmail}>
                <Text style={{ color: isDark ? '#1D1D1F' : '#FFFFFF', fontWeight: '600' }}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODALE SUPPRESSION COMPTE */}
      <Modal visible={deleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: '#DC2626' }]}>Suppression du compte</Text>
            <Text style={{ fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginBottom: 12 }}>
              Vos annonces seront archivées et anonymisées, et vos favoris supprimés. Cette action est irréversible.
            </Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: isDark ? '#1E2128' : '#F5F5F7' }]}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Confirmez avec votre mot de passe"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#DC2626' }]} onPress={handleDeleteAccount}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 18, paddingBottom: 130 },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 0.9, marginBottom: 4 },
  pageHeading: { fontSize: 26, fontWeight: '700', letterSpacing: -0.6, marginBottom: 18 },
  glassCard: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 4,
  },
  authIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  authTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.45, textAlign: 'center' },
  authSubtitle: { fontSize: 13.5, lineHeight: 19, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  tabSelector: { flexDirection: 'row', padding: 4, borderRadius: 999, marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabText: { fontSize: 13.5, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(220,38,38,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.28)',
    marginBottom: 14,
  },
  errorText: { color: '#DC2626', fontSize: 12.5, flex: 1 },
  infoBanner: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 0.9,
    marginBottom: 10,
    fontSize: 14.5,
  },
  roleLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, marginTop: 2, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleChip: { flex: 1, paddingVertical: 10, borderRadius: 999, borderWidth: 0.9, alignItems: 'center' },
  strengthBox: { marginBottom: 10, paddingHorizontal: 4 },
  submitButton: { height: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitButtonText: { fontWeight: '600', fontSize: 15, letterSpacing: -0.15 },
  profileSection: { marginBottom: 18 },
  userCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 26,
    borderWidth: 0.9,
    alignItems: 'center',
  },
  avatarCircle: { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 58, height: 58, borderRadius: 29 },
  avatarText: { fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: 14 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  userName: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  roleBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  userEmail: { fontSize: 12.5, marginTop: 2 },
  userPhone: { fontSize: 12 },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 0.9,
    marginTop: 12,
  },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 0.9,
  },
  actionBtnText: { fontSize: 12.5, fontWeight: '600' },
  addPropButton: {
    flexDirection: 'row',
    gap: 8,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addPropButtonText: { fontWeight: '600', fontSize: 14.5 },
  myPropsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.25 },
  emptyCard: { padding: 14, borderRadius: 16, borderWidth: 0.9 },
  myPropCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    borderWidth: 0.9,
    alignItems: 'center',
    marginBottom: 8,
  },
  myPropTitle: { fontSize: 14, fontWeight: '600' },
  myPropPrice: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  settingsSectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  settingsGroup: { borderRadius: 24, borderWidth: 0.9, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  groupDivider: { height: 0.8, marginLeft: 62, opacity: 0.5 },
  settingLabel: { fontSize: 14.5, fontWeight: '600' },
  themeSwitchBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  langBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  logoutButton: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    height: 50,
    borderRadius: 999,
    borderWidth: 0.9,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 14.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 28, padding: 22, borderWidth: 0.9 },
  modalTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999 },
});
