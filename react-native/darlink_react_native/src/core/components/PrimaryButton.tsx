// ============================================================
// DARLINK — BOUTON PRINCIPAL LUXE (PrimaryButton)
// Conforme à docs/UI_COMPONENTS_SPEC.md (Membre 1)
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
import { useTranslation } from '../localization/LocalizationContext';

export interface PrimaryButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: React.ReactNode;
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
  const { isRTL } = useTranslation();

  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceElevated;
    if (variant === 'secondary') return colors.surface;
    if (variant === 'glass') return isDark ? 'rgba(255, 255, 255, 0.12)' : colors.surfaceElevated;
    return colors.accentBlue;
  };

  const getTextColor = () => {
    if (disabled) return colors.textTertiary;
    if (variant === 'secondary') return colors.textPrimary;
    if (variant === 'glass' && !isDark) return colors.textPrimary;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFullWidth && styles.fullWidth,
        { backgroundColor: getBackgroundColor() },
        variant === 'secondary' && { borderWidth: 1, borderColor: colors.border },
        variant === 'glass' && [styles.glassBorder, { borderColor: colors.border }],
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={[styles.contentRow, isRTL && styles.contentRowRTL]}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.label, { color: getTextColor() }, textStyle]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullWidth: {
    width: '100%',
  },
  glassBorder: {
    borderWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contentRowRTL: {
    flexDirection: 'row-reverse',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

