// ============================================================
// DARLINK — POINT D'ENTRÉE PRINCIPAL REACT NATIVE
// Hydratation asynchrone sécurisée de session Firebase Auth et favoris
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MainNavigationScreen } from './src/features/navigation/presentation/screens/MainNavigationScreen';
import { authService } from './src/features/auth/services/authService';
import { favoritesApiService } from './src/features/favorites/services/favoritesApiService';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      authService.waitForInit(),
      favoritesApiService.init(),
    ]).finally(() => {
      if (mounted) setIsReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <MainNavigationScreen />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
