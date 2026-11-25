// ============================================================
// DARLINK — ÉCRAN DE PROFIL ET GESTION DE COMPTE (React Native)
// Authentification JWT/Firebase, profil, annonces & préférences
// Icônes vectorielles Lucide, Design System unifié & support RTL
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
import {
  LockKeyhole,
  TriangleExclamationPoint,
  Phone,
  Pencil,
  House,
  Plus,
  RefreshCw,
  Trash,
  Moon,
  Sun,
  Languages,
  LogOut,
  Mail,
  User as UserIcon,
  Settings,
  Eye,
  EyeOff,
  MapPin,
} from 'lucide-react-native';
import { AppShadows } from '../../../../core/constants/spacing';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { useBottomNavClearance } from '../../../../core/components/FloatingBottomNav';
import { authService, UserProfile } from '../../../auth/services/authService';
import { propertyApiService } from '../../../properties/services/propertyApiService';
import { Property } from '../../../properties/domain/models/property';
import { AddPropertyScreen } from '../../../properties/presentation/screens/AddPropertyScreen';

interface ProfileScreenProps {
  onBack?: () => void;
  onNavigateToAddProperty?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToAddProperty,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage, isRTL, formatPrice } = useTranslation();
  const bottomClearance = useBottomNavClearance();

  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [showAddScreen, setShowAddScreen] = useState<boolean>(false);

  // Formulaire d'authentification
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('mohamed@darlink.tn');
  const [password, setPassword] = useState('P@ssword2026!');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleOpenAddProperty = () => {
    if (onNavigateToAddProperty) {
      onNavigateToAddProperty();
    } else {
      setShowAddScreen(true);
    }
  };

  if (showAddScreen) {
    return (
      <AddPropertyScreen
        onBack={() => setShowAddScreen(false)}
        onPropertyCreated={() => {
          loadMyProperties();
        }}
      />
    );
  }

  const cycleLanguage = () => {
    if (language === 'fr') setLanguage('ar');
    else if (language === 'ar') setLanguage('en');
    else setLanguage('fr');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomClearance }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ======================================================== */}
      {/* VUE 1 : NON AUTHENTIFIÉ (CONNEXION / INSCRIPTION)        */}
      {/* ======================================================== */}
      {!isAuthenticated && (
        <View style={styles.authContainer}>
          {/* Illustration vectorielle de bienvenue */}
          <View style={styles.welcomeIllustrationWrap}>
            <View
              style={[
                styles.authIconOuterRing,
                { backgroundColor: colors.accentBlueSoft },
              ]}
            >
              <View
                style={[
                  styles.authIconCircle,
                  { backgroundColor: colors.accentBlue },
                ]}
              >
                <House size={28} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View
                style={[
                  styles.authLockBadge,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <LockKeyhole size={14} color={colors.accentBlue} strokeWidth={2.2} />
              </View>
            </View>
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
              {
                backgroundColor: colors.segmentedBg,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                !isRegisterMode && { backgroundColor: colors.accentBlue },
              ]}
              onPress={() => setIsRegisterMode(false)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: !isRegisterMode ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('btn_login')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                isRegisterMode && { backgroundColor: colors.accentBlue },
              ]}
              onPress={() => setIsRegisterMode(true)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isRegisterMode ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('btn_register')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* BANNIÈRE D'ERREUR */}
          {authError && (
            <View
              style={[
                styles.errorBanner,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <TriangleExclamationPoint size={16} color={colors.accentRed} strokeWidth={2} />
              <Text
                style={[
                  styles.errorText,
                  { textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {authError}
              </Text>
            </View>
          )}

          {/* FORMULAIRE */}
          {isRegisterMode && (
            <>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <UserIcon size={18} color={colors.textSecondary} strokeWidth={2} />
                <TextInput
                  style={[
                    styles.inputField,
                    { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                  placeholder="Nom complet"
                  placeholderTextColor={colors.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Phone size={18} color={colors.textSecondary} strokeWidth={2} />
                <TextInput
                  style={[
                    styles.inputField,
                    { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                  placeholder="Téléphone (+216)"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Mail size={18} color={colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={[
                styles.inputField,
                { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
              ]}
              placeholder="Adresse email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <LockKeyhole size={18} color={colors.textSecondary} strokeWidth={2} />
            <TextInput
              style={[
                styles.inputField,
                { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
              ]}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Afficher ou masquer le mot de passe"
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.textSecondary} strokeWidth={2} />
              ) : (
                <Eye size={18} color={colors.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.accentBlue }]}
            onPress={handleAuthSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegisterMode ? t('btn_register') : t('btn_login')}
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
            <Text style={{ color: colors.accentBlue, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
              {t('auth_demo_fill')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ======================================================== */}
      {/* VUE 2 : AUTHENTIFIÉ (PROFIL UTILISATEUR)                 */}
      {/* ======================================================== */}
      {isAuthenticated && user && (
        <View style={styles.profileSection}>
          {/* CARTE D'EN-TÊTE PROFIL */}
          <View
            style={[
              styles.userCard,
              AppShadows.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                shadowOpacity: isDark ? 0.3 : 0.06,
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
            <View
              style={[
                styles.userInfo,
                isRTL ? { marginRight: 14, marginLeft: 0 } : { marginLeft: 14 },
              ]}
            >
              <View
                style={[
                  styles.userNameRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {user.fullName}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: colors.accentBlueSoft }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.accentBlue }]}>
                    {user.role}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.userEmail,
                  { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {user.email}
              </Text>
              {user.phone && (
                <View
                  style={[
                    styles.userPhoneRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Phone size={12} color={colors.accentBlue} strokeWidth={2} />
                  <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
                    {user.phone}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ACTIONS PROFIL */}
          <View
            style={[
              styles.actionsRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  borderColor: colors.accentBlue,
                  backgroundColor: colors.accentBlueSoft,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => {
                setEditName(user.fullName);
                setEditPhone(user.phone || '');
                setIsEditingProfile(true);
              }}
              activeOpacity={0.8}
            >
              <Pencil size={14} color={colors.accentBlue} strokeWidth={2.2} />
              <Text style={[styles.actionBtnText, { color: colors.accentBlue }]}>
                {t('profile_edit')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              onPress={() => setIsChangingPassword(true)}
              activeOpacity={0.8}
            >
              <LockKeyhole size={14} color={colors.textPrimary} strokeWidth={2.2} />
              <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                {t('profile_password')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* FORMULAIRE ÉDITION DU PROFIL */}
          {isEditingProfile && (
            <View
              style={[
                styles.editBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.editBoxTitle,
                  { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                Mettre à jour mes coordonnées
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nom complet"
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Téléphone"
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.editBoxActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => setIsEditingProfile(false)}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('btn_cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.accentBlue }]}
                  onPress={handleUpdateProfile}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{t('btn_save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* FORMULAIRE CHANGEMENT DE MOT DE PASSE */}
          {isChangingPassword && (
            <View
              style={[
                styles.editBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.editBoxTitle,
                  { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                Changer mon mot de passe
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mot de passe actuel"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nouveau mot de passe (min 6 car.)"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <View style={styles.editBoxActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={() => setIsChangingPassword(false)}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('btn_cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.accentBlue }]}
                  onPress={handleChangePassword}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Valider</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* BOUTON DÉPOSER UNE ANNONCE */}
          <TouchableOpacity
            style={[
              styles.addPropButton,
              {
                backgroundColor: colors.accentBlue,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
            onPress={handleOpenAddProperty}
            activeOpacity={0.85}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.addPropButtonText}>{t('profile_publish')}</Text>
          </TouchableOpacity>

          {/* MES ANNONCES PUBLIÉES */}
          <View
            style={[
              styles.myPropsHeader,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('profile_my_listings', { count: myProperties.length })}
            </Text>
            <TouchableOpacity
              onPress={loadMyProperties}
              style={[
                styles.refreshPill,
                {
                  backgroundColor: colors.accentBlueSoft,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              activeOpacity={0.8}
            >
              <RefreshCw size={13} color={colors.accentBlue} strokeWidth={2.2} />
              <Text style={{ color: colors.accentBlue, fontSize: 12, fontWeight: '700' }}>
                {t('btn_refresh')}
              </Text>
            </TouchableOpacity>
          </View>

          {loadingProperties ? (
            <ActivityIndicator color={colors.accentBlue} style={{ marginVertical: 16 }} />
          ) : myProperties.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
                {t('profile_no_listings')}
              </Text>
            </View>
          ) : (
            myProperties.map((prop) => (
              <View
                key={prop.id}
                style={[
                  styles.myPropCard,
                  AppShadows.subtle,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Image source={{ uri: prop.imageUrl }} style={styles.myPropImage} />
                <View
                  style={[
                    styles.myPropContent,
                    isRTL ? { marginRight: 12, marginLeft: 0, alignItems: 'flex-end' } : { marginLeft: 12 },
                  ]}
                >
                  <Text style={[styles.myPropTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {prop.titre}
                  </Text>
                  <View
                    style={[
                      styles.myPropMetaRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <Text style={[styles.myPropPrice, { color: colors.accentBlue }]}>
                      {formatPrice(prop.prix)}
                    </Text>
                    <MapPin size={11} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.myPropLoc, { color: colors.textSecondary }]} numberOfLines={1}>
                      {prop.localisation}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteProperty(prop.id || '1', prop.titre)}
                  style={[styles.deleteBtn, { backgroundColor: 'rgba(239, 68, 68, 0.10)' }]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t('btn_delete_property')}
                >
                  <Trash size={17} color={colors.accentRed} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {/* ======================================================== */}
      {/* PRÉFÉRENCES : PARAMÈTRES, THÈME ET LANGUES               */}
      {/* ======================================================== */}
      <View
        style={[
          styles.settingsHeaderRow,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <Settings size={17} color={colors.accentBlue} strokeWidth={2.2} />
        <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>
          {t('app_settings')}
        </Text>
      </View>

      {/* MODE SOMBRE / CLAIR */}
      <View
        style={[
          styles.settingRow,
          AppShadows.subtle,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View
          style={[
            styles.settingLeft,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View style={[styles.settingIconBox, { backgroundColor: colors.accentBlueSoft }]}>
            {isDark ? (
              <Moon size={18} color={colors.accentBlueSecondary} strokeWidth={2} />
            ) : (
              <Sun size={18} color={colors.accentBlue} strokeWidth={2} />
            )}
          </View>
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
            {isDark ? t('theme_dark') : t('theme_light')}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.themeSwitchBtn,
            { backgroundColor: isDark ? colors.accentBlue : colors.surfaceElevated },
          ]}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: isDark ? '#FFFFFF' : colors.textPrimary,
              fontWeight: '700',
              fontSize: 12,
            }}
          >
            {t('theme_toggle')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LANGUE DE L'APPLICATION */}
      <View
        style={[
          styles.settingRow,
          AppShadows.subtle,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View
          style={[
            styles.settingLeft,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View style={[styles.settingIconBox, { backgroundColor: colors.accentBlueSoft }]}>
            <Languages size={18} color={colors.accentBlue} strokeWidth={2} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
            {t('language_choice')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.langBadge, { backgroundColor: colors.accentBlueSoft }]}
          onPress={cycleLanguage}
          activeOpacity={0.8}
        >
          <Text style={{ color: colors.accentBlue, fontWeight: '700', fontSize: 12 }}>
            {language === 'fr' ? 'Français (FR)' : language === 'ar' ? 'العربية (AR)' : 'English (EN)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOUTON DÉCONNEXION */}
      {isAuthenticated && (
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              borderColor: 'rgba(239, 68, 68, 0.35)',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
          onPress={() => authService.logout()}
          activeOpacity={0.8}
        >
          <LogOut size={17} color={colors.accentRed} strokeWidth={2.2} />
          <Text style={[styles.logoutButtonText, { color: colors.accentRed }]}>
            {t('btn_logout')}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  authContainer: { alignItems: 'stretch', marginTop: 8, marginBottom: 16 },
  welcomeIllustrationWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  authIconOuterRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  authIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authLockBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 },
  authSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 20, lineHeight: 19 },
  tabSelector: {
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabButton: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '700' },
  errorBanner: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.30)',
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  errorText: { color: '#EF4444', fontSize: 12.5, flex: 1, fontWeight: '500' },
  inputWrapper: {
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 14,
  },
  submitButton: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  demoFillBtn: { marginTop: 14, padding: 8 },
  profileSection: { marginBottom: 20 },
  userCard: {
    padding: 16,
    borderRadius: 20,
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
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  userInfo: { flex: 1 },
  userNameRow: { alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  userName: { fontSize: 16, fontWeight: '800', flex: 1 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  roleBadgeText: { fontSize: 10, fontWeight: '800' },
  userEmail: { fontSize: 12.5, marginTop: 2 },
  userPhoneRow: { alignItems: 'center', gap: 5, marginTop: 4 },
  userPhone: { fontSize: 12, fontWeight: '500' },
  actionsRow: { marginTop: 12, gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: { fontSize: 12.5, fontWeight: '700' },
  editBox: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
  },
  editBoxTitle: { fontSize: 14.5, fontWeight: '700', marginBottom: 12 },
  editBoxActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10 },
  addPropButton: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  addPropButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14.5 },
  myPropsHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  refreshPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    gap: 5,
  },
  emptyCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  myPropCard: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  myPropImage: { width: 68, height: 58, borderRadius: 12 },
  myPropContent: { flex: 1 },
  myPropTitle: { fontSize: 13.5, fontWeight: '700' },
  myPropMetaRow: { alignItems: 'center', gap: 4, marginTop: 4 },
  myPropPrice: { fontSize: 12.5, fontWeight: '700', marginRight: 4 },
  myPropLoc: { fontSize: 11.5, flex: 1 },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsHeaderRow: {
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 12,
  },
  settingsTitle: { fontSize: 16, fontWeight: '800' },
  settingRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  settingLeft: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: { fontSize: 13.5, fontWeight: '600', flex: 1 },
  themeSwitchBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  langBadge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  logoutButton: {
    marginTop: 18,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: { fontWeight: '700', fontSize: 14 },
});
