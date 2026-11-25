// ============================================================
// DARLINK — NAVIGATION FLOTTANTE PAR ONGLETS (React Native Screen 1 & 2)
// Dock flottant moderne adaptatif Clair / Sombre & Safe Areas Android/iOS
// ============================================================

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { HomeScreen } from '../../../properties/presentation/screens/HomeScreen';
import { SearchScreen } from './SearchScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { ProfileScreen } from './ProfileScreen';
import { ThemeProvider, useTheme } from '../../../../core/theme/ThemeContext';
import { LocalizationProvider } from '../../../../core/localization/LocalizationContext';
import { FloatingBottomNav, NavTabKey } from '../../../../core/components/FloatingBottomNav';

const MainNavigationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabKey>('home');
  const { isDark, colors } = useTheme();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToSearch={() => setActiveTab('search')}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        );
      case 'search':
        return <SearchScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onNavigateToSearch={() => setActiveTab('search')}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        );
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>
      <FloatingBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </SafeAreaView>
  );
};

export const MainNavigationScreen: React.FC = () => {
  return (
    <SafeAreaProvider>
      <LocalizationProvider>
        <ThemeProvider>
          <MainNavigationContent />
        </ThemeProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
