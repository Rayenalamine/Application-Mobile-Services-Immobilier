// ============================================================
// DARLINK — VUE D'ÉTAT VIDE (EmptyStateView)
// Conforme à docs/UI_COMPONENTS_SPEC.md (Membre 1)
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { AppColors } from '../constants/colors';

export interface EmptyStateViewProps {
  readonly title: string;
  readonly message: string;
  readonly icon?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly style?: ViewStyle;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  message,
  icon = '🔍',
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
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
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: AppColors.darkTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  actionText: {
    color: '#0F1015',
    fontWeight: '700',
    fontSize: 13,
  },
});
