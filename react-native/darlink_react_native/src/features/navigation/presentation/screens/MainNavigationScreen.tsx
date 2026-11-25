// ============================================================
// DARLINK — NAVIGATION FLOTTANTE PAR ONGLETS (React Native)
// Design System cohérent avec icônes Lucide (zéro emoji).
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
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { LayoutGrid, Search, Heart, User } from 'lucide-react-native';
import { HomeScreen } from '../../../properties/presentation/screens/HomeScreen';
import { SearchScreen } from './SearchScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { ProfileScreen } from './ProfileScreen';
import { ThemeProvider, useTheme } from '../../../../core/theme/ThemeContext';
import { LocalizationProvider, useTranslation } from '../../../../core/localization/LocalizationContext';

type TabKey = 'home' | 'search' | 'favorites' | 'profile';

const MainNavigationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();

  const renderIcon = (key: TabKey, isActive: boolean) => {
    const iconColor = isActive ? '#FFFFFF' : colors.textSecondary;
    switch (key) {
      case 'home':
        return <LayoutGrid size={18} color={iconColor} strokeWidth={2} />;
      case 'search':
        return <Search size={18} color={iconColor} strokeWidth={2} />;
      case 'favorites':
        return (
          <Heart
            size={18}
            color={iconColor}
            fill={isActive ? '#FFFFFF' : 'transparent'}
            strokeWidth={2}
          />
        );
      case 'profile':
        return <User size={18} color={iconColor} strokeWidth={2} />;
    }
  };

  const tabs: readonly { key: TabKey; label: string }[] = [
    { key: 'home', label: t('nav_home') },
    { key: 'search', label: t('nav_search') },
    { key: 'favorites', label: t('nav_favorites') },
    { key: 'profile', label: t('nav_profile') },
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
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) : 0,
        },
      ]}
    >
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      <View style={styles.dockWrapper}>
        <View
          style={[
            styles.floatingDock,
            {
              backgroundColor: isDark ? 'rgba(22, 23, 32, 0.94)' : 'rgba(255, 255, 255, 0.96)',
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
                    isActive && { backgroundColor: colors.accentBlue },
                  ]}
                >
                  {renderIcon(tab.key, isActive)}
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: colors.textTertiary },
                    isActive && { color: colors.textPrimary, fontWeight: '700' },
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
  safeArea: { flex: 1 },
  screenContainer: { flex: 1 },
  dockWrapper: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  floatingDock: {
    height: 68,
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
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconPill: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabLabel: { fontSize: 10, marginTop: 2 },
});
