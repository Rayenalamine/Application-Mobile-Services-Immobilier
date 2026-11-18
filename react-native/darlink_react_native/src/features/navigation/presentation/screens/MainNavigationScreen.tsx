// ============================================================
// DARLINK — NAVIGATION FLOTTANTE PAR ONGLETS (React Native Screen 1 & 2)
// Dock flottant translucide centré type Glassmorphism
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
  { key: 'home', label: 'Accueil', icon: '⊞' },
  { key: 'search', label: 'Recherche', icon: '🔍' },
  { key: 'favorites', label: 'Favoris', icon: '♡' },
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

      {/* Dock de navigation flottant centré type Glassmorphism */}
      <View style={styles.dockWrapper}>
        <View style={styles.floatingDock}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
              >
                <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
                  <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                    {isActive && tab.key === 'favorites' ? '❤️' : tab.icon}
                  </Text>
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.darkBackground,
  },
  screenContainer: {
    flex: 1,
  },
  dockWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  floatingDock: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 23, 32, 0.92)',
    borderRadius: 36,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPill: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconPillActive: {
    backgroundColor: '#FFFFFF',
  },
  tabIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  tabIconActive: {
    color: '#0F1015',
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
