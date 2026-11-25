// ============================================================
// DARLINK — CONTEXTE DE THÈME ADAPTATIF BLANC / NOIR (React Native)
// Par défaut : Blanc luxe (#F7F8FA) avec basculement fluide
// ============================================================

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LightThemeColors, DarkThemeColors } from '../constants/colors';

export interface ThemeColors {
  readonly background: string;
  readonly surface: string;
  readonly surfaceElevated: string;
  readonly glassCard: string;
  readonly glassBackground: string;
  readonly border: string;
  readonly borderSubtle: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textTertiary: string;
  readonly accentGreen: string;
  readonly accentBlue: string;
  readonly accentBlueSecondary: string;
  readonly accentBlueSoft: string;
  readonly accentRed: string;
  readonly segmentedBg: string;
  readonly activeSegmentBg: string;
  readonly activeSegmentText: string;
  readonly topPillBg: string;
  readonly topPillBorder: string;
  readonly dockBg: string;
  readonly dockBorder: string;
  readonly dockActiveBg: string;
  readonly dockActiveIcon: string;
  readonly dockInactiveIcon: string;
}

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  colors: LightThemeColors,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false); // Défaut Blanc Luxe

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const colors: ThemeColors = isDark ? DarkThemeColors : LightThemeColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext);
};
