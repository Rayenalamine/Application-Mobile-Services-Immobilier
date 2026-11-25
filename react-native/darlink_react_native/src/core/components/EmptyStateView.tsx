// ============================================================
// DARLINK — VUE D'ÉTAT VIDE (EmptyStateView)
// Icônes vectorielles Lucide & support thèmes Clair / Sombre
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export interface EmptyStateViewProps {
  readonly title: string;
  readonly message: string;
  readonly icon?: React.ReactNode;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly style?: ViewStyle;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.accentBlueSoft,
            borderColor: 'rgba(37, 99, 235, 0.22)',
          },
        ]}
      >
        {icon ?? <Search size={34} color={colors.accentBlue} strokeWidth={2} />}
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.accentBlue }]}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  actionButton: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 16,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

