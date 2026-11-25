// ============================================================
// DARLINK — ÉCRAN DE DÉTAILS DU BIEN LUXE (React Native)
// Icônes vectorielles Lucide, Design System unifié & support RTL
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import {
  Play,
  Camera,
  ArrowLeft,
  ArrowRight,
  Heart,
  Trash,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  House,
  ShieldCheck,
  Check,
  Phone,
} from 'lucide-react-native';
import { AppColors } from '../../../../core/constants/colors';
import { AppShadows } from '../../../../core/constants/spacing';
import { Property } from '../../domain/models/property';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { useBottomNavClearance } from '../../../../core/components/FloatingBottomNav';
import { favoritesApiService } from '../../../favorites/services/favoritesApiService';
import { contactApiService } from '../../../contact/services/contactApiService';
import { propertyApiService } from '../../services/propertyApiService';
import { authService } from '../../../auth/services/authService';

interface PropertyDetailsScreenProps {
  readonly property: Property;
  readonly onBack: () => void;
}

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({
  property,
  onBack,
}) => {
  const [displayedImage, setDisplayedImage] = useState<string>(property.imageUrl);
  const [imageIndex, setImageIndex] = useState<number>(0);
  const propId = property.id || '1';
  const [isFavorite, setIsFavorite] = useState<boolean>(
    property.isFavorite ?? favoritesApiService.isFavorite(propId)
  );
  const { isDark, colors } = useTheme();
  const { t, formatPrice: fmtPrice, translateAmenity, isRTL } = useTranslation();
  const bottomClearance = useBottomNavClearance();

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

  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [senderName, setSenderName] = useState<string>(
    authService.getCurrentUser()?.fullName || 'Visiteur'
  );
  const [senderEmail, setSenderEmail] = useState<string>(
    authService.getCurrentUser()?.email || 'visiteur@darlink.tn'
  );
  const [senderPhone, setSenderPhone] = useState<string>('+216 20 123 456');
  const [contactMessage, setContactMessage] = useState<string>(
    `Bonjour, je souhaite visiter ce bien (${property.titre}).`
  );

  const allImages = [property.imageUrl, ...(property.imagesGalerie ?? [])];

  const handleSelectImage = (img: string, idx: number) => {
    setDisplayedImage(img);
    setImageIndex(idx);
  };

  const handleToggleFavorite = async () => {
    await favoritesApiService.toggleFavorite(propId, property);
    const updated = favoritesApiService.isFavorite(propId);
    setIsFavorite(updated);
    Alert.alert(
      updated ? t('added_to_favorites') : t('removed_from_favorites'),
      updated
        ? `${property.titre} — ${t('added_to_favorites')}`
        : `${property.titre} — ${t('removed_from_favorites')}`
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
            await propertyApiService.deleteProperty(propId);
            Alert.alert('Supprimé', 'Le bien a été supprimé de la base de données.');
            onBack();
          },
        },
      ]
    );
  };

  const handleSendContact = async () => {
    if (!senderName.trim() || !senderEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom et adresse e-mail.');
      return;
    }
    setShowContactModal(false);
    await contactApiService.sendContactRequest({
      propertyId: propId,
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      senderPhone: senderPhone.trim(),
      message: contactMessage.trim(),
    });
    Alert.alert(
      'Demande transmise !',
      'Votre demande de contact a été enregistrée dans la base PostgreSQL et transmise au propriétaire.'
    );
  };

  const handleScheduleTour = () => {
    setShowContactModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomClearance + 92 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HERO IMAGE IMMERSIVE */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: displayedImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Bouton visite virtuelle */}
          <View style={styles.badge360}>
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
          </View>

          {/* Compteur d'images (ex: 1/4) */}
          <View style={styles.photoCounter}>
            <Camera size={13} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.photoCounterText}>
              {imageIndex + 1}/{allImages.length}
            </Text>
          </View>
        </View>

        {/* 2. BARRE D'ACTION SUPÉRIEURE FLOTTANTE */}
        <View
          style={[
            styles.topActionsBar,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.glassCircleBtn,
              {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.92)',
                borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : colors.border,
              },
            ]}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retour à la liste"
          >
            {isRTL ? (
              <ArrowRight size={19} color={colors.textPrimary} strokeWidth={2.2} />
            ) : (
              <ArrowLeft size={19} color={colors.textPrimary} strokeWidth={2.2} />
            )}
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[
                styles.glassCircleBtn,
                {
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.92)',
                  borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : colors.border,
                },
              ]}
              onPress={handleToggleFavorite}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? t('removed_from_favorites') : t('added_to_favorites')}
            >
              <Heart
                size={19}
                color={isFavorite ? AppColors.accentRed : colors.textSecondary}
                fill={isFavorite ? AppColors.accentRed : 'transparent'}
                strokeWidth={2}
              />
            </TouchableOpacity>

            {/* Suppression réservée au propriétaire légitime */}
            {authService.getCurrentUser() &&
              String(authService.getCurrentUser()?.id) === String((property as { proprietaireId?: string; ownerId?: string }).proprietaireId || (property as { proprietaireId?: string; ownerId?: string }).ownerId) && (
                <TouchableOpacity
                  style={[
                    styles.glassCircleBtn,
                    {
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.92)',
                      borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : colors.border,
                    },
                  ]}
                  onPress={handleDeleteProperty}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={t('btn_delete_property')}
                >
                  <Trash size={18} color={AppColors.accentRed} strokeWidth={2} />
                </TouchableOpacity>
              )}
          </View>
        </View>

        {/* 3. BANDE HORIZONTALE DES MINIATURES */}
        {allImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailStrip}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {allImages.map((img, idx) => {
              const isSelected = imageIndex === idx;
              return (
                <TouchableOpacity
                  key={img + idx}
                  style={[
                    styles.thumbnailItem,
                    {
                      borderColor: isSelected ? colors.accentBlue : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleSelectImage(img, idx)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* 4. STATUT & TAG D'ESTIMATION MENSUELLE */}
        <View
          style={[
            styles.statusRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>
              {property.estLocation ? t('for_rent') : t('for_sale')}
            </Text>
          </View>

          <View
            style={[
              styles.estimatedBadge,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.estimatedBadgeText, { color: colors.textSecondary }]}>
              {property.estLocation ? 'Bail 1 an min' : 'Estimation dispo'}
            </Text>
          </View>
        </View>

        {/* 5. PRIX & TITRE MAJEUR */}
        <View style={styles.titleSection}>
          <View
            style={[
              styles.priceRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Text style={[styles.hugePrice, { color: colors.textPrimary }]}>
              {fmtPrice(property.prix)}
            </Text>
            <Text style={[styles.priceSubtext, { color: colors.textSecondary }]}>
              {property.estLocation ? t('per_month') : `Est. ${fmtPrice(Math.round(property.prix / 250))}/mo`}
            </Text>
          </View>
          <Text
            style={[
              styles.mainTitle,
              { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {property.titre}
          </Text>
          <View
            style={[
              styles.addressRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <MapPin size={15} color={colors.accentBlue} strokeWidth={2} />
            <Text style={[styles.mainAddress, { color: colors.textSecondary }]}>
              {property.localisation}
            </Text>
          </View>
        </View>

        {/* 6. TROIS CARTES DE CARACTÉRISTIQUES */}
        <View
          style={[
            styles.specsGrid,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View
            style={[
              styles.specBox,
              AppShadows.subtle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <BedDouble size={20} color={colors.accentBlue} strokeWidth={2} />
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
              {property.nombreChambres}
            </Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>
              {t('filter_bedrooms')}
            </Text>
          </View>

          <View
            style={[
              styles.specBox,
              AppShadows.subtle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Bath size={20} color={colors.accentBlue} strokeWidth={2} />
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
              {property.nombreSallesDeBain}
            </Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>
              {t('bathrooms_short')}
            </Text>
          </View>

          <View
            style={[
              styles.specBox,
              AppShadows.subtle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Maximize2 size={20} color={colors.accentBlue} strokeWidth={2} />
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
              {property.surfaceM2 ?? 145} {t('area_unit')}
            </Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>
              Surface
            </Text>
          </View>
        </View>

        {/* 7. CARTE SPÉCIFICATIONS IMMOBILIÈRES */}
        <View
          style={[
            styles.specificationsCard,
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
              styles.specItem,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={[styles.specIconBox, { backgroundColor: colors.accentBlueSoft }]}>
              <House size={18} color={colors.accentBlue} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.specItemLabel, { color: colors.textSecondary }]}>
                {t('search_property_type')}
              </Text>
              <Text style={[styles.specItemValue, { color: colors.textPrimary }]}>
                {property.type}
              </Text>
            </View>
          </View>

          <View style={[styles.specDivider, { backgroundColor: colors.border }]} />

          <View
            style={[
              styles.specItem,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={[styles.specIconBox, { backgroundColor: colors.accentBlueSoft }]}>
              <ShieldCheck size={18} color={colors.accentBlue} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.specItemLabel, { color: colors.textSecondary }]}>
                Année / Standing
              </Text>
              <Text style={[styles.specItemValue, { color: colors.textPrimary }]}>
                {property.anneeConstruction ?? 2021} • {property.standing ?? 'Haut Standing'}
              </Text>
            </View>
          </View>
        </View>

        {/* 8. ÉQUIPEMENTS & COMMODITÉS */}
        {property.commodites && property.commodites.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('amenities_title')}
            </Text>
            <View
              style={[
                styles.amenitiesGrid,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              {property.commodites.map((item) => (
                <View
                  key={item}
                  style={[
                    styles.amenityChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <Check size={14} color={colors.accentGreen} strokeWidth={2.5} />
                  <Text style={[styles.amenityText, { color: colors.textSecondary }]}>
                    {translateAmenity(item)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 9. CARTE CONTACT AGENT */}
        <View
          style={[
            styles.agentCard,
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
              styles.agentAvatarBox,
              {
                backgroundColor: colors.accentBlue,
                marginRight: isRTL ? 0 : 14,
                marginLeft: isRTL ? 14 : 0,
              },
            ]}
          >
            <Text style={styles.agentAvatarText}>
              {property.agentNom && property.agentNom.length > 0
                ? property.agentNom.split(' ').map(e => e ? e[0] : '').slice(0, 2).join('')
                : 'P'}
            </Text>
          </View>
          <View style={styles.agentInfo}>
            <Text
              style={[
                styles.agentName,
                { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {property.agentNom ?? 'Propriétaire'}
            </Text>
            <Text
              style={[
                styles.agentRole,
                { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('owner_role')}
            </Text>
            <TouchableOpacity onPress={handleCallOwner} activeOpacity={0.7}>
              <Text
                style={[
                  styles.agentPhone,
                  {
                    color: colors.accentBlue,
                    textDecorationLine: 'underline',
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {property.agentTel || t('phone_unavailable')}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.agentCallBtn, { backgroundColor: colors.accentBlueSoft }]}
            onPress={handleCallOwner}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('btn_call')}
          >
            <Phone size={18} color={colors.accentBlue} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* 10. DESCRIPTION */}
        <View style={styles.descriptionSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('description_title')}
          </Text>
          <Text
            style={[
              styles.descriptionBody,
              { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {property.description}
          </Text>
        </View>
      </ScrollView>

      {/* 11. DOCK FLOTTANT INFÉRIEUR (CTA) AU-DESSUS DE LA BARRE DE NAVIGATION */}
      <View
        style={[
          styles.bottomDock,
          AppShadows.card,
          {
            bottom: bottomClearance - 4,
            backgroundColor: isDark ? 'rgba(21, 30, 50, 0.96)' : 'rgba(255, 255, 255, 0.97)',
            borderColor: colors.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          {isRTL ? (
            <ArrowRight size={15} color={colors.textPrimary} strokeWidth={2.2} />
          ) : (
            <ArrowLeft size={15} color={colors.textPrimary} strokeWidth={2.2} />
          )}
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>
            {t('btn_cancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.scheduleButton,
            { backgroundColor: colors.accentBlue },
          ]}
          onPress={handleScheduleTour}
          activeOpacity={0.85}
        >
          <Text style={styles.scheduleButtonText}>
            {t('btn_schedule_visit')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DE PRISE DE CONTACT AVEC LE PROPRIÉTAIRE */}
      <Modal visible={showContactModal} transparent animationType="slide">
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.content, { backgroundColor: colors.surface }]}>
            <View style={modalStyles.handleBar} />
            <Text style={[modalStyles.title, { color: colors.textPrimary }]}>
              {t('contact_owner')}
            </Text>
            <Text style={[modalStyles.subTitle, { color: colors.textSecondary }]}>
              {t('contact_owner_sub')}
            </Text>

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
              placeholder="Votre numéro de téléphone"
              placeholderTextColor={colors.textSecondary}
              value={senderPhone}
              onChangeText={setSenderPhone}
              keyboardType="phone-pad"
            />

            <TextInput
              style={[
                modalStyles.input,
                modalStyles.textArea,
                { color: colors.textPrimary, borderColor: colors.border },
              ]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  heroContainer: {
    height: 360,
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  badge360: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  photoCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  photoCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  topActionsBar: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  glassCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  thumbnailStrip: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  thumbnailContainer: {
    gap: 12,
  },
  thumbnailItem: {
    width: 88,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  statusRow: {
    justifyContent: 'space-between',
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
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.30)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: AppColors.accentGreen,
    marginRight: 6,
  },
  statusBadgeText: {
    color: AppColors.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  estimatedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  estimatedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  priceRow: {
    alignItems: 'baseline',
    gap: 8,
  },
  hugePrice: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  priceSubtext: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  addressRow: {
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  mainAddress: {
    fontSize: 14,
  },
  specsGrid: {
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
  },
  specBox: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  specBoxValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  specBoxLabel: {
    fontSize: 11,
  },
  specificationsCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  specIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specItemLabel: {
    fontSize: 11,
  },
  specItemValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  specDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 12,
  },
  amenitiesSection: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  amenitiesGrid: {
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  amenityChip: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  amenityText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  agentCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  agentRole: {
    fontSize: 11.5,
    marginBottom: 4,
  },
  agentPhone: {
    fontSize: 12,
    fontWeight: '600',
  },
  agentCallBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomDock: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
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
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
