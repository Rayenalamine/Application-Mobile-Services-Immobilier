// ============================================================
// DARLINK — POINT D'ENTRÉE PRINCIPAL REACT NATIVE (V2-T01 & V2-T04)
// Connecte l'application mobile à la barre de navigation paritaire
// ============================================================

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MainNavigationScreen } from './src/features/navigation/presentation/screens/MainNavigationScreen';

export default function App() {
  return (
    <>
      <MainNavigationScreen />
      <StatusBar style="light" />
    </>
  );
}
