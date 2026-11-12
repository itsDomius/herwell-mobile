import { createContext, useContext, useState, useCallback } from 'react';

export type AppTheme = 'light' | 'dark';

interface ThemeCtx {
  appTheme: AppTheme;
  toggleTheme: () => void;
  setTheme: (t: AppTheme) => void;
  colors: typeof LIGHT;
}

export const PURPLE_GRADIENT = ['#C4B5FD', '#A78BFA', '#8B5CF6'] as const;
export const BLUE_ACCENT = '#BAE6FD';

export const LIGHT = {
  bg: '#F5F3FF',
  card: '#FFFFFF',
  cardBorder: '#E8E0FF',
  text: '#1E1346',
  textSecondary: '#6B5FA6',
  accent: '#8B5CF6',
  accentSoft: 'rgba(139,92,246,0.10)',
  accentMid: 'rgba(139,92,246,0.20)',
  blue: '#7DD3FC',
  blueCard: '#EFF9FF',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  tabBg: '#FFFFFF',
  tabBorder: '#EDE9FF',
  statusBar: 'dark-content' as 'dark-content' | 'light-content',
  blobA: 'rgba(167,139,250,0.35)',
  blobB: 'rgba(186,230,253,0.30)',
  blobC: 'rgba(196,181,253,0.25)',
};

export const DARK = {
  bg: '#0F0A1E',
  card: '#1C1535',
  cardBorder: '#2D2454',
  text: '#F0EDFF',
  textSecondary: '#9B92C8',
  accent: '#A78BFA',
  accentSoft: 'rgba(167,139,250,0.12)',
  accentMid: 'rgba(167,139,250,0.22)',
  blue: '#7DD3FC',
  blueCard: '#0C1A2E',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  tabBg: '#1C1535',
  tabBorder: '#2D2454',
  statusBar: 'light-content' as 'dark-content' | 'light-content',
  blobA: 'rgba(139,92,246,0.25)',
  blobB: 'rgba(125,211,252,0.15)',
  blobC: 'rgba(167,139,250,0.20)',
};

const ThemeContext = createContext<ThemeCtx>({
  appTheme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  colors: LIGHT,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appTheme, setAppTheme] = useState<AppTheme>('light');

  const toggleTheme = useCallback(() => setAppTheme(t => t === 'light' ? 'dark' : 'light'), []);
  const setTheme = useCallback((t: AppTheme) => setAppTheme(t), []);
  const colors = appTheme === 'dark' ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ appTheme, toggleTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
