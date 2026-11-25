// ============================================================
// DARLINK — ÉCRAN DE DÉTAILS DU BIEN (React Native)
// Localisation carte directe, attribution source, signalement,
// icônes Lucide sans emoji, appel & contact Cloud Firestore.
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  Heart,
  Trash2,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Building2,
  ShieldCheck,
  Check,
  Phone,
  ExternalLink,
  Flag,
  Camera,
} from 'lucide-react-native';
import { AppColors } from '../../../../core/constants/colors';
import { firestoreEngine } from '../../../../core/firebase/firestoreEngine';
import { Property, formatPrice } from '../../domain/models/property';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { favoritesApiService } from '../../../favorites/services/favoritesApiService';
import { contactApiService } from '../../../contact/services/contactApiService';
import { propertyApiService } from '../../services/propertyApiService';
import { authService } from '../../../auth/services/authService';

interface PropertyDetailsScreenProps {
  readonly property: Property;
  readonly onBack: () => void;
  readonly onLocateOnMap?: (property: Property) => void;
}

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  property,
  onBack,
  onLocateOnMap,
}) => {
  const allImages = [
    ...(property.imageUrl ? [property.imageUrl] : []),
    ...(property.imagesGalerie ?? []),
  ];
  const [displayedImage, setDisplayedImage] = useState<string>(allImages[0] || '');
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [imageError, setImageError] = useState<boolean>(false);
  const propId = property.id || '1';
  const [isFavorite, setIsFavorite] = useState<boolean>(
    property.isFavorite ?? favoritesApiService.isFavorite(propId)
  );
  const { isDark, colors } = useTheme();
  const { t, translateAmenity } = useTranslation();

  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [senderName, setSenderName] = useState<string>(authService.getCurrentUser()?.fullName || '');
  const [senderEmail, setSenderEmail] = useState<string>(authService.getCurrentUser()?.email || '');
  const [senderPhone, setSenderPhone] = useState<string>(authService.getCurrentUser()?.phone || '');
  const [contactMessage, setContactMessage] = useState<string>(
    `Bonjour, je souhaite obtenir des informations sur ce bien (${property.titre}).`
  );

  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');

  const handleCallOwner = async () => {
    const phone = property.agentTel;
    if (!phone || phone.trim().length === 0) {
      Alert.alert(t('call_owner'), t('phone_unavailable'));
      return;
    }
    const cleanPhone = phone.trim().replace(/[^\d+]/g, '');
    const url = `tel:${cleanPhone}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('call_owner'), `${t('call_error')} ${cleanPhone}`);
      }
    } catch {
      Alert.alert(t('call_owner'), `${t('call_error')} ${cleanPhone}`);
    }
  };

  const handleToggleFavorite = async () => {
    await favoritesApiService.toggleFavorite(propId, property);
    const updated = favoritesApiService.isFavorite(propId);
    setIsFavorite(updated);
    Alert.alert(
      updated ? t('added_to_favorites') : t('removed_from_favorites'),
      property.titre
    );
  };

  const handleDeleteProperty = () => {
    Alert.alert(
      'Supprimer ce bien',
      `Voulez-vous supprimer définitivement "${property.titre}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const ok = await propertyApiService.deleteProperty(propId);
            if (ok) {
              Alert.alert('Supprimé', 'Le bien a été supprimé de Cloud Firestore.');
              onBack();
            } else {
              Alert.alert('Refusé', 'Seul le propriétaire authentifié ou un administrateur peut supprimer ce bien.');
            }
          },
        },
      ]
    );
  };

  const handleSendContact = async () => {
    if (!senderName.trim() || !senderEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom et votre adresse e-mail.');
      return;
    }
    try {
      await contactApiService.sendContactRequest({
        propertyId: propId,
        propertyTitle: property.titre,
        propertyOwnerId: property.ownerId,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone.trim(),
        message: contactMessage.trim(),
      });
      setShowContactModal(false);
      Alert.alert('Demande envoyée', 'Votre demande a été enregistrée dans Cloud Firestore.');
    } catch (err: unknown) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Envoi refusé.');
    }
  };

  const handleSubmitReport = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour signaler une annonce.');
      return;
    }
    if (!reportReason.trim()) {
      Alert.alert('Motif requis', 'Précisez la raison du signalement.');
      return;
    }
    const ok = await firestoreEngine.setDocument('reports', `rep_${Date.now()}`, {
      propertyId: propId,
      reporterUid: user.id,
      reason: reportReason.trim(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });
    setShowReportModal(false);
    setReportReason('');
    Alert.alert(ok ? 'Signalement envoyé' : 'Erreur', ok ? 'Merci, notre équipe vérifiera cette annonce.' : 'Impossible d’enregistrer le signalement.');
  };

  const isOwner = Boolean(
    authService.getCurrentUser() &&
      String(authService.getCurrentUser()?.id) === String(property.ownerId || '')
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HERO */}
        <View style={styles.heroContainer}>
          {displayedImage && !imageError ? (
            <Image
              source={{ uri: displayedImage }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View
              style={[
                styles.heroPlaceholder,
                { backgroundColor: isDark ? '#181B24' : '#EEF2F7' },
              ]}
            >
              <Building2 size={54} color={colors.accentBlue} strokeWidth={1.5} />
              <Text style={[styles.placeholderTitle, { color: colors.textSecondary }]}>
                {property.imageAttribution || 'Photographie non hébergée sur DarLink'}
              </Text>
            </View>
          )}

          {allImages.length > 0 && (
            <View style={styles.photoCounter}>
              <Camera size={13} color="#FFFFFF" />
              <Text style={styles.photoCounterText}>
                {imageIndex + 1}/{allImages.length}
              </Text>
            </View>
          )}
        </View>

        {/* 2. BARRE SUPÉRIEURE */}
        <View style={styles.topActionsBar}>
          <TouchableOpacity
            style={[
              styles.glassCircleBtn,
              {
                backgroundColor: isDark ? 'rgba(15, 16, 21, 0.72)' : 'rgba(255, 255, 255, 0.90)',
                borderColor: colors.border,
              },
            ]}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <ArrowLeft size={19} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[
                styles.glassCircleBtn,
                {
                  backgroundColor: isDark ? 'rgba(15, 16, 21, 0.72)' : 'rgba(255, 255, 255, 0.90)',
                  borderColor: colors.border,
                },
              ]}
              onPress={handleToggleFavorite}
              activeOpacity={0.8}
            >
              <Heart
                size={18}
                color={isFavorite ? AppColors.accentRed : colors.textPrimary}
                fill={isFavorite ? AppColors.accentRed : 'transparent'}
              />
            </TouchableOpacity>

            {isOwner && (
              <TouchableOpacity
                style={[
                  styles.glassCircleBtn,
                  {
                    backgroundColor: isDark ? 'rgba(15, 16, 21, 0.72)' : 'rgba(255, 255, 255, 0.90)',
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleDeleteProperty}
                activeOpacity={0.8}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. MINIATURES */}
        {allImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailStrip}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {allImages.map((img, idx) => (
              <TouchableOpacity
                key={img + idx}
                style={[
                  styles.thumbnailItem,
                  {
                    borderColor: imageIndex === idx ? colors.accentBlue : colors.border,
                    borderWidth: imageIndex === idx ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  setDisplayedImage(img);
                  setImageIndex(idx);
                  setImageError(false);
                }}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 4. STATUT & SOURCE */}
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>
              {property.estLocation ? 'À Louer' : 'À Vendre'} • {property.listingStatus || 'PUBLISHED'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowReportModal(true)} style={styles.reportPill}>
            <Flag size={13} color={colors.textSecondary} />
            <Text style={{ fontSize: 11.5, color: colors.textSecondary, fontWeight: '600' }}>
              Signaler
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. PRIX, TITRE & BOUTON LOCALISER SUR CARTE */}
        <View style={styles.titleSection}>
          <Text style={[styles.hugePrice, { color: colors.textPrimary }]}>
            {formatPrice(property.prix, Boolean(property.estLocation), Boolean(property.priceOnRequest))}
          </Text>
          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>{property.titre}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
              <MapPin size={15} color={colors.accentBlue} />
              <Text style={[styles.mainAddress, { color: colors.textSecondary }]} numberOfLines={2}>
                {property.localisation}
              </Text>
            </View>
            {onLocateOnMap && (
              <TouchableOpacity
                onPress={() => onLocateOnMap(property)}
                style={[styles.locateBtn, { borderColor: colors.accentBlue }]}
              >
                <MapPin size={14} color={colors.accentBlue} />
                <Text style={{ color: colors.accentBlue, fontSize: 12, fontWeight: '700' }}>
                  Voir sur carte
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 6. CARACTÉRISTIQUES */}
        <View style={styles.specsGrid}>
          <View style={[styles.specBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <BedDouble size={20} color={colors.accentBlue} />
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>{property.nombreChambres}</Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>Chambres</Text>
          </View>

          <View style={[styles.specBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Bath size={20} color={colors.accentBlue} />
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>{property.nombreSallesDeBain}</Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>Salles de bain</Text>
          </View>

          <View style={[styles.specBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Maximize2 size={20} color={colors.accentBlue} />
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>{property.surfaceM2 ?? 0} m²</Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>Surface</Text>
          </View>
        </View>

        {/* 7. TYPE & STANDING */}
        <View style={[styles.specificationsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.specItem}>
            <Building2 size={20} color={colors.accentBlue} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.specItemLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.specItemValue, { color: colors.textPrimary }]}>{property.type}</Text>
            </View>
          </View>
          <View style={[styles.specDivider, { backgroundColor: colors.border }]} />
          <View style={styles.specItem}>
            <ShieldCheck size={20} color={colors.accentBlue} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.specItemLabel, { color: colors.textSecondary }]}>Standing</Text>
              <Text style={[styles.specItemValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {property.standing ?? 'Standard'}
              </Text>
            </View>
          </View>
        </View>

        {/* 8. COMMODITÉS */}
        {property.commodites && property.commodites.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('amenities_title')}</Text>
            <View style={styles.amenitiesGrid}>
              {property.commodites.map((item) => (
                <View
                  key={item}
                  style={[styles.amenityChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Check size={13} color="#10B981" strokeWidth={2.5} />
                  <Text style={[styles.amenityText, { color: colors.textSecondary }]}>
                    {translateAmenity(item)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 9. SOURCE OFFICIELLE / ANNONCEUR */}
        <View style={[styles.agentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.agentAvatarBox}>
            <Text style={styles.agentAvatarText}>
              {(property.agentNom || 'D')
                .split(' ')
                .map((e) => (e ? e[0] : ''))
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.agentInfo}>
            <Text style={[styles.agentName, { color: colors.textPrimary }]}>
              {property.agentNom ?? 'Annonceur'}
            </Text>
            <Text style={[styles.agentRole, { color: colors.textSecondary }]}>
              {property.sourceName ? `Source : ${property.sourceName}` : t('owner_role')}
            </Text>
            {property.agentTel ? (
              <TouchableOpacity onPress={handleCallOwner}>
                <Text style={[styles.agentPhone, { textDecorationLine: 'underline' }]}>{property.agentTel}</Text>
              </TouchableOpacity>
            ) : null}
            {property.sourceUrl ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(property.sourceUrl!)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
              >
                <ExternalLink size={12} color={colors.accentBlue} />
                <Text style={{ color: colors.accentBlue, fontSize: 12, fontWeight: '600' }}>
                  Consulter le portail officiel
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {property.agentTel ? (
            <TouchableOpacity style={styles.agentCallBtn} onPress={handleCallOwner}>
              <Phone size={18} color={colors.accentBlue} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 10. DESCRIPTION */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('description_title')}</Text>
          <Text style={[styles.descriptionBody, { color: colors.textSecondary }]}>{property.description}</Text>
        </View>

        <View style={{ height: 185 }} />
      </ScrollView>

      {/* DOCK BAS */}
      <View
        style={[
          styles.bottomDock,
          {
            backgroundColor: isDark ? 'rgba(15, 16, 21, 0.95)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onBack}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>{t('btn_back')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scheduleButton, { backgroundColor: isDark ? '#FFFFFF' : '#0F1015' }]}
          onPress={() => setShowContactModal(true)}
        >
          <Text style={[styles.scheduleButtonText, { color: isDark ? '#0F1015' : '#FFFFFF' }]}>
            {t('btn_schedule_visit')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL CONTACT */}
      <Modal visible={showContactModal} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.content, { backgroundColor: colors.surface }]}>
            <View style={modalStyles.handleBar} />
            <Text style={[modalStyles.title, { color: colors.textPrimary }]}>{t('contact_owner')}</Text>
            <Text style={[modalStyles.subTitle, { color: colors.textSecondary }]}>{t('contact_owner_sub')}</Text>

            <TextInput
              style={[modalStyles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.textSecondary}
              value={senderName}
              onChangeText={setSenderName}
            />
            <TextInput
              style={[modalStyles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Votre adresse e-mail"
              placeholderTextColor={colors.textSecondary}
              value={senderEmail}
              onChangeText={setSenderEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[modalStyles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Téléphone (+216)"
              placeholderTextColor={colors.textSecondary}
              value={senderPhone}
              onChangeText={setSenderPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[modalStyles.input, modalStyles.textArea, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Votre message"
              placeholderTextColor={colors.textSecondary}
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              numberOfLines={3}
            />

            <View style={modalStyles.actions}>
              <TouchableOpacity
                style={[modalStyles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowContactModal(false)}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{t('btn_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.submitBtn} onPress={handleSendContact}>
                <Text style={modalStyles.submitBtnText}>{t('send_request')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL SIGNALEMENT */}
      <Modal visible={showReportModal} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.content, { backgroundColor: colors.surface }]}>
            <Text style={[modalStyles.title, { color: colors.textPrimary }]}>Signaler cette annonce</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea, { color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Motif (annonce expirée, erreur de prix, contenu suspect...)"
              placeholderTextColor={colors.textSecondary}
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            <View style={modalStyles.actions}>
              <TouchableOpacity
                style={[modalStyles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowReportModal(false)}
              >
                <Text style={{ color: colors.textPrimary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.submitBtn} onPress={handleSubmitReport}>
                <Text style={modalStyles.submitBtnText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  heroContainer: {
    height: 340,
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  placeholderTitle: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  photoCounter: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(24, 25, 32, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  photoCounterText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  topActionsBar: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightActions: { flexDirection: 'row', gap: 8 },
  glassCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  thumbnailStrip: { marginTop: 14, paddingHorizontal: 20 },
  thumbnailContainer: { gap: 10 },
  thumbnailItem: { width: 84, height: 60, borderRadius: 14, overflow: 'hidden' },
  thumbnailImage: { width: '100%', height: '100%' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.accentGreen, marginRight: 6 },
  statusBadgeText: { color: AppColors.accentGreen, fontSize: 12, fontWeight: '700' },
  reportPill: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  titleSection: { paddingHorizontal: 20, marginTop: 14 },
  hugePrice: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  mainTitle: { fontSize: 19, fontWeight: '700', marginTop: 6 },
  mainAddress: { fontSize: 13.5, flex: 1 },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  specsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 20 },
  specBox: { flex: 1, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, gap: 4 },
  specBoxValue: { fontSize: 15, fontWeight: '700' },
  specBoxLabel: { fontSize: 11 },
  specificationsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  specItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  specItemLabel: { fontSize: 11 },
  specItemValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  specDivider: { width: 1, height: 34, marginHorizontal: 12 },
  amenitiesSection: { paddingHorizontal: 20, marginTop: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  amenityText: { fontSize: 12.5, fontWeight: '500' },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 22,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  agentAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  agentAvatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  agentRole: { fontSize: 11.5, marginBottom: 4 },
  agentPhone: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
  agentCallBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionSection: { paddingHorizontal: 20, marginTop: 22 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  descriptionBody: { fontSize: 14, lineHeight: 22 },
  bottomDock: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    elevation: 6,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: { fontSize: 13, fontWeight: '600' },
  scheduleButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButtonText: { fontSize: 14, fontWeight: '800' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  content: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  subTitle: { fontSize: 13, marginBottom: 16 },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 14,
  },
  textArea: { height: 84, paddingTop: 12, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
