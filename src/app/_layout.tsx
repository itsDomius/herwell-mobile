import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import { ThemeProvider, useAppTheme } from '@/contexts/ThemeContext';
import { LoginScreen } from '@/components/login-screen';

const HIDDEN = { href: null } as const;

function AppNavigator() {
  const { user } = useDemo();
  const { colors } = useAppTheme();

  if (!user) return <LoginScreen />;

  const isClinic = user.mode === 'clinic';
  const isClinicDoctor = isClinic && user.clinicRole === 'doctor';
  const isClinicPatient = isClinic && user.clinicRole === 'patient';

  const tabStyle = {
    headerShown: false,
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.tabBg,
      borderTopColor: colors.tabBorder,
      borderTopWidth: 1,
      paddingBottom: 4,
      height: 60,
    },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const, marginBottom: 2 },
  };

  if (isClinicDoctor) {
    return (
      <Tabs screenOptions={tabStyle}>
        <Tabs.Screen name="index" options={HIDDEN} />
        <Tabs.Screen name="passport" options={HIDDEN} />
        <Tabs.Screen name="tracker" options={HIDDEN} />
        <Tabs.Screen name="explore" options={HIDDEN} />
        <Tabs.Screen name="clinic-doctor" options={{ title: 'Patients', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="clinic-today" options={HIDDEN} />
        <Tabs.Screen name="clinic-calendar" options={HIDDEN} />
        <Tabs.Screen name="clinic-messages" options={HIDDEN} />
        <Tabs.Screen name="clinic-videos" options={HIDDEN} />
        <Tabs.Screen name="clinic-labs" options={HIDDEN} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
      </Tabs>
    );
  }

  if (isClinicPatient) {
    return (
      <Tabs screenOptions={tabStyle}>
        <Tabs.Screen name="index" options={HIDDEN} />
        <Tabs.Screen name="passport" options={HIDDEN} />
        <Tabs.Screen name="tracker" options={HIDDEN} />
        <Tabs.Screen name="explore" options={HIDDEN} />
        <Tabs.Screen name="clinic-doctor" options={HIDDEN} />
        <Tabs.Screen name="clinic-today" options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="clinic-calendar" options={{ title: 'Calendar', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="clinic-messages" options={{ title: 'Messages', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="clinic-videos" options={{ title: 'Videos', tabBarIcon: ({ color, size }) => <Ionicons name="play-circle-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="clinic-labs" options={{ title: 'Labs', tabBarIcon: ({ color, size }) => <Ionicons name="flask-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
      </Tabs>
    );
  }

  return (
    <Tabs screenOptions={tabStyle}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="passport" options={{ title: 'Passport', tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="tracker" options={{ title: 'Tracker', tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Learn', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="clinic-doctor" options={HIDDEN} />
      <Tabs.Screen name="clinic-today" options={HIDDEN} />
      <Tabs.Screen name="clinic-calendar" options={HIDDEN} />
      <Tabs.Screen name="clinic-messages" options={HIDDEN} />
      <Tabs.Screen name="clinic-videos" options={HIDDEN} />
      <Tabs.Screen name="clinic-labs" options={HIDDEN} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DemoProvider>
        <AppNavigator />
      </DemoProvider>
    </ThemeProvider>
  );
}
