// ============================================================
// DARLINK — SQUELETTE DE CHARGEMENT ADAPTATIF (React Native)
// ============================================================

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface LoadingSkeletonProps {
  readonly width?: DimensionValue;
  readonly height?: DimensionValue;
  readonly borderRadius?: number;
  readonly isCircle?: boolean;
  readonly style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 12,
  isCircle = false,
  style,
}) => {
  const { isDark } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 0.75, duration: 750, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  const computedRadius = isCircle
    ? typeof height === 'number'
      ? height / 2
      : 50
    : borderRadius;

  return (
    <Animated.View
      style={[
        {
          backgroundColor: isDark ? '#1E2128' : '#E9E9EE',
          width: isCircle ? height : width,
          height,
          borderRadius: computedRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Chargement en cours"
    />
  );
};
