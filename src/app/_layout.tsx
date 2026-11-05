import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user } = useDemo();
  if (!user) return <LoginScreen />;
  return <AppTabs />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DemoProvider>
        <AppContent />
      </DemoProvider>
    </ThemeProvider>
  );
}
