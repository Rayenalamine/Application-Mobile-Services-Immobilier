// ============================================================
// DARLINK — BARRE DE NAVIGATION FLOTTANTE MODERNE (Bottom Navigation Bar)
// Respecte les Safe Areas Android & iOS, RTL, thèmes Clair/Sombre et animations
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Search, Heart, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../localization/LocalizationContext';
import { AppShadows } from '../constants/spacing';

export type NavTabKey = 'home' | 'search' | 'favorites' | 'profile';

export const FLOATING_NAV_HEIGHT = 68;
export const FLOATING_NAV_HORIZONTAL_MARGIN = 16;

/**
 * Retourne l'espace vertical total occupé en bas de l'écran par la barre
 * de navigation flottante (incluant la Safe Area système iOS/Android),
 * afin qu'aucun contenu ne soit masqué.
 */
export function useBottomNavClearance(): number {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);
  return bottomOffset + FLOATING_NAV_HEIGHT + 16;
}

interface FloatingBottomNavProps {
  readonly activeTab: NavTabKey;
  readonly onSelectTab: (tab: NavTabKey) => void;
}

interface TabConfig {
  readonly key: NavTabKey;
  readonly label: string;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { t, isRTL } = useTranslation();

  const [barWidth, setBarWidth] = useState<number>(0);

  const tabs: readonly TabConfig[] = [
    { key: 'home', label: t('nav_home') },
    { key: 'search', label: t('nav_search') },
    { key: 'favorites', label: t('nav_favorites') },
    { key: 'profile', label: t('nav_profile') },
  ];

  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === activeTab)
  );

  // Valeurs animées pour l'indicateur glissant et la micro-échelle de l'onglet actif
  const indicatorAnim = useRef(new Animated.Value(activeIndex)).current;
  const scaleAnims = useRef(
    tabs.map((_, idx) => new Animated.Value(idx === activeIndex ? 1.08 : 1))
  ).current;

  useEffect(() => {
    const visualIndex = isRTL ? tabs.length - 1 - activeIndex : activeIndex;

    Animated.spring(indicatorAnim, {
      toValue: visualIndex,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();

    scaleAnims.forEach((anim, idx) => {
      Animated.spring(anim, {
        toValue: idx === activeIndex ? 1.08 : 1,
        useNativeDriver: true,
        tension: 140,
        friction: 12,
      }).start();
    });
  }, [activeIndex, isRTL, indicatorAnim, scaleAnims, tabs.length]);

  const handleBarLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== barWidth) {
      setBarWidth(w);
    }
  };

  const innerPadding = 8;
  const tabSlotWidth = barWidth > innerPadding * 2 ? (barWidth - innerPadding * 2) / tabs.length : 0;
  const indicatorTranslateX =
    tabSlotWidth > 0
      ? indicatorAnim.interpolate({
          inputRange: [0, 1, 2, 3],
          outputRange: [0, tabSlotWidth, tabSlotWidth * 2, tabSlotWidth * 3],
        })
      : 0;

  const activeColor = isDark ? colors.accentBlueSecondary : colors.accentBlue;
  const inactiveColor = colors.dockInactiveIcon;
  const bottomOffset = Math.max(insets.bottom, 12);

  const renderIcon = (key: NavTabKey, isActive: boolean) => {
    const iconColor = isActive ? activeColor : inactiveColor;
    const strokeWidth = isActive ? 2.25 : 1.85;
    const size = 21;

    switch (key) {
      case 'home':
        return <House size={size} color={iconColor} strokeWidth={strokeWidth} />;
      case 'search':
        return <Search size={size} color={iconColor} strokeWidth={strokeWidth} />;
      case 'favorites':
        return (
          <Heart
            size={size}
            color={iconColor}
            fill={isActive ? activeColor : 'transparent'}
            strokeWidth={strokeWidth}
          />
        );
      case 'profile':
        return <User size={size} color={iconColor} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: bottomOffset,
        },
      ]}
    >
      <View
        onLayout={handleBarLayout}
        style={[
          styles.floatingBar,
          AppShadows.floatingNav,
          {
            backgroundColor: colors.dockBg,
            borderColor: colors.dockBorder,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            shadowOpacity: isDark ? 0.45 : 0.12,
          },
        ]}
      >
        {/* Indicateur actif glissant moderne */}
        {tabSlotWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeSlotBackdrop,
              {
                width: tabSlotWidth,
                left: innerPadding,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          >
            <View
              style={[
                styles.activePill,
                {
                  backgroundColor: colors.accentBlueSoft,
                },
              ]}
            />
            <View
              style={[
                styles.activeTopIndicator,
                {
                  backgroundColor: activeColor,
                },
              ]}
            />
          </Animated.View>
        )}

        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: scaleAnims[index] }],
                  },
                ]}
              >
                {renderIcon(tab.key, isActive)}
              </Animated.View>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? activeColor : inactiveColor,
                    fontWeight: isActive ? '700' : '500',
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
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: FLOATING_NAV_HORIZONTAL_MARGIN,
    right: FLOATING_NAV_HORIZONTAL_MARGIN,
    zIndex: 100,
  },
  floatingBar: {
    height: FLOATING_NAV_HEIGHT,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    position: 'relative',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
      } as object,
    }),
  },
  activeSlotBackdrop: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    width: '86%',
    height: '100%',
    borderRadius: 22,
  },
  activeTopIndicator: {
    position: 'absolute',
    top: -6,
    width: 22,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  iconContainer: {
    width: 28,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
