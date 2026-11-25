// ============================================================
// DARLINK — ÉCRAN DE DÉPÔT D'ANNONCE (React Native)
// Icônes vectorielles Lucide, Design System unifié & support RTL
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
import { ChevronLeft, ChevronRight, Plus, Minus, Check } from 'lucide-react-native';
import { AppShadows } from '../../../../core/constants/spacing';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { useTranslation } from '../../../../core/localization/LocalizationContext';
import { useBottomNavClearance } from '../../../../core/components/FloatingBottomNav';
import { propertyApiService } from '../../services/propertyApiService';
import { Property } from '../../domain/models/property';

interface AddPropertyScreenProps {
  onBack: () => void;
  onPropertyCreated?: (property: Property) => void;
}

export const AddPropertyScreen: React.FC<AddPropertyScreenProps> = ({ onBack, onPropertyCreated }) => {
  const { colors } = useTheme();
  const { t, isRTL } = useTranslation();
  const bottomClearance = useBottomNavClearance();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [surface, setSurface] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Appartement' | 'Villa' | 'Maison'>('Appartement');
  const [city, setCity] = useState('Tunis');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [isRental, setIsRental] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Climatisation',
    'Ascenseur',
  ]);

  const amenitiesList = [
    'Piscine',
    'Vue mer',
    'Climatisation',
    'Garage',
    'Jardin',
    'Ascenseur',
    'Sécurité 24/7',
  ];

  const types: ('Appartement' | 'Villa' | 'Maison')[] = ['Appartement', 'Villa', 'Maison'];
  const cities = ['Tunis', 'Sousse', 'Hammamet', 'Djerba', 'Monastir', 'Sfax'];

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price.trim() || !surface.trim() || !location.trim()) {
      Alert.alert('Champs obligatoires', 'Veuillez remplir le titre, le prix, la surface et la localisation.');
      return;
    }

    const numPrice = parseFloat(price);
    const numSurface = parseInt(surface, 10);

    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Prix invalide', 'Le prix doit être un nombre strictement positif.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await propertyApiService.createProperty({
        title: title.trim(),
        description: description.trim() || 'Superbe propriété haut standing idéalement située.',
        type,
        price: numPrice,
        location: `${location.trim()}, ${city}`,
        city,
        bedrooms,
        bathrooms,
        surfaceM2: numSurface || 120,
        isRental,
        amenities: selectedAmenities,
        standing: 'Haut Standing',
      });

      Alert.alert('Succès', 'Votre annonce a été publiée avec succès !', [
        {
          text: 'OK',
          onPress: () => {
            if (onPropertyCreated) onPropertyCreated(created);
            onBack();
          },
        },
      ]);
    } catch {
      Alert.alert('Erreur', 'Impossible de publier votre annonce pour le moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.iconButton,
            AppShadows.subtle,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          {isRTL ? (
            <ChevronRight size={20} color={colors.textPrimary} strokeWidth={2.2} />
          ) : (
            <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2.2} />
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Déposer une annonce</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomClearance + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TYPE DE TRANSACTION */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          Type de transaction
        </Text>
        <View
          style={[
            styles.toggleRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !isRental
                ? { backgroundColor: colors.accentBlue }
                : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => setIsRental(false)}
          >
            <Text
              style={[
                styles.toggleText,
                { color: !isRental ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Vente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              isRental
                ? { backgroundColor: colors.accentBlue }
                : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => setIsRental(true)}
          >
            <Text
              style={[
                styles.toggleText,
                { color: isRental ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* TYPE DE BIEN */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textPrimary, marginTop: 18, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          Type de bien
        </Text>
        <View
          style={[
            styles.chipRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {types.map((item) => {
            const active = type === item;
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  active
                    ? { backgroundColor: colors.accentBlue }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => setType(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TITRE */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textPrimary, marginTop: 18, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          Titre de l'annonce
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder="Ex: Villa contemporaine avec piscine"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        {/* VILLE & ADRESSE */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textPrimary, marginTop: 18, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          Gouvernorat / Ville
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
          {cities.map((c) => {
            const active = city === c;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.cityChip,
                  active
                    ? { backgroundColor: colors.accentBlue }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => setCity(c)}
              >
                <Text style={{ color: active ? '#FFFFFF' : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textPrimary, marginTop: 18, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          Quartier ou Adresse
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder="Ex: Les Berges du Lac 2"
          placeholderTextColor={colors.textSecondary}
          value={location}
          onChangeText={setLocation}
        />

        {/* PRIX ET SURFACE */}
        <View style={styles.twoCols}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>
              {isRental ? 'Loyer (DT / mois)' : 'Prix (DT)'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="320 000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Surface (m²)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="180"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={surface}
              onChangeText={setSurface}
            />
          </View>
        </View>

        {/* CHAMBRES & SDB */}
        <View style={styles.twoCols}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Chambres</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setBedrooms(Math.max(1, bedrooms - 1))}
              >
                <Minus size={16} color={colors.textPrimary} strokeWidth={2.2} />
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{bedrooms}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setBedrooms(bedrooms + 1)}
              >
                <Plus size={16} color={colors.textPrimary} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Salles de bain</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setBathrooms(Math.max(1, bathrooms - 1))}
              >
                <Minus size={16} color={colors.textPrimary} strokeWidth={2.2} />
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{bathrooms}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setBathrooms(bathrooms + 1)}
              >
                <Plus size={16} color={colors.textPrimary} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* COMMODITÉS */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textPrimary, marginTop: 18, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          Commodités & Atouts
        </Text>
        <View
          style={[
            styles.amenitiesWrap,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {amenitiesList.map((a) => {
            const active = selectedAmenities.includes(a);
            return (
              <TouchableOpacity
                key={a}
                style={[
                  styles.amenityChip,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  active
                    ? { backgroundColor: colors.accentBlue }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => toggleAmenity(a)}
              >
                {active ? (
                  <Check size={13} color="#FFFFFF" strokeWidth={2.5} />
                ) : (
                  <Plus size={13} color={colors.textSecondary} strokeWidth={2.2} />
                )}
                <Text style={{ color: active ? '#FFFFFF' : colors.textSecondary, fontSize: 12.5, fontWeight: '600' }}>
                  {a}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* DESCRIPTION */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textPrimary, marginTop: 18, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          Description du bien
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: colors.border,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          placeholder="Décrivez les atouts, l'orientation, les finitions de votre bien..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* BOUTON DE SOUMISSION */}
        <TouchableOpacity
          style={[styles.submitButton, AppShadows.card, { backgroundColor: colors.accentBlue }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {t('btn_publish')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleRow: {
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 14,
  },
  chipRow: {
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontWeight: '600',
    fontSize: 13,
  },
  cityScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  twoCols: {
    flexDirection: 'row',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  amenitiesWrap: {
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 5,
  },
  submitButton: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

