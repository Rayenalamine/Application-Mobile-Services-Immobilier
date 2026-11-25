// ============================================================
// DARLINK — ÉCRAN DE PROFIL ET GESTION DE COMPTE (React Native V4)
// Authentification JWT réelle, modification profil, mot de passe,
// annonces publiées et paramètres visuels
// ============================================================

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { authService, UserProfile } from '../../../auth/services/authService';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property, formatPrice } from '../../../properties/domain/models/property';

interface ProfileScreenProps {
  onBack?: () => void;
  onNavigateToAddProperty?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onNavigateToAddProperty,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());

  // Formulaire d'authentification
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('mohamed@darlink.tn');
  const [password, setPassword] = useState('P@ssword2026!');
  const [fullName, setFullName] = useState('Mohamed Ben Ali');
  const [phone, setPhone] = useState('+216 98 111 222');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Annonces publiées par l'utilisateur
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Modales d'édition
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const unsubscribe = authService.subscribe(() => {
      setUser(authService.getCurrentUser());
      setIsAuthenticated(authService.isAuthenticated());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyProperties();
    }
  }, [isAuthenticated]);

  const loadMyProperties = async () => {
    setLoadingProperties(true);
    const props = await propertyApiService.getMyProperties();
    setMyProperties(props);
    setLoadingProperties(false);
  };

  const handleAuthSubmit = async () => {
    setLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setAuthError('Veuillez saisir votre adresse email.');
      setLoading(false);
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setAuthError('Format d\'adresse email invalide (ex: exemple@darlink.tn).');
      setLoading(false);
      return;
    }
    if (!password) {
      setAuthError('Veuillez saisir votre mot de passe.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    let ok = false;
    if (isRegisterMode) {
      if (!fullName.trim()) {
        setAuthError('Veuillez renseigner votre nom complet.');
        setLoading(false);
        return;
      }
      ok = await authService.register(fullName, cleanEmail, password, phone);
    } else {
      ok = await authService.login(cleanEmail, password);
    }

    setLoading(false);
    if (!ok) {
      setAuthError(authService.lastError || 'Échec de l\'authentification.');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom complet est obligatoire.');
      return;
    }
    const success = await authService.updateProfile(editName, editPhone);
    if (success) {
      setIsEditingProfile(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès.');
    } else {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Erreur', 'Veuillez renseigner les deux mots de passe.');
      return;
    }
    const err = await authService.changePassword(currentPassword, newPassword);
    if (!err) {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Succès', 'Mot de passe modifié avec succès.');
    } else {
      Alert.alert('Erreur', err);
    }
  };

  const handleDeleteProperty = async (propId: string, title: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous supprimer l'annonce "${title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await propertyApiService.deleteProperty(propId);
            loadMyProperties();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0F1015' : '#F8FAFC' }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* ======================================================== */}
      {/* VUE 1 : NON AUTHENTIFIÉ (CONNEXION / INSCRIPTION RÉELLE) */}
      {/* ======================================================== */}
      {!isAuthenticated && (
        <View style={styles.authContainer}>
          <View style={[styles.authIconCircle, { backgroundColor: 'rgba(37,99,235,0.1)' }]}>
            <Text style={{ fontSize: 32 }}>🔐</Text>
          </View>
          <Text style={[styles.authTitle, { color: colors.textPrimary }]}>
            {t('auth_welcome_title')}
          </Text>
          <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
            {t('auth_welcome_sub')}
          </Text>

          {/* SÉLECTEUR D'ONGLETS */}
          <View
            style={[
              styles.tabSelector,
              { backgroundColor: isDark ? '#1E2028' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                !isRegisterMode && { backgroundColor: colors.accentBlue },
              ]}
              onPress={() => setIsRegisterMode(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: !isRegisterMode ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('login_tab')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                isRegisterMode && { backgroundColor: colors.accentBlue },
              ]}
              onPress={() => setIsRegisterMode(true)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isRegisterMode ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('register_tab')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* BANNIÈRE D'ERREUR */}
          {authError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {authError}</Text>
            </View>
          )}

          {/* FORMULAIRE */}
          {isRegisterMode && (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceElevated,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={t('full_name_label')}
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceElevated,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={t('phone_label')}
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </>
          )}

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceElevated,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder={t('email_label')}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceElevated,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder={t('password_label')}
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.accentBlue }]}
            onPress={handleAuthSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegisterMode ? t('register_tab') : t('login_tab')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoFillBtn}
            onPress={() => {
              setIsRegisterMode(false);
              setEmail('mohamed@darlink.tn');
              setPassword('P@ssword2026!');
            }}
          >
            <Text style={{ color: colors.accentBlue, fontSize: 13, textAlign: 'center' }}>
              {t('demo_account_hint')} (Mohamed Ben Ali)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ======================================================== */}
      {/* VUE 2 : AUTHENTIFIÉ (PROFIL DYNAMIQUE POSTGRESQL) */}
      {/* ======================================================== */}
      {isAuthenticated && user && (
        <View style={styles.profileSection}>
          {/* CARTE D'EN-TÊTE PROFIL */}
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.avatarCircle, { backgroundColor: colors.accentBlue }]}>
              <Text style={styles.avatarText}>
                {user.fullName
                  .split(' ')
                  .map((e) => e[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.fullName}</Text>
                <View style={[styles.roleBadge, { backgroundColor: 'rgba(37,99,235,0.15)' }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.accentBlue }]}>
                    {user.role}
                  </Text>
                </View>
              </View>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              {user.phone && (
                <Text style={[styles.userPhone, { color: colors.textSecondary }]}>📞 {user.phone}</Text>
              )}
            </View>
          </View>

          {/* ACTIONS PROFIL */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { borderColor: colors.accentBlue, backgroundColor: 'transparent' },
              ]}
              onPress={() => {
                setEditName(user.fullName);
                setEditPhone(user.phone || '');
                setIsEditingProfile(true);
              }}
            >
              <Text style={[styles.actionBtnText, { color: colors.accentBlue }]}>
                ✏️ {t('edit_profile')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                { borderColor: colors.border, backgroundColor: 'transparent' },
              ]}
              onPress={() => setIsChangingPassword(true)}
            >
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                🔒 {t('password_label')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* FORMULAIRE ÉDITION DU PROFIL */}
          {isEditingProfile && (
            <View
              style={[
                styles.editBox,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.editBoxTitle, { color: colors.textPrimary }]}>
                {t('edit_profile')}
              </Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder={t('full_name_label')}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder={t('phone_label')}
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.editBoxActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => setIsEditingProfile(false)}
                >
                  <Text style={{ color: colors.textSecondary }}>{t('btn_cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.accentBlue }]}
                  onPress={handleUpdateProfile}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{t('btn_save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* FORMULAIRE CHANGEMENT DE MOT DE PASSE */}
          {isChangingPassword && (
            <View
              style={[
                styles.editBox,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.editBoxTitle, { color: colors.textPrimary }]}>
                {t('change_password_title')}
              </Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder={t('current_password_placeholder')}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('new_password_placeholder')}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <View style={styles.editBoxActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => setIsChangingPassword(false)}
                >
                  <Text style={{ color: colors.textSecondary }}>{t('btn_cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.accentBlue }]}
                  onPress={handleChangePassword}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{t('btn_save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* BOUTON DÉPOSER UNE ANNONCE */}
          <TouchableOpacity
            style={[styles.addPropButton, { backgroundColor: colors.accentBlue }]}
            onPress={() => onNavigateToAddProperty && onNavigateToAddProperty()}
          >
            <Text style={styles.addPropButtonText}>🏠 {t('btn_publish')}</Text>
          </TouchableOpacity>

          {/* MES ANNONCES PUBLIÉES */}
          <View style={styles.myPropsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('my_listings')} ({myProperties.length})
            </Text>
            <TouchableOpacity onPress={loadMyProperties}>
              <Text style={{ color: colors.accentBlue, fontSize: 13 }}>{t('btn_refresh')} 🔄</Text>
            </TouchableOpacity>
          </View>

          {loadingProperties ? (
            <ActivityIndicator color={colors.accentBlue} style={{ marginVertical: 16 }} />
          ) : myProperties.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
                {t('no_published_listings')}
              </Text>
            </View>
          ) : (
            myProperties.map((prop) => (
              <View
                key={prop.id}
                style={[
                  styles.myPropCard,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <Image source={{ uri: prop.imageUrl }} style={styles.myPropImage} />
                <View style={styles.myPropContent}>
                  <Text style={[styles.myPropTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {prop.titre}
                  </Text>
                  <Text style={[styles.myPropPrice, { color: colors.accentBlue }]}>
                    {formatPrice(prop.prix)} • {prop.localisation}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteProperty(prop.id || '1', prop.titre)}
                  style={styles.deleteBtn}
                >
                  <Text style={{ fontSize: 18 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {/* ======================================================== */}
      {/* PRÉFÉRENCES : THÈME ET LANGUES */}
      {/* ======================================================== */}
      <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>
        {t('account_settings')}
      </Text>

      {/* MODE SOMBRE / CLAIR */}
      <View
        style={[
          styles.settingRow,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
          {isDark ? `🌙 ${t('theme_dark')}` : `☀️ ${t('theme_light')}`}
        </Text>
        <TouchableOpacity
          style={[
            styles.themeSwitchBtn,
            { backgroundColor: isDark ? colors.accentBlue : '#E2E8F0' },
          ]}
          onPress={toggleTheme}
        >
          <Text style={{ color: isDark ? '#FFFFFF' : '#0F1015', fontWeight: 'bold', fontSize: 12 }}>
            {t('toggle_theme')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LANGUE DE L'APPLICATION */}
      <View
        style={[
          styles.settingRow,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
          🌐 {t('language_choice')}
        </Text>
        <TouchableOpacity
          style={[styles.langBadge, { backgroundColor: 'rgba(37,99,235,0.1)' }]}
          onPress={() => {
            if (language === 'fr') setLanguage('ar');
            else if (language === 'ar') setLanguage('en');
            else setLanguage('fr');
          }}
        >
          <Text style={{ color: colors.accentBlue, fontWeight: 'bold', fontSize: 12 }}>
            {language === 'fr' ? 'Français (FR)' : language === 'ar' ? 'العربية (AR)' : 'English (EN)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOUTON DÉCONNEXION */}
      {isAuthenticated && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => authService.logout()}
        >
          <Text style={styles.logoutButtonText}>🚪 {t('btn_logout')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 120 },
  authContainer: { alignItems: 'stretch', marginTop: 10 },
  authIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  authTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  authSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  tabSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: 'bold' },
  errorBanner: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    marginBottom: 16,
  },
  errorText: { color: '#EF4444', fontSize: 12 },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  demoFillBtn: { marginTop: 14, padding: 8 },
  profileSection: { marginBottom: 20 },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  userInfo: { flex: 1, marginLeft: 14 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { fontSize: 16, fontWeight: 'bold' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleBadgeText: { fontSize: 10, fontWeight: 'bold' },
  userEmail: { fontSize: 12, marginTop: 2 },
  userPhone: { fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 12, fontWeight: 'bold' },
  editBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  editBoxTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  editBoxActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addPropButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  addPropButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  myPropsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  emptyCard: { padding: 20, borderRadius: 14, borderWidth: 1 },
  myPropCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  myPropImage: { width: 65, height: 55, borderRadius: 8 },
  myPropContent: { flex: 1, marginLeft: 12 },
  myPropTitle: { fontSize: 13, fontWeight: 'bold' },
  myPropPrice: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8 },
  settingsTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 10 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  settingLabel: { fontSize: 13, fontWeight: '600' },
  themeSwitchBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  langBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  logoutButtonText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
});
