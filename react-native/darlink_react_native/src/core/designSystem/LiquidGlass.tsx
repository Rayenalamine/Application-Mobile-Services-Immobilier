// ============================================================
// DARLINK — APPLE LIQUID GLASS COMPONENTS (React Native + expo-blur)
// Real translucent BlurView surfaces, specular borders, tactile orbs,
// editorial section headers, and luxury pill buttons.
// ============================================================

import React, { ReactNode, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { RadiusScale, TypographyScale, triggerHaptic } from './tokens';

interface LiquidGlassProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  intensity?: number;
  elevated?: boolean;
}

export const LiquidGlassView: React.FC<LiquidGlassProps> = ({
  children,
  style,
  borderRadius = RadiusScale.lg,
  intensity,
  elevated = true,
}) => {
  const { isDark, colors } = useTheme();
  const blurIntensity = intensity ?? (isDark ? 48 : 65);
  const bgFallback = isDark ? 'rgba(22, 24, 30, 0.72)' : 'rgba(255, 255, 255, 0.78)';

  return (
    <View
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          borderWidth: 0.9,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(29, 29, 31, 0.09)',
          backgroundColor: bgFallback,
        },
        elevated && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.36 : 0.07,
          shadowRadius: 22,
          elevation: 6,
        },
        style,
      ]}
    >
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderTopWidth: 1,
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      />
      {children}
    </View>
  );
};

interface GlassOrbButtonProps {
  children: ReactNode;
  onPress: () => void;
  size?: number;
  badgeCount?: number;
  accessibilityLabel?: string;
}

export const GlassOrbButton: React.FC<GlassOrbButtonProps> = ({
  children,
  onPress,
  size = 42,
  badgeCount = 0,
  accessibilityLabel,
}) => {
  const { isDark, colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (val: number) => {
    Animated.spring(scale, {
      toValue: val,
      useNativeDriver: true,
      speed: 32,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={() => animateTo(0.92)}
        onPressOut={() => animateTo(1)}
        onPress={() => {
          triggerHaptic('light');
          onPress();
        }}
        style={{ position: 'relative' }}
      >
        <LiquidGlassView
          borderRadius={size / 2}
          intensity={isDark ? 42 : 55}
          elevated={false}
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(30, 33, 40, 0.72)' : 'rgba(255, 255, 255, 0.85)',
          }}
        >
          {children}
        </LiquidGlassView>

        {badgeCount > 0 && (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.accentRed, borderColor: colors.background },
            ]}
          >
            <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}

export const EditorialSectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  trailing,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={{ flex: 1 }}>
        <Text style={[TypographyScale.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
};

interface LuxuryPillButtonProps {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  loading?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const LuxuryPillButton: React.FC<LuxuryPillButtonProps> = ({
  label,
  onPress,
  icon,
  loading = false,
  secondary = false,
  disabled = false,
  style,
}) => {
  const { isDark, colors } = useTheme();
  const bg = secondary
    ? colors.surfaceElevated
    : isDark
    ? '#F5F5F7'
    : '#1D1D1F';
  const fg = secondary
    ? colors.textPrimary
    : isDark
    ? '#1D1D1F'
    : '#FFFFFF';

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        triggerHaptic('light');
        onPress();
      }}
      style={[
        styles.pillBtn,
        {
          backgroundColor: bg,
          borderWidth: secondary ? 0.9 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <View style={styles.pillBtnContent}>
          {icon}
          <Text style={[styles.pillBtnText, { color: fg }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  pillBtn: {
    height: 50,
    borderRadius: RadiusScale.pill,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
});

