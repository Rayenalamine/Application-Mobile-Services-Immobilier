// ============================================================
// DARLINK — ÉCRAN DE DÉPÔT & ÉDITION D'ANNONCE (React Native)
// Sélection multi-photos réelle (expo-image-picker), upload Firebase Storage,
// prévisualisation & couverture, trilingue FR/AR/EN + RTL.
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ArrowLeft, ArrowRight, Camera, Check, ImagePlus, ShieldAlert, X } from 'lucide-react-native';
import { TUNISIA_GOVERNORATES } from '../../../../core/constants/tunisiaLocations';
import { uploadImageToFirebaseStorage, deleteStorageObject, validateImageUpload } from '../../../../core/firebase/storageService';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { authService } from '../../../auth/services/authService';
import { propertyApiService } from '../../services/propertyApiService';
import { ListingStatus, Property, PropertyType } from '../../domain/models/property';

interface SelectedPhoto {
  uri: string;
  fileName: string;
  mimeType: string;
  isRemote: boolean;
}

interface AddPropertyScreenProps {
  onBack: () => void;
  onPropertyCreated?: (property: Property) => void;
  propertyToEdit?: Property;
}

export const AddPropertyScreen: React.FC<AddPropertyScreenProps> = ({
  onBack,
  onPropertyCreated,
  propertyToEdit,
}) => {
  const { colors, isDark } = useTheme();
  const { t, isRTL, translatePropertyType, translateAmenity, translateListingStatus } = useTranslation();
  const isAuthenticated = authService.isAuthenticated();

  const initialPhotos: SelectedPhoto[] = [];
  if (propertyToEdit?.imageUrl) {
    initialPhotos.push({
      uri: propertyToEdit.imageUrl,
      fileName: 'cover.jpg',
      mimeType: 'image/jpeg',
      isRemote: true,
    });
  }
  if (propertyToEdit?.imagesGalerie) {
    for (const url of propertyToEdit.imagesGalerie) {
      if (url && url !== propertyToEdit.imageUrl) {
        initialPhotos.push({
          uri: url,
          fileName: 'gallery.jpg',
          mimeType: 'image/jpeg',
          isRemote: true,
        });
      }
    }
  }

  const [title, setTitle] = useState(propertyToEdit?.titre || '');
  const [price, setPrice] = useState(propertyToEdit?.prix ? String(Math.round(propertyToEdit.prix)) : '');
  const [surface, setSurface] = useState(propertyToEdit?.surfaceM2 ? String(propertyToEdit.surfaceM2) : '');
  const [governorate, setGovernorate] = useState(propertyToEdit?.governorate || 'Tunis');
  const [neighborhood, setNeighborhood] = useState(
    propertyToEdit?.neighborhood || propertyToEdit?.city || ''
  );
  const [photos, setPhotos] = useState<SelectedPhoto[]>(initialPhotos);
  const [description, setDescription] = useState(propertyToEdit?.description || '');
  const [type, setType] = useState<PropertyType>(propertyToEdit?.type || 'Appartement');
  const [bedrooms, setBedrooms] = useState(propertyToEdit?.nombreChambres ?? 2);
  const [bathrooms, setBathrooms] = useState(propertyToEdit?.nombreSallesDeBain ?? 1);
  const [isRental, setIsRental] = useState(Boolean(propertyToEdit?.estLocation));
  const [listingStatus, setListingStatus] = useState<ListingStatus>(
    propertyToEdit?.listingStatus === 'DRAFT' ? 'DRAFT' : 'PENDING_REVIEW'
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    propertyToEdit?.commodites?.length ? propertyToEdit.commodites : ['Climatisation']
  );

  const amenitiesList = [
    'Piscine',
    'Vue mer',
    'Climatisation',
    'Garage',
    'Jardin',
    'Ascenseur',
    'Sécurité 24/7',
  ];
  const types: PropertyType[] = ['Appartement', 'Villa', 'Maison', 'Studio', 'Terrain', 'Commercial'];

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const inferMimeType = (uri: string, provided?: string | null): string => {
    if (provided && /^image\/(jpeg|jpg|png|webp)$/i.test(provided)) {
      return provided.toLowerCase();
    }
    const lower = uri.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  };

  const pickFromGallery = async () => {
    if (submitting || photos.length >= 8) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('add_photos'), t('upload_failed'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 8 - photos.length),
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) return;

    const added: SelectedPhoto[] = [];
    for (const asset of result.assets) {
      if (photos.length + added.length >= 8) break;
      const mimeType = inferMimeType(asset.uri, asset.mimeType);
      const check = validateImageUpload({
        mimeType,
        sizeBytes: asset.fileSize,
      });
      if (!check.valid) {
        Alert.alert(t('upload_failed'), check.error || t('photo_limit_hint'));
        continue;
      }
      added.push({
        uri: asset.uri,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        mimeType,
        isRemote: false,
      });
    }
    if (added.length > 0) {
      setPhotos((prev) => [...prev, ...added]);
    }
  };

  const pickFromCamera = async () => {
    if (submitting || photos.length >= 8) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('add_photos'), t('upload_failed'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const mimeType = inferMimeType(asset.uri, asset.mimeType);
    const check = validateImageUpload({ mimeType, sizeBytes: asset.fileSize });
    if (!check.valid) {
      Alert.alert(t('upload_failed'), check.error || t('photo_limit_hint'));
      return;
    }
    setPhotos((prev) => [
      ...prev,
      {
        uri: asset.uri,
        fileName: asset.fileName || `camera_${Date.now()}.jpg`,
        mimeType,
        isRemote: false,
      },
    ]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const setAsCover = (index: number) => {
    if (index <= 0) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!authService.isAuthenticated()) {
      Alert.alert(t('btn_login'), t('auth_required_publish'));
      return;
    }
    if (!title.trim() || !price.trim() || !surface.trim() || !neighborhood.trim()) {
      Alert.alert(t('publish_error'), t('validation_required_fields'));
      return;
    }

    const numPrice = parseFloat(price.replace(/\s+/g, ''));
    const numSurface = parseInt(surface.replace(/\s+/g, ''), 10);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert(t('publish_error'), t('validation_price'));
      return;
    }
    if (isNaN(numSurface) || numSurface <= 0) {
      Alert.alert(t('publish_error'), t('validation_surface'));
      return;
    }
    if (photos.length === 0) {
      Alert.alert(t('publish_error'), t('validation_photo_required'));
      return;
    }

    setSubmitting(true);
    const localPhotos = photos.filter((p) => !p.isRemote);
    setUploadProgress(localPhotos.length > 0 ? { current: 0, total: localPhotos.length } : null);

    const uploadedStoragePaths: string[] = [];
    let createdDraftId: string | null = null;
    let activeToken: string | null = null;

    try {
      const idToken = authService.getToken();
      const currentUser = authService.getCurrentUser();
      if (!idToken || !currentUser) {
        throw new Error(t('auth_required_publish'));
      }
      activeToken = idToken;

      const propertyIdForStorage = propertyToEdit?.id || `prop_${Date.now()}`;
      const finalDescription =
        description.trim() ||
        `${translatePropertyType(type)} — ${neighborhood.trim()}, ${governorate}`;

      // Step 3 (P0): Create property in DRAFT BEFORE uploading photos
      // so Firestore rules for property_images (exists(properties/{id})) pass.
      if (!propertyToEdit?.id) {
        const draftProp = await propertyApiService.createProperty({
          id: propertyIdForStorage,
          title: title.trim(),
          description: finalDescription,
          type,
          price: numPrice,
          location: `${neighborhood.trim()}, ${governorate}`,
          governorate,
          city: neighborhood.trim(),
          neighborhood: neighborhood.trim(),
          bedrooms,
          bathrooms,
          surfaceM2: numSurface,
          isRental,
          amenities: selectedAmenities,
          imageUrl: '',
          galleryUrls: [],
          listingStatus: 'DRAFT',
        });
        createdDraftId = draftProp.id || propertyIdForStorage;
      }

      // Step 4 (P0): Upload new local images to Firebase Storage
      const uploadedUrls: string[] = [];
      let uploadStep = 0;

      for (const photo of photos) {
        if (photo.isRemote) {
          uploadedUrls.push(photo.uri);
        } else {
          uploadStep += 1;
          setUploadProgress({ current: uploadStep, total: localPhotos.length });
          const resp = await fetch(photo.uri);
          const arrayBuffer = await resp.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const uploaded = await uploadImageToFirebaseStorage({
            idToken,
            userId: currentUser.id,
            propertyId: propertyIdForStorage,
            fileName: photo.fileName,
            mimeType: photo.mimeType,
            bytes,
          });
          uploadedUrls.push(uploaded.downloadUrl);
          if (uploaded.storagePath) uploadedStoragePaths.push(uploaded.storagePath);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error(t('upload_failed'));
      }

      const coverUrl = uploadedUrls[0];
      const galleryUrls = uploadedUrls.slice(1);

      // Step 5 & 6 (P0): Save image references and final listingStatus
      const savedProp = await propertyApiService.updateProperty(propertyIdForStorage, {
        title: title.trim(),
        description: finalDescription,
        type,
        price: numPrice,
        location: `${neighborhood.trim()}, ${governorate}`,
        governorate,
        city: neighborhood.trim(),
        neighborhood: neighborhood.trim(),
        bedrooms,
        bathrooms,
        surfaceM2: numSurface,
        isRental,
        amenities: selectedAmenities,
        imageUrl: coverUrl,
        galleryUrls,
        listingStatus,
      });

      if (!savedProp) {
        throw new Error(t('publish_error'));
      }

      Alert.alert(
        t('publish_saved_title'),
        t('publish_saved_status', {
          title: savedProp.titre,
          status: translateListingStatus(savedProp.listingStatus || listingStatus),
        }),
        [
          {
            text: t('btn_ok'),
            onPress: () => {
              if (onPropertyCreated && savedProp) onPropertyCreated(savedProp);
              onBack();
            },
          },
        ]
      );
    } catch (err: unknown) {
      if (activeToken) {
        for (const path of uploadedStoragePaths) {
          await deleteStorageObject(activeToken, path);
        }
      }
      if (createdDraftId) {
        await propertyApiService.deleteProperty(createdDraftId);
      }
      Alert.alert(
        t('publish_error'),
        err instanceof Error ? err.message : t('publish_error')
      );
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]} onPress={onBack}>
          {isRTL ? (
            <ArrowRight size={19} color={colors.textPrimary} />
          ) : (
            <ArrowLeft size={19} color={colors.textPrimary} />
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {propertyToEdit ? t('edit_title') : t('add_title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isAuthenticated && (
          <View style={[styles.authWarning, { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)' }]}>
            <ShieldAlert size={18} color="#D97706" />
            <Text style={{ flex: 1, fontSize: 12.5, color: isDark ? '#FDE68A' : '#92400E', textAlign: isRTL ? 'right' : 'left' }}>
              {t('auth_required_publish')}
            </Text>
          </View>
        )}

        {/* Photos Picker */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
          {t('add_photos')} ({t('photos_selected', { count: photos.length })})
        </Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.photoPickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={pickFromGallery}
            disabled={submitting}
          >
            <ImagePlus size={18} color={colors.accentBlue} />
            <Text style={[styles.photoPickerText, { color: colors.textPrimary }]}>{t('pick_from_gallery')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.photoPickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={pickFromCamera}
            disabled={submitting}
          >
            <Camera size={18} color={colors.accentBlue} />
            <Text style={[styles.photoPickerText, { color: colors.textPrimary }]}>{t('take_photo')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 6 }}>
          {t('photo_limit_hint')}
        </Text>

        {photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {photos.map((photo, idx) => (
              <View key={`${photo.uri}_${idx}`} style={styles.previewWrap}>
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.previewImg}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                <TouchableOpacity style={styles.removeBadge} onPress={() => removePhoto(idx)}>
                  <X size={13} color="#FFFFFF" />
                </TouchableOpacity>
                {idx === 0 ? (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>{t('cover_photo')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.coverBadge} onPress={() => setAsCover(idx)}>
                    <Text style={styles.coverBadgeText}>{t('set_as_cover')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>
          {t('transaction_and_status')}
        </Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isRental ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setIsRental(false)}
          >
            <Text style={[styles.toggleText, { color: !isRental ? '#FFFFFF' : colors.textSecondary }]}>
              {t('for_sale')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isRental ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setIsRental(true)}
          >
            <Text style={[styles.toggleText, { color: isRental ? '#FFFFFF' : colors.textSecondary }]}>
              {t('for_rent')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.toggleRow, { marginTop: 10 }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, listingStatus === 'PENDING_REVIEW' ? { backgroundColor: '#9A7B4F' } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setListingStatus('PENDING_REVIEW')}
          >
            <Text style={[styles.toggleText, { color: listingStatus === 'PENDING_REVIEW' ? '#FFFFFF' : colors.textSecondary }]}>
              {t('submit_for_review')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, listingStatus === 'DRAFT' ? { backgroundColor: '#64748B' } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setListingStatus('DRAFT')}
          >
            <Text style={[styles.toggleText, { color: listingStatus === 'DRAFT' ? '#FFFFFF' : colors.textSecondary }]}>
              {t('save_as_draft')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>
          {t('property_type')}
        </Text>
        <View style={styles.chipWrap}>
          {types.map((item) => {
            const active = type === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setType(item)}
              >
                <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  {translatePropertyType(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('field_title')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('field_title_hint')}
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('field_price')} *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('field_price_hint')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('field_surface')} *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder="150"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={surface}
              onChangeText={setSurface}
            />
          </View>
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('governorate')} *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
          {TUNISIA_GOVERNORATES.map((g) => {
            const active = governorate === g.nameFr;
            return (
              <TouchableOpacity
                key={g.nameFr}
                style={[styles.chip, { marginRight: 8 }, active ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setGovernorate(g.nameFr)}
              >
                <Text style={{ color: active ? '#FFFFFF' : colors.textPrimary, fontSize: 12.5, fontWeight: '600' }}>
                  {g.nameFr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('neighborhood_label')} *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('neighborhood_hint')}
          placeholderTextColor={colors.textSecondary}
          value={neighborhood}
          onChangeText={setNeighborhood}
        />

        <View style={styles.row}>
          <View style={[styles.counterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>{t('field_bedrooms')}</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setBedrooms(Math.max(0, bedrooms - 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{bedrooms}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setBedrooms(bedrooms + 1)}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.counterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>{t('field_bathrooms')}</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setBathrooms(Math.max(0, bathrooms - 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{bathrooms}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setBathrooms(bathrooms + 1)}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>
          {t('amenities_title')}
        </Text>
        <View style={styles.chipWrap}>
          {amenitiesList.map((item) => {
            const active = selectedAmenities.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active ? { backgroundColor: 'rgba(154,123,79,0.16)', borderColor: '#9A7B4F', borderWidth: 1 } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => toggleAmenity(item)}
              >
                <Text style={{ color: active ? '#9A7B4F' : colors.textSecondary, fontSize: 12.5, fontWeight: '600' }}>
                  {translateAmenity(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('field_description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('field_description_hint')}
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {uploadProgress && (
          <Text style={{ textAlign: 'center', color: '#9A7B4F', fontSize: 12.5, marginTop: 14, fontWeight: '600' }}>
            {t('uploading_photos', { current: uploadProgress.current, total: uploadProgress.total })}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: isDark ? '#F5F5F7' : '#1D1D1F', opacity: submitting ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={isDark ? '#1D1D1F' : '#FFFFFF'} />
          ) : (
            <>
              <Check size={18} color={isDark ? '#1D1D1F' : '#FFFFFF'} />
              <Text style={[styles.submitText, { color: isDark ? '#1D1D1F' : '#FFFFFF' }]}>
                {propertyToEdit ? t('btn_save') : t('btn_publish')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 60 },
  authWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { fontWeight: '700', fontSize: 13.5 },
  photoPickerBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPickerText: { fontSize: 13, fontWeight: '600' },
  previewWrap: {
    width: 118,
    height: 118,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
  },
  previewImg: { width: '100%', height: '100%' },
  removeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  coverBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  inputLabel: { fontSize: 12.5, fontWeight: '600', marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14.5,
  },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12, marginTop: 6 },
  counterCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  counterLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counterBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(154,123,79,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: { fontSize: 16, fontWeight: '700' },
  counterVal: { fontSize: 16, fontWeight: '700' },
  submitBtn: {
    height: 52,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
  },
  submitText: { fontSize: 15, fontWeight: '700' },
});
