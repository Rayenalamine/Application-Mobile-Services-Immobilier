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
import { AppColors } from '../constants/colors';

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
  const getBackgroundColor = () => {
    if (disabled) return 'rgba(255, 255, 255, 0.1)';
    if (variant === 'secondary') return '#FFFFFF';
    if (variant === 'glass') return 'rgba(255, 255, 255, 0.12)';
    return AppColors.accentBlue;
  };

  const getTextColor = () => {
    if (disabled) return AppColors.darkTextTertiary;
    if (variant === 'secondary') return '#0F1015';
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFullWidth && styles.fullWidth,
        { backgroundColor: getBackgroundColor() },
        variant === 'glass' && styles.glassBorder,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? '#0F1015' : '#FFFFFF'}
        />
      ) : (
        <View style={styles.contentRow}>
          {typeof icon === 'string' ? (
            <Text style={styles.iconString}>{icon}</Text>
          ) : (
            icon
          )}
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
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconString: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

