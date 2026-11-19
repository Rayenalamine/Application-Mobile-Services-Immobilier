// ============================================================
// DARLINK — ÉCRAN DE DÉPÔT D'ANNONCE (React Native V7)
// Formulaire de création de bien immobilier haut standing
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
import { useTheme } from '../../../../core/theme/ThemeContext';
import { propertyApiService } from '../../services/propertyApiService';
import { Property } from '../../domain/models/property';

interface AddPropertyScreenProps {
  onBack: () => void;
  onPropertyCreated?: (property: Property) => void;
}

export const AddPropertyScreen: React.FC<AddPropertyScreenProps> = ({ onBack, onPropertyCreated }) => {
  const { colors, isDark } = useTheme();

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
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.surface }]} onPress={onBack}>
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Déposer une annonce</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* TYPE DE TRANSACTION */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Type de transaction</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !isRental
                ? { backgroundColor: isDark ? '#FFFFFF' : '#0F1015' }
                : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => setIsRental(false)}
          >
            <Text
              style={[
                styles.toggleText,
                { color: !isRental ? (isDark ? '#0F1015' : '#FFFFFF') : colors.textSecondary },
              ]}
            >
              Vente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              isRental
                ? { backgroundColor: isDark ? '#FFFFFF' : '#0F1015' }
                : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => setIsRental(true)}
          >
            <Text
              style={[
                styles.toggleText,
                { color: isRental ? (isDark ? '#0F1015' : '#FFFFFF') : colors.textSecondary },
              ]}
            >
              Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* TYPE DE BIEN */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Type de bien</Text>
        <View style={styles.chipRow}>
          {types.map((t) => {
            const active = type === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.chip,
                  active
                    ? { backgroundColor: isDark ? '#FFFFFF' : '#0F1015' }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => setType(t)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? (isDark ? '#0F1015' : '#FFFFFF') : colors.textSecondary },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TITRE */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Titre de l'annonce</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Ex: Villa contemporaine avec piscine"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        {/* VILLE & ADRESSE */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Gouvernorat / Ville</Text>
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

        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Quartier ou Adresse</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
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
                style={[styles.counterBtn, { backgroundColor: colors.surface }]}
                onPress={() => setBedrooms(Math.max(1, bedrooms - 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{bedrooms}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surface }]}
                onPress={() => setBedrooms(bedrooms + 1)}
              >
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Salles de bain</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surface }]}
                onPress={() => setBathrooms(Math.max(1, bathrooms - 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.counterVal, { color: colors.textPrimary }]}>{bathrooms}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surface }]}
                onPress={() => setBathrooms(bathrooms + 1)}
              >
                <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* COMMODITÉS */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Commodités & Atouts</Text>
        <View style={styles.amenitiesWrap}>
          {amenitiesList.map((a) => {
            const active = selectedAmenities.includes(a);
            return (
              <TouchableOpacity
                key={a}
                style={[
                  styles.amenityChip,
                  active
                    ? { backgroundColor: colors.accentBlue }
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => toggleAmenity(a)}
              >
                <Text style={{ color: active ? '#FFFFFF' : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  {active ? '✓ ' : '+ '}
                  {a}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* DESCRIPTION */}
        <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginTop: 18 }]}>Description du bien</Text>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border },
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
          style={[styles.submitButton, { backgroundColor: isDark ? '#FFFFFF' : '#0F1015' }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={isDark ? '#0F1015' : '#FFFFFF'} />
          ) : (
            <Text style={[styles.submitButtonText, { color: isDark ? '#0F1015' : '#FFFFFF' }]}>
              Publier l'annonce
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
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
    flexDirection: 'row',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 20,
    fontWeight: '600',
  },
  counterVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  submitButton: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
