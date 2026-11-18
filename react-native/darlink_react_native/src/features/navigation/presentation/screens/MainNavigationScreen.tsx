// ============================================================
// DARLINK — NAVIGATION PRINCIPALE PAR ONGLETS (V2-T04 - Membre 2)
// Navigation inférieure Material 3 avec 4 onglets :
// Accueil, Recherche, Favoris, Profil (Parité totale Flutter)
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { AppColors } from '../../../../core/constants/colors';
import { HomeScreen } from '../../../properties/presentation/screens/HomeScreen';
import { SearchScreen } from './SearchScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { ProfileScreen } from './ProfileScreen';

type TabKey = 'home' | 'search' | 'favorites' | 'profile';

interface TabItem {
  readonly key: TabKey;
  readonly label: string;
  readonly icon: string;
}

const TABS: readonly TabItem[] = [
  { key: 'home', label: 'Accueil', icon: '🏠' },
  { key: 'search', label: 'Recherche', icon: '🔍' },
  { key: 'favorites', label: 'Favoris', icon: '❤️' },
  { key: 'profile', label: 'Profil', icon: '👤' },
] as const;

export const MainNavigationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Barre de navigation inférieure Material 3 */}
      <View style={styles.bottomBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  screenContainer: {
    flex: 1,
  },
  bottomBar: {
    height: 64,
    flexDirection: 'row',
    backgroundColor: AppColors.surface,
    borderTopWidth: 0.8,
    borderTopColor: AppColors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  iconPill: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconPillActive: {
    backgroundColor: '#E3F2FD',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: AppColors.primary,
    fontWeight: '700',
  },
});
