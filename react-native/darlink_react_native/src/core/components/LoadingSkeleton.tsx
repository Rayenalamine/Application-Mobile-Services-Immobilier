// ============================================================
// DARLINK — SQUELETTE DE CHARGEMENT (LoadingSkeleton)
// Conforme à docs/UI_COMPONENTS_SPEC.md (Membre 1)
// ============================================================

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { AppColors } from '../constants/colors';

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
  borderRadius = 8,
  isCircle = false,
  style,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
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
        styles.skeleton,
        {
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

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: AppColors.darkSurfaceElevated,
  },
});
