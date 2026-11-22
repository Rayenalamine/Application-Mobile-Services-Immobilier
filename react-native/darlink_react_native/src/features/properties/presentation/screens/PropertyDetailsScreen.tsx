// ============================================================
// DARLINK — ÉCRAN DE DÉTAILS DU BIEN LUXE (React Native Screen 2)
// Adaptatif Clair / Sombre, parité complète avec la maquette Screen 2
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
import { AppColors } from '../../../../core/constants/colors';
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
  const { t, formatPrice: fmtPrice, translateAmenity } = useTranslation();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HERO IMAGE IMMERSIVE AVEC ARRONDIS INFÉRIEURS */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: displayedImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Bouton 360 / Visite virtuelle en bas à gauche */}
          <View style={styles.badge360}>
            <Text style={styles.badge360Icon}>▶</Text>
          </View>

          {/* Compteur d'images en bas à droite (ex: 1/4) */}
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>
              📷 {imageIndex + 1}/{allImages.length}
            </Text>
          </View>
        </View>

        {/* 2. BARRE D'ACTION SUPÉRIEURE FLOTTANTE */}
        <View style={styles.topActionsBar}>
          <TouchableOpacity
            style={[
              styles.glassCircleBtn,
              {
                backgroundColor: isDark ? 'rgba(15, 16, 21, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retour à la liste"
          >
            <Text style={[styles.circleBtnIcon, { color: isDark ? '#FFFFFF' : '#0F1015' }]}>
              ←
            </Text>
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={[
                styles.glassCircleBtn,
                {
                  backgroundColor: isDark ? 'rgba(15, 16, 21, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
              onPress={handleToggleFavorite}
              activeOpacity={0.8}
            >
              <Text style={styles.circleBtnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>

            {/* Suppression réservée au propriétaire légitime */}
            {authService.getCurrentUser() &&
              String(authService.getCurrentUser()?.id) === String((property as any).proprietaireId || (property as any).ownerId) && (
                <TouchableOpacity
                  style={[
                    styles.glassCircleBtn,
                    {
                      backgroundColor: isDark ? 'rgba(15, 16, 21, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                  onPress={handleDeleteProperty}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.circleBtnIcon, { color: '#EF4444' }]}>
                    🗑️
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>

        {/* 3. BANDE HORIZONTALE DES MINIATURES DE PIÈCES */}
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
                      borderColor: isSelected
                        ? (isDark ? '#FFFFFF' : '#0F1015')
                        : colors.border,
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
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>
              {property.estLocation ? 'À Louer' : 'À Vendre'}
            </Text>
          </View>

          <View
            style={[
              styles.estimatedBadge,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
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
          <View style={styles.priceRow}>
            <Text style={[styles.hugePrice, { color: colors.textPrimary }]}>
              {formatPrice(property.prix)}
            </Text>
            <Text style={[styles.priceSubtext, { color: colors.textSecondary }]}>
              {property.estLocation ? '/mois' : `Est. ${formatPrice(Math.round(property.prix / 250))}/mo`}
            </Text>
          </View>
          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
            {property.titre}
          </Text>
          <Text style={[styles.mainAddress, { color: colors.textSecondary }]}>
            📍 {property.localisation}
          </Text>
        </View>

        {/* 6. TROIS GRANDES CARTES DE CARACTÉRISTIQUES */}
        <View style={styles.specsGrid}>
          <View
            style={[
              styles.specBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.specBoxIcon}>🛏️</Text>
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
              {property.nombreChambres} Bed
            </Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>Chambres</Text>
          </View>

          <View
            style={[
              styles.specBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.specBoxIcon}>🚿</Text>
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
              {property.nombreSallesDeBain} Bath
            </Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>Salles de bain</Text>
          </View>

          <View
            style={[
              styles.specBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.specBoxIcon}>📐</Text>
            <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
              {property.surfaceM2 ?? 145} m²
            </Text>
            <Text style={[styles.specBoxLabel, { color: colors.textSecondary }]}>Surface</Text>
          </View>
        </View>

        {/* 7. CARTE SPÉCIFICATIONS IMMOBILIÈRES */}
        <View
          style={[
            styles.specificationsCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.specItem}>
            <Text style={styles.specItemIcon}>🏠</Text>
            <View>
              <Text style={[styles.specItemLabel, { color: colors.textSecondary }]}>
                Type de bien
              </Text>
              <Text style={[styles.specItemValue, { color: colors.textPrimary }]}>
                {property.type}
              </Text>
            </View>
          </View>

          <View style={[styles.specDivider, { backgroundColor: colors.border }]} />

          <View style={styles.specItem}>
            <Text style={styles.specItemIcon}>🛡️</Text>
            <View>
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
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('amenities_title')}
            </Text>
            <View style={styles.amenitiesGrid}>
              {property.commodites.map((item) => (
                <View
                  key={item}
                  style={[
                    styles.amenityChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={styles.amenityCheck}>✓</Text>
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
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.agentAvatarBox}>
            <Text style={styles.agentAvatarText}>
              {property.agentNom && property.agentNom.length > 0
                ? property.agentNom.split(' ').map(e => e ? e[0] : '').slice(0, 2).join('')
                : 'P'}
            </Text>
          </View>
          <View style={styles.agentInfo}>
            <Text style={[styles.agentName, { color: colors.textPrimary }]}>
              {property.agentNom ?? 'Propriétaire'}
            </Text>
            <Text style={[styles.agentRole, { color: colors.textSecondary }]}>
              {t('owner_role')}
            </Text>
            <TouchableOpacity onPress={handleCallOwner} activeOpacity={0.7}>
              <Text style={[styles.agentPhone, { textDecorationLine: 'underline' }]}>
                {property.agentTel || t('phone_unavailable')}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.agentCallBtn}
            onPress={handleCallOwner}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('btn_call')}
          >
            <Text style={styles.agentCallIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* 10. DESCRIPTION */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('description_title')}
          </Text>
          <Text style={[styles.descriptionBody, { color: colors.textSecondary }]}>
            {property.description}
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 11. DOCK FLOTTANT INFÉRIEUR (CTA) */}
      <View
        style={[
          styles.bottomDock,
          {
            backgroundColor: isDark ? 'rgba(15, 16, 21, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>
            ← {t('btn_cancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.scheduleButton,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#0F1015',
            },
          ]}
          onPress={handleScheduleTour}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.scheduleButtonText,
              { color: isDark ? '#0F1015' : '#FFFFFF' },
            ]}
          >
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    height: 380,
    width: '100%',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
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
    backgroundColor: 'rgba(24, 25, 32, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badge360Icon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  photoCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(24, 25, 32, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
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
    flexDirection: 'row',
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
  circleBtnIcon: {
    fontSize: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
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
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hugePrice: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  priceSubtext: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  mainAddress: {
    fontSize: 14,
    marginTop: 4,
  },
  specsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  specBox: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  specBoxIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  specBoxValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  specBoxLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  specificationsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  specItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  specItemIcon: {
    fontSize: 20,
    marginRight: 10,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  amenityCheck: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 12,
    marginRight: 6,
  },
  amenityText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
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
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  agentCallBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentCallIcon: {
    fontSize: 18,
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
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '800',
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
    backgroundColor: '#CCCCCC',
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
