// ============================================================
// DARLINK — ÉCRAN DE DÉPÔT D'ANNONCE (React Native)
// Authentification requise, 24 gouvernorats, statut d'annonce,
// validation URL photo HTTPS, zéro emoji.
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
import { ArrowLeft, Check, Plus, ShieldAlert } from 'lucide-react-native';
import { TUNISIA_GOVERNORATES } from '../../../../core/constants/tunisiaLocations';
import { isValidImageUrl } from '../../../../core/firebase/storageService';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { authService } from '../../../auth/services/authService';
import { propertyApiService } from '../../services/propertyApiService';
import { ListingStatus, Property, PropertyType } from '../../domain/models/property';

interface AddPropertyScreenProps {
  onBack: () => void;
  onPropertyCreated?: (property: Property) => void;
}

export const AddPropertyScreen: React.FC<AddPropertyScreenProps> = ({ onBack, onPropertyCreated }) => {
  const { colors, isDark } = useTheme();
  const isAuthenticated = authService.isAuthenticated();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [surface, setSurface] = useState('');
  const [governorate, setGovernorate] = useState('Tunis');
  const [neighborhood, setNeighborhood] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PropertyType>('Appartement');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [isRental, setIsRental] = useState(false);
  const [listingStatus, setListingStatus] = useState<ListingStatus>('PUBLISHED');
  const [submitting, setSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Climatisation']);

  const amenitiesList = ['Piscine', 'Vue mer', 'Climatisation', 'Garage', 'Jardin', 'Ascenseur', 'Sécurité 24/7'];
  const types: PropertyType[] = ['Appartement', 'Villa', 'Maison', 'Studio', 'Terrain', 'Commercial'];

  const toggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!authService.isAuthenticated()) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter depuis l’onglet Profil avant de publier.');
      return;
    }
    if (!title.trim() || !price.trim() || !surface.trim() || !neighborhood.trim()) {
      Alert.alert('Champs obligatoires', 'Veuillez remplir le titre, le prix, la surface et la délégation/quartier.');
      return;
    }

    const numPrice = parseFloat(price.replace(/\s+/g, ''));
    const numSurface = parseInt(surface.replace(/\s+/g, ''), 10);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Prix invalide', 'Le prix doit être strictement positif.');
      return;
    }
    if (isNaN(numSurface) || numSurface <= 0) {
      Alert.alert('Surface invalide', 'La surface doit être strictement positive.');
      return;
    }
    if (imageUrl.trim() && !isValidImageUrl(imageUrl)) {
      Alert.alert('URL photo invalide', 'Seules les URL HTTPS sécurisées sont acceptées.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await propertyApiService.createProperty({
        title: title.trim(),
        description: description.trim() || `${type} situé à ${neighborhood.trim()}, ${governorate}.`,
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
        imageUrl: imageUrl.trim(),
        listingStatus,
      });

      Alert.alert('Annonce enregistrée', `Votre annonce (${listingStatus}) a été publiée dans Cloud Firestore.`, [
        {
          text: 'OK',
          onPress: () => {
            if (onPropertyCreated) onPropertyCreated(created);
            onBack();
          },
        },
      ]);
    } catch (err: unknown) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Publication impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]} onPress={onBack}>
          <ArrowLeft size={19} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Déposer une annonce</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isAuthenticated && (
          <View style={[styles.authWarning, { borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)' }]}>
            <ShieldAlert size={18} color="#D97706" />
            <Text style={{ flex: 1, fontSize: 12.5, color: isDark ? '#FDE68A' : '#92400E' }}>
              Connectez-vous dans votre Profil pour lier cette annonce à votre compte Firebase vérifié.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Transaction & Statut</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isRental ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setIsRental(false)}
          >
            <Text style={[styles.toggleText, { color: !isRental ? '#FFFFFF' : colors.textSecondary }]}>Vente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isRental ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setIsRental(true)}
          >
            <Text style={[styles.toggleText, { color: isRental ? '#FFFFFF' : colors.textSecondary }]}>Location</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.toggleRow, { marginTop: 10 }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, listingStatus === 'PUBLISHED' ? { backgroundColor: '#10B981' } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setListingStatus('PUBLISHED')}
          >
            <Text style={[styles.toggleText, { color: listingStatus === 'PUBLISHED' ? '#FFFFFF' : colors.textSecondary }]}>Publier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, listingStatus === 'DRAFT' ? { backgroundColor: '#64748B' } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => setListingStatus('DRAFT')}
          >
            <Text style={[styles.toggleText, { color: listingStatus === 'DRAFT' ? '#FFFFFF' : colors.textSecondary }]}>Brouillon</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Type de bien</Text>
        <View style={styles.chipWrap}>
          {types.map((t) => {
            const active = type === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.chip, active ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Titre de l’annonce</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Ex: Appartement S+3 Ennasr 2"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Gouvernorat</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
          {TUNISIA_GOVERNORATES.map((g) => {
            const active = governorate === g.nameFr;
            return (
              <TouchableOpacity
                key={g.code}
                style={[styles.cityChip, active ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setGovernorate(g.nameFr)}
              >
                <Text style={{ color: active ? '#FFFFFF' : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
                  {g.nameFr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 16 }]}>Délégation / Quartier</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Ex: Ennasr 2, Sahloul, Centre-ville..."
          placeholderTextColor={colors.textSecondary}
          value={neighborhood}
          onChangeText={setNeighborhood}
        />

        <View style={styles.twoCols}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 16 }]}>
              {isRental ? 'Loyer (DT/mois)' : 'Prix (DT)'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="280000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 16 }]}>Surface (m²)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="135"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={surface}
              onChangeText={setSurface}
            />
          </View>
        </View>

        <View style={styles.twoCols}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 16 }]}>Chambres</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity style={[styles.counterBtn, { backgroundColor: colors.surface }]} onPress={() => setBedrooms(Math.max(0, bedrooms - 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{bedrooms}</Text>
              <TouchableOpacity style={[styles.counterBtn, { backgroundColor: colors.surface }]} onPress={() => setBedrooms(bedrooms + 1)}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 16 }]}>Salles de bain</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity style={[styles.counterBtn, { backgroundColor: colors.surface }]} onPress={() => setBathrooms(Math.max(0, bathrooms - 1))}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{bathrooms}</Text>
              <TouchableOpacity style={[styles.counterBtn, { backgroundColor: colors.surface }]} onPress={() => setBathrooms(bathrooms + 1)}>
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 16 }]}>URL Photo authentique (HTTPS, optionnel)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="https://firebasestorage.googleapis.com/..."
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 16 }]}>Atouts & Équipements</Text>
        <View style={styles.chipWrap}>
          {amenitiesList.map((a) => {
            const active = selectedAmenities.includes(a);
            return (
              <TouchableOpacity
                key={a}
                style={[styles.amenityChip, active ? { backgroundColor: colors.accentBlue } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => toggleAmenity(a)}
              >
                {active ? <Check size={12} color="#FFFFFF" /> : <Plus size={12} color={colors.textSecondary} />}
                <Text style={{ color: active ? '#FFFFFF' : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>{a}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 16 }]}>Description détaillée</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Décrivez précisément le bien..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.accentBlue }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Enregistrer l’annonce</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  authWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionLabel: { fontSize: 12.5, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontWeight: '700', fontSize: 13.5 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  chipText: { fontWeight: '600', fontSize: 12.5 },
  cityScroll: { gap: 8, paddingBottom: 4 },
  cityChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  twoCols: { flexDirection: 'row' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, minHeight: 96, textAlignVertical: 'top' },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  counterBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { fontSize: 18, fontWeight: '600' },
  counterVal: { fontSize: 16, fontWeight: '700' },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  submitButton: { marginTop: 26, paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
