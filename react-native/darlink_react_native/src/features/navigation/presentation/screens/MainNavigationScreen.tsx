// ============================================================
// DARLINK — FLOATING LIQUID GLASS NAVIGATION BAR (React Native)
// True BlurView capsule floating over scrollable content.
// State-preserving tabs (IndexedStack equivalent) & fluid haptics.
// ============================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Animated,
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

interface NavButtonProps {
  tabKey: TabKey;
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  activeBg: string;
  activeTextColor: string;
  inactiveTextColor: string;
}

const NavButton: React.FC<NavButtonProps> = ({
  label,
  isActive,
  onPress,
  icon,
  activeBg,
  activeTextColor,
  inactiveTextColor,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      speed: 40,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 36,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.tabButtonWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.tabButton}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isActive }}
      >
        <View
          style={[
            styles.iconPill,
            isActive && { backgroundColor: activeBg },
          ]}
        >
          {icon}
        </View>
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? activeTextColor : inactiveTextColor,
              fontWeight: isActive ? '600' : '500',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MainNavigationContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const { isDark, colors } = useTheme();
  const { t, isRTL } = useTranslation();

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

  const handleTabPress = (key: TabKey) => {
    if (activeTab !== key) {
      triggerHaptic('selection');
      if (Platform.OS !== 'web') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setActiveTab(key);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
          direction: isRTL ? 'rtl' : 'ltr',
        },
      ]}
    >
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />

      {/* State-Preserving Screens Stack (Zero Unmount/Remount Flashing) */}
      <View style={styles.screenContainer}>
        <View
          style={[
            styles.tabContent,
            activeTab === 'home' ? styles.tabVisible : styles.tabHidden,
          ]}
          pointerEvents={activeTab === 'home' ? 'auto' : 'none'}
        >
          <HomeScreen onNavigateToSearch={() => handleTabPress('search')} />
        </View>

        <View
          style={[
            styles.tabContent,
            activeTab === 'search' ? styles.tabVisible : styles.tabHidden,
          ]}
          pointerEvents={activeTab === 'search' ? 'auto' : 'none'}
        >
          <SearchScreen />
        </View>

        <View
          style={[
            styles.tabContent,
            activeTab === 'favorites' ? styles.tabVisible : styles.tabHidden,
          ]}
          pointerEvents={activeTab === 'favorites' ? 'auto' : 'none'}
        >
          <FavoritesScreen />
        </View>

        <View
          style={[
            styles.tabContent,
            activeTab === 'profile' ? styles.tabVisible : styles.tabHidden,
          ]}
          pointerEvents={activeTab === 'profile' ? 'auto' : 'none'}
        >
          <ProfileScreen />
        </View>
      </View>

      {/* Floating Liquid Glass Dock */}
      <View style={styles.dockWrapper} pointerEvents="box-none">
        <LiquidGlassView useBlur borderRadius={34} intensity={isDark ? 55 : 70} style={styles.dockContainer}>
          <View style={styles.dockRow}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <NavButton
                  key={tab.key}
                  tabKey={tab.key}
                  label={tab.label}
                  isActive={isActive}
                  onPress={() => handleTabPress(tab.key)}
                  icon={renderIcon(tab.key, isActive)}
                  activeBg={colors.dockActiveBg}
                  activeTextColor={colors.textPrimary}
                  inactiveTextColor={colors.textSecondary}
                />
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
  screenContainer: { flex: 1, position: 'relative' },
  tabContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabVisible: {
    opacity: 1,
    zIndex: 1,
  },
  tabHidden: {
    opacity: 0,
    zIndex: 0,
  },
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
  tabButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    width: '100%',
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
