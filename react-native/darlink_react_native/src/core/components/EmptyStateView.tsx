// ============================================================
// DARLINK — APPLE LIQUID GLASS EMPTY STATE (React Native)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Compass } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { TypographyScale } from '../designSystem/tokens';
import { LiquidGlassView, LuxuryPillButton } from '../designSystem/LiquidGlass';

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
      <LiquidGlassView borderRadius={42} intensity={50} style={styles.emblem}>
        <Compass size={34} color={colors.accentChampagne} strokeWidth={1.6} />
      </LiquidGlassView>

      <Text style={[TypographyScale.pageTitle, styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[TypographyScale.body, styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>

      {actionLabel && onAction ? (
        <LuxuryPillButton label={actionLabel} onPress={onAction} style={{ marginTop: 20 }} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 28, justifyContent: 'center', alignItems: 'center' },
  emblem: {
    width: 84,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 21, textAlign: 'center', marginBottom: 8 },
  message: {
    textAlign: 'center',
    maxWidth: 300,
  },
});
