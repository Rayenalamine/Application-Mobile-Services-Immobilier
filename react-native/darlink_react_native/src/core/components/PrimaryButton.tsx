// ============================================================
// DARLINK — LUXURY PILL BUTTON (React Native)
// ============================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { RadiusScale, triggerHaptic } from '../designSystem/tokens';

export interface PrimaryButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: React.ReactNode | string;
  readonly isLoading?: boolean;
  readonly disabled?: boolean;
  readonly isFullWidth?: boolean;
  readonly style?: ViewStyle;
  readonly textStyle?: TextStyle;
  readonly variant?: 'primary' | 'secondary' | 'glass';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  icon,
  isLoading = false,
  disabled = false,
  isFullWidth = true,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const { isDark, colors } = useTheme();

  const bg = disabled
    ? colors.surfaceElevated
    : variant === 'secondary'
    ? colors.surfaceElevated
    : variant === 'glass'
    ? colors.glassCard
    : isDark
    ? '#F5F5F7'
    : '#1D1D1F';

  const fg = disabled
    ? colors.textTertiary
    : variant === 'secondary' || variant === 'glass'
    ? colors.textPrimary
    : isDark
    ? '#1D1D1F'
    : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFullWidth && styles.fullWidth,
        {
          backgroundColor: bg,
          borderWidth: variant === 'primary' ? 0 : 0.9,
          borderColor: colors.border,
        },
        style,
      ]}
      onPress={() => {
        triggerHaptic('light');
        onPress();
      }}
      disabled={disabled || isLoading}
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <View style={styles.contentRow}>
          {typeof icon === 'string' ? <Text style={[styles.iconString, { color: fg }]}>{icon}</Text> : icon}
          <Text style={[styles.label, { color: fg }, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: RadiusScale.pill,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: { width: '100%' },
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconString: { fontSize: 15 },
  label: { fontSize: 14.5, fontWeight: '600', letterSpacing: -0.15 },
});
