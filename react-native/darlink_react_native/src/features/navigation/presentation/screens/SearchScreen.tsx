// ============================================================
// DARLINK — ÉCRAN DE RECHERCHE REACT NATIVE (V2-T04 - Membre 2)
// Parité complète avec EcranRecherche Flutter
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';
import { AppSpacing } from '../../../../core/constants/spacing';

const TYPES = ['Tous', 'Villa', 'Appartement', 'Maison'] as const;
const CITIES = ['Tunis', 'Sousse', 'Djerba', 'Hammamet'] as const;

export const SearchScreen: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('Tous');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recherche de biens</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Champ de recherche */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par ville, quartier..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Filtres de types */}
        <Text style={styles.filterTitle}>Type de bien</Text>
        <View style={styles.chipRow}>
          {TYPES.map((type) => {
            const isSelected = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filtres de villes */}
        <Text style={styles.filterTitle}>Villes tunisiennes</Text>
        <View style={styles.chipRow}>
          {CITIES.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedCity(isSelected ? '' : city)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  📍 {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Encart architectural V5 */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <View style={styles.noticeBody}>
            <Text style={styles.noticeTitle}>Recherche multicritère V5-T02</Text>
            <Text style={styles.noticeText}>
              Cette interface de filtres préparée en V2 sera raccordée à l'API REST
              Spring Boot en Version 5 (`GET /api/v1/properties/search`).
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    height: 56,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: AppSpacing.l,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.cardRadius,
    borderColor: AppColors.border,
    borderWidth: 0.8,
    paddingHorizontal: AppSpacing.m,
    height: 48,
    marginBottom: AppSpacing.l,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: AppSpacing.s,
    marginTop: AppSpacing.s,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: AppSpacing.l,
  },
  chip: {
    backgroundColor: AppColors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: AppColors.border,
  },
  chipSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  chipText: {
    fontSize: 13,
    color: AppColors.textPrimary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: AppSpacing.cardRadius,
    padding: AppSpacing.l,
    marginTop: AppSpacing.l,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  noticeIcon: {
    fontSize: 24,
    marginRight: AppSpacing.m,
  },
  noticeBody: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.primary,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    color: AppColors.textSecondary,
  },
});
