// ============================================================
// DARLINK — VUE D'ÉTAT VIDE PROFESSIONNELLE (EmptyStateView)
// Icônes Lucide vectorielles, zéro emoji.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { SearchX } from 'lucide-react-native';
import { AppColors } from '../constants/colors';
import { useTheme } from '../theme/ThemeContext';

export interface EmptyStateViewProps {
  readonly title: string;
  readonly message: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly style?: ViewStyle;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <SearchX size={34} color={AppColors.accentBlue} strokeWidth={1.75} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  message: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: AppColors.accentBlue,
  },
  actionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
