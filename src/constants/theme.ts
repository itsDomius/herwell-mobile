import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2D3142',
    background: '#FAF8F5',
    backgroundElement: '#F0EDE8',
    backgroundSelected: '#E6E2DC',
    textSecondary: '#6B7280',
    accent: '#7E5BA5',
    accentSoft: 'rgba(126,91,165,0.10)',
    terracotta: '#C9546D',
    terracottaSoft: 'rgba(201,84,109,0.10)',
    card: '#FFFFFF',
    border: '#E5E1DB',
    success: '#7E5BA5',
    error: '#D64545',
    warning: '#E5A83E',
  },
  dark: {
    text: '#F5F3F0',
    background: '#1A1A2E',
    backgroundElement: '#252540',
    backgroundSelected: '#2E3050',
    textSecondary: '#9CA3AF',
    accent: '#9B7DC4',
    accentSoft: 'rgba(155,125,196,0.15)',
    terracotta: '#D4697F',
    terracottaSoft: 'rgba(212,105,127,0.15)',
    card: '#252540',
    border: '#3A3A55',
    success: '#9B7DC4',
    error: '#E06060',
    warning: '#E5A83E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
