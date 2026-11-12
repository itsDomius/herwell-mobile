import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { DemoProvider, useDemo } from '@/contexts/DemoContext';
import { LoginScreen } from '@/components/login-screen';
import { Colors } from '@/constants/theme';

const HIDDEN = { href: null } as const;

function AppNavigator() {
  const { user } = useDemo();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (!user) return <LoginScreen />;

  const isClinic = user.mode === 'clinic';
  const isClinicDoctor = isClinic && user.clinicRole === 'doctor';
  const isClinicPatient = isClinic && user.clinicRole === 'patient';

  const tabStyle = {
    headerShown: false,
    tabBarActiveTintColor: isClinic ? '#7c3aed' : colors.accent,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.card,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      paddingBottom: 4,
      height: 56,
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
      </Tabs>
    );
  }

  // General HerWell user
  return (
    <Tabs screenOptions={tabStyle}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="passport" options={{ title: 'Passport', tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="tracker" options={{ title: 'Tracker', tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Learn', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} /> }} />
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
    <DemoProvider>
      <AppNavigator />
    </DemoProvider>
  );
}
