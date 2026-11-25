// ============================================================
// DARLINK — IMMERSIVE PROPERTY DETAILS SCREEN (React Native)
// Swipeable full-bleed gallery, overlapping surface sheet,
// Liquid Glass orbs, floating glass bottom contact bar.
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
  useWindowDimensions,
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
  Check,
  Phone,
  ExternalLink,
  Flag,
  ChevronRight,
} from 'lucide-react-native';
import { firestoreEngine } from '../../../../core/firebase/firestoreEngine';
import { Property, formatPrice } from '../../domain/models/property';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { favoritesApiService } from '../../../favorites/services/favoritesApiService';
import { contactApiService } from '../../../contact/services/contactApiService';
import { propertyApiService } from '../../services/propertyApiService';
import { authService } from '../../../auth/services/authService';
import {
  LiquidGlassView,
  GlassOrbButton,
  EditorialSectionHeader,
  LuxuryPillButton,
} from '../../../../core/designSystem/LiquidGlass';
import { TypographyScale, RadiusScale, triggerHaptic } from '../../../../core/designSystem/tokens';

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
  const { width } = useWindowDimensions();
  const allImages = [
    ...(property.imageUrl ? [property.imageUrl] : []),
    ...(property.imagesGalerie ?? []),
  ];
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
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
      if (canOpen) await Linking.openURL(url);
      else Alert.alert(t('call_owner'), `${t('call_error')} ${cleanPhone}`);
    } catch {
      Alert.alert(t('call_owner'), `${t('call_error')} ${cleanPhone}`);
    }
  };

  const handleToggleFavorite = async () => {
    triggerHaptic('light');
    await favoritesApiService.toggleFavorite(propId, property);
    setIsFavorite(favoritesApiService.isFavorite(propId));
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
    Alert.alert(
      ok ? 'Signalement envoyé' : 'Erreur',
      ok ? 'Merci, notre équipe vérifiera cette annonce.' : 'Impossible d’enregistrer le signalement.'
    );
  };

  const isOwner = Boolean(
    authService.getCurrentUser() &&
      String(authService.getCurrentUser()?.id) === String(property.ownerId || '')
  );

  const isInstitutional =
    property.listingCategory === 'DEVELOPMENT_REFERENCE' ||
    Boolean(property.sourceName && !property.republicationAuthorized);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 1. Immersive Swipeable Hero Gallery */}
        <View style={styles.heroContainer}>
          {allImages.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (width || 390));
                setImageIndex(idx);
              }}
            >
              {allImages.map((img, idx) =>
                !imageErrors[idx] ? (
                  <Image
                    key={`${img}_${idx}`}
                    source={{ uri: img }}
                    style={{ width: width || 390, height: 370 }}
                    resizeMode="cover"
                    onError={() => setImageErrors((prev) => ({ ...prev, [idx]: true }))}
                  />
                ) : (
                  <View
                    key={`err_${idx}`}
                    style={[
                      styles.heroFallback,
                      { width: width || 390, backgroundColor: isDark ? '#14171F' : '#EFECE5' },
                    ]}
                  >
                    <Building2 size={46} color={colors.accentChampagne} strokeWidth={1.6} />
                  </View>
                )
              )}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.heroFallback,
                { width: '100%', backgroundColor: isDark ? '#14171F' : '#EFECE5' },
              ]}
            >
              <Building2 size={48} color={colors.accentChampagne} strokeWidth={1.6} />
              <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 10 }]}>
                {property.imageAttribution || 'Visuels non hébergés sur DarLink'}
              </Text>
            </View>
          )}

          {/* Floating Top Controls */}
          <View style={styles.topControls}>
            <GlassOrbButton size={40} onPress={onBack} accessibilityLabel="Retour">
              <ArrowLeft size={19} color={colors.textPrimary} />
            </GlassOrbButton>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <GlassOrbButton size={40} onPress={handleToggleFavorite} accessibilityLabel="Favori">
                <Heart
                  size={18}
                  color={isFavorite ? colors.accentRed : colors.textPrimary}
                  fill={isFavorite ? colors.accentRed : 'transparent'}
                />
              </GlassOrbButton>
              {isOwner && (
                <GlassOrbButton size={40} onPress={handleDeleteProperty} accessibilityLabel="Supprimer">
                  <Trash2 size={18} color={colors.accentRed} />
                </GlassOrbButton>
              )}
            </View>
          </View>

          {allImages.length > 1 && (
            <LiquidGlassView borderRadius={999} intensity={48} elevated={false} style={styles.counterPill}>
              <Text style={[TypographyScale.micro, { color: colors.textPrimary }]}>
                {imageIndex + 1} / {allImages.length}
              </Text>
            </LiquidGlassView>
          )}
        </View>

        {/* 2. Overlapping Luxury Content Sheet */}
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isInstitutional ? colors.accentChampagne : colors.accentGreen },
                ]}
              />
              <Text style={[TypographyScale.micro, { color: colors.textPrimary }]}>
                {property.estLocation ? t('for_rent') : t('for_sale')}
              </Text>
            </View>

            {isInstitutional && (
              <View style={[styles.refPill, { backgroundColor: 'rgba(154,123,79,0.14)' }]}>
                <Text style={[TypographyScale.micro, { color: colors.accentChampagne }]}>
                  Référence programme
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={() => setShowReportModal(true)} style={styles.reportBtn}>
              <Flag size={14} color={colors.textSecondary} />
              <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>Signaler</Text>
            </TouchableOpacity>
          </View>

          <Text style={[TypographyScale.heroDisplay, { color: colors.textPrimary, fontSize: 29, marginTop: 14 }]}>
            {formatPrice(property.prix, Boolean(property.estLocation), Boolean(property.priceOnRequest))}
          </Text>

          <Text style={[TypographyScale.pageTitle, { color: colors.textPrimary, marginTop: 6 }]}>
            {property.titre}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!onLocateOnMap}
            onPress={() => onLocateOnMap && onLocateOnMap(property)}
            style={[styles.locationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MapPin size={17} color={colors.accentChampagne} />
            <Text style={[TypographyScale.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={2}>
              {property.localisation}
            </Text>
            {onLocateOnMap ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={[TypographyScale.caption, { color: colors.accentChampagne }]}>Carte</Text>
                <ChevronRight size={16} color={colors.accentChampagne} />
              </View>
            ) : null}
          </TouchableOpacity>

          {/* 4-Metric Spec Grid */}
          <View style={styles.specsRow}>
            <View style={[styles.specTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <BedDouble size={18} color={colors.accentChampagne} />
              <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 15, marginTop: 6 }]}>
                {property.nombreChambres}
              </Text>
              <Text style={[TypographyScale.micro, { color: colors.textSecondary, fontSize: 10 }]}>Chambres</Text>
            </View>
            <View style={[styles.specTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Bath size={18} color={colors.accentChampagne} />
              <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 15, marginTop: 6 }]}>
                {property.nombreSallesDeBain}
              </Text>
              <Text style={[TypographyScale.micro, { color: colors.textSecondary, fontSize: 10 }]}>SDB</Text>
            </View>
            <View style={[styles.specTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Maximize2 size={17} color={colors.accentChampagne} />
              <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary, fontSize: 15, marginTop: 6 }]}>
                {property.surfaceM2 ?? 0} m²
              </Text>
              <Text style={[TypographyScale.micro, { color: colors.textSecondary, fontSize: 10 }]}>Surface</Text>
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <EditorialSectionHeader title={t('description_title')} />
            <Text style={[TypographyScale.body, { color: colors.textSecondary, marginTop: 10, lineHeight: 23 }]}>
              {property.description}
            </Text>
          </View>

          {property.commodites && property.commodites.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <EditorialSectionHeader title={t('amenities_title')} />
              <View style={styles.amenitiesWrap}>
                {property.commodites.map((item) => (
                  <View
                    key={item}
                    style={[styles.amenityPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Check size={13} color={colors.accentGreen} strokeWidth={2.5} />
                    <Text style={[TypographyScale.caption, { color: colors.textPrimary }]}>
                      {translateAmenity(item)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Source / Owner Card */}
          <View style={[styles.ownerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.ownerAvatar, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary }]}>
                {(property.agentNom || 'D')[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[TypographyScale.cardTitle, { color: colors.textPrimary }]}>
                {property.agentNom ?? 'Annonceur'}
              </Text>
              <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {property.sourceName ? `Source : ${property.sourceName}` : t('owner_role')}
              </Text>
              {property.sourceUrl ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(property.sourceUrl!)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                >
                  <ExternalLink size={12} color={colors.accentChampagne} />
                  <Text style={[TypographyScale.caption, { color: colors.accentChampagne }]}>
                    Portail officiel
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {property.agentTel ? (
              <GlassOrbButton size={42} onPress={handleCallOwner} accessibilityLabel="Appeler">
                <Phone size={18} color={colors.textPrimary} />
              </GlassOrbButton>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Floating Liquid Glass Bottom Contact Bar */}
      <View style={styles.bottomWrap}>
        <LiquidGlassView borderRadius={30} intensity={isDark ? 55 : 70} style={styles.bottomGlass}>
          <GlassOrbButton size={48} onPress={handleCallOwner} accessibilityLabel="Appeler">
            <Phone size={19} color={colors.textPrimary} />
          </GlassOrbButton>
          <View style={{ flex: 1 }}>
            <LuxuryPillButton
              label={t('btn_schedule_visit')}
              onPress={() => setShowContactModal(true)}
            />
          </View>
        </LiquidGlassView>
      </View>

      {/* Contact Sheet Modal */}
      <Modal visible={showContactModal} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <LiquidGlassView borderRadius={32} intensity={isDark ? 65 : 85} style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <Text style={[TypographyScale.pageTitle, { color: colors.textPrimary, fontSize: 20 }]}>
              {t('contact_owner')}
            </Text>
            <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: 16 }]}>
              {t('contact_owner_sub')}
            </Text>
            <TextInput
              style={[modalStyles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceElevated }]}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.textTertiary}
              value={senderName}
              onChangeText={setSenderName}
            />
            <TextInput
              style={[modalStyles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceElevated }]}
              placeholder="Votre adresse e-mail"
              placeholderTextColor={colors.textTertiary}
              value={senderEmail}
              onChangeText={setSenderEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[modalStyles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceElevated }]}
              placeholder="Téléphone (+216)"
              placeholderTextColor={colors.textTertiary}
              value={senderPhone}
              onChangeText={setSenderPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[modalStyles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceElevated, height: 84, textAlignVertical: 'top' }]}
              placeholder="Votre message"
              placeholderTextColor={colors.textTertiary}
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
            />
            <LuxuryPillButton label="Envoyer la demande" onPress={handleSendContact} style={{ marginTop: 8 }} />
            <LuxuryPillButton
              label="Annuler"
              secondary
              onPress={() => setShowContactModal(false)}
              style={{ marginTop: 8 }}
            />
          </LiquidGlassView>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={showReportModal} transparent animationType="fade">
        <View style={modalStyles.overlay}>
          <LiquidGlassView borderRadius={28} intensity={70} style={modalStyles.sheet}>
            <Text style={[TypographyScale.sectionTitle, { color: colors.textPrimary }]}>
              Signaler cette annonce
            </Text>
            <TextInput
              style={[modalStyles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceElevated, height: 84, marginTop: 12 }]}
              placeholder="Motif du signalement..."
              placeholderTextColor={colors.textTertiary}
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            <LuxuryPillButton label="Envoyer" onPress={handleSubmitReport} style={{ marginTop: 8 }} />
            <LuxuryPillButton label="Annuler" secondary onPress={() => setShowReportModal(false)} style={{ marginTop: 8 }} />
          </LiquidGlassView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  heroContainer: { height: 370, position: 'relative' },
  heroFallback: { height: 370, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  topControls: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterPill: {
    position: 'absolute',
    right: 16,
    bottom: 38,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 999,
    borderWidth: 0.8,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  refPill: {
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 999,
  },
  reportBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 0.9,
    marginTop: 14,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  specTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 0.9,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0.9,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 22,
    borderWidth: 0.9,
    marginTop: 24,
  },
  ownerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
  },
  bottomGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  sheet: {
    padding: 22,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(142,142,147,0.4)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  input: {
    borderRadius: RadiusScale.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    marginBottom: 10,
  },
});
