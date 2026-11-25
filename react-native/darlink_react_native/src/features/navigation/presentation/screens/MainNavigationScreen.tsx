// ============================================================
// DARLINK — NAVIGATION FLOTTANTE PAR ONGLETS (React Native Screen 1 & 2)
// Dock flottant translucide adaptatif Clair / Sombre type Glassmorphism
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { HomeScreen } from '../../../properties/presentation/screens/HomeScreen';
import { SearchScreen } from './SearchScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { ProfileScreen } from './ProfileScreen';
import { ThemeProvider, useTheme } from '../../../../core/theme/ThemeContext';
import { LocalizationProvider, useTranslation } from '../../../../core/localization/LocalizationContext';

type TabKey = 'home' | 'search' | 'favorites' | 'profile';

interface TabItem {
  readonly key: TabKey;
  readonly label: string;
  readonly icon: string;
}

const MainNavigationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();

  const tabs: readonly TabItem[] = [
    { key: 'home', label: t('nav_home'), icon: '⊞' },
    { key: 'search', label: t('nav_search'), icon: '🔍' },
    { key: 'favorites', label: t('nav_favorites'), icon: '♡' },
    { key: 'profile', label: t('nav_profile'), icon: '👤' },
  ];

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToSearch={() => setActiveTab('search')} />;
      case 'search':
        return <SearchScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigateToSearch={() => setActiveTab('search')} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Dock de navigation flottant centré type Glassmorphism adaptatif */}
      <View style={styles.dockWrapper}>
        <View
          style={[
            styles.floatingDock,
            {
              backgroundColor: isDark ? 'rgba(22, 23, 32, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: colors.border,
              shadowOpacity: isDark ? 0.45 : 0.08,
            },
          ]}
        >
          {tabs.map((tab) => {
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
                <View
                  style={[
                    styles.iconPill,
                    isActive && {
                      backgroundColor: colors.accentBlue,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabIcon,
                      { color: colors.textSecondary },
                      isActive && {
                        color: '#FFFFFF',
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {isActive && tab.key === 'favorites' ? '❤️' : tab.icon}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: colors.textTertiary },
                    isActive && {
                      color: colors.textPrimary,
                      fontWeight: '700',
                    },
                  ]}
                >
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

export const MainNavigationScreen: React.FC = () => {
  return (
    <LocalizationProvider>
      <ThemeProvider>
        <MainNavigationContent />
      </ThemeProvider>
    </LocalizationProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 12,
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
    borderRadius: 36,
    borderWidth: 1.2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
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
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
