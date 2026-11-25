// ============================================================
// DARLINK — APPLE LIQUID GLASS DESIGN TOKENS (React Native)
// Mirrors Flutter AppTypography & radius/elevation rules.
// ============================================================

import { Platform, TextStyle } from 'react-native';

export const RadiusScale = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
} as const;

export const TypographyScale: Record<string, TextStyle> = {
  heroDisplay: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.85,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
    letterSpacing: -0.55,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '600',
    lineHeight: 21,
    letterSpacing: -0.25,
  },
  priceDisplay: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  body: {
    fontSize: 14.5,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  caption: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.05,
  },
  micro: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.35,
  },
};

export function triggerHaptic(type: 'light' | 'selection' | 'success' = 'light'): void {
  if (Platform.OS === 'web') return;
  try {
    // Dynamic require preserves compatibility with Node test runners
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Haptics = require('expo-haptics');
    if (type === 'selection') {
      Haptics.selectionAsync?.();
    } else if (type === 'success') {
      Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
    } else {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light);
    }
  } catch {
    // Ignore when haptics unsupported
  }
}

