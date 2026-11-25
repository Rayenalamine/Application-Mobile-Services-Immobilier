// ============================================================
// DARLINK — ENTRYPOINT & LUXURY SPLASH SCREEN (React Native)
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MainNavigationScreen } from './src/features/navigation/presentation/screens/MainNavigationScreen';
import { authService } from './src/features/auth/services/authService';
import { favoritesApiService } from './src/features/favorites/services/favoritesApiService';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();

    let mounted = true;
    Promise.all([authService.waitForInit(), favoritesApiService.init()]).finally(() => {
      if (mounted) setIsReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [fadeAnim]);

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View style={[styles.brandWrap, { opacity: fadeAnim }]}>
          <View style={styles.monogramBadge}>
            <Text style={styles.monogramText}>D</Text>
          </View>
          <Text style={styles.brandName}>DarLink</Text>
          <Text style={styles.brandTagline}>Immobilier d’exception • Tunisie</Text>
          <ActivityIndicator size="small" color="#9A7B4F" style={{ marginTop: 28 }} />
        </Animated.View>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <MainNavigationScreen />
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#FBFBFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWrap: {
    alignItems: 'center',
  },
  monogramBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#1D1D1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  monogramText: {
    color: '#F5F5F7',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
  },
  brandName: {
    color: '#1D1D1F',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  brandTagline: {
    color: '#6E6E73',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
