// ============================================================
// DARLINK — FLOATING LIQUID GLASS NAVIGATION BAR (React Native)
// True BlurView capsule floating over scrollable content.
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
  LayoutAnimation,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Compass, Search, Heart, User } from 'lucide-react-native';
import { HomeScreen } from '../../../properties/presentation/screens/HomeScreen';
import { SearchScreen } from './SearchScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { ProfileScreen } from './ProfileScreen';
import { ThemeProvider, useTheme } from '../../../../core/theme/ThemeContext';
import { LocalizationProvider, useTranslation } from '../../../../core/localization/LocalizationContext';
import { LiquidGlassView } from '../../../../core/designSystem/LiquidGlass';
import { triggerHaptic } from '../../../../core/designSystem/tokens';

type TabKey = 'home' | 'search' | 'favorites' | 'profile';

const MainNavigationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();

  const renderIcon = (key: TabKey, isActive: boolean) => {
    const iconColor = isActive ? colors.dockActiveIcon : colors.dockInactiveIcon;
    switch (key) {
      case 'home':
        return <Compass size={19} color={iconColor} strokeWidth={isActive ? 2.2 : 1.75} />;
      case 'search':
        return <Search size={19} color={iconColor} strokeWidth={isActive ? 2.2 : 1.75} />;
      case 'favorites':
        return (
          <Heart
            size={19}
            color={iconColor}
            fill={isActive ? colors.dockActiveIcon : 'transparent'}
            strokeWidth={1.85}
          />
        );
      case 'profile':
        return <User size={19} color={iconColor} strokeWidth={isActive ? 2.2 : 1.75} />;
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
          paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
        },
      ]}
    >
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      <View style={styles.dockWrapper} pointerEvents="box-none">
        <LiquidGlassView borderRadius={34} intensity={isDark ? 55 : 70} style={styles.dockContainer}>
          <View style={styles.dockRow}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabButton}
                  onPress={() => {
                    triggerHaptic('selection');
                    if (Platform.OS !== 'web') {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    }
                    setActiveTab(tab.key);
                  }}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: isActive }}
                >
                  <View
                    style={[
                      styles.iconPill,
                      isActive && { backgroundColor: colors.dockActiveBg },
                    ]}
                  >
                    {renderIcon(tab.key, isActive)}
                  </View>
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isActive ? colors.textPrimary : colors.textSecondary,
                        fontWeight: isActive ? '600' : '500',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LiquidGlassView>
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
  dockWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 18,
    right: 18,
  },
  dockContainer: {
    height: 68,
    justifyContent: 'center',
  },
  dockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: -0.1,
  },
});
