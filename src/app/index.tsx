import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { user, records, symptoms, appointments, signOut } = useDemo();
  const router = useRouter();

  const upcoming = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date));

  const stats = [
    { label: 'Records', value: records.length, color: theme.accent },
    { label: 'Entries', value: symptoms.length, color: theme.terracotta },
    { label: 'Upcoming', value: upcoming.length, color: theme.accent },
  ];

  const actions = [
    { label: 'Medical Passport', sub: 'Your records', route: '/passport' as const, accent: theme.accent, soft: theme.accentSoft },
    { label: 'Log Symptoms', sub: 'Track today', route: '/tracker' as const, accent: theme.terracotta, soft: theme.terracottaSoft },
    { label: 'Appointment Prep', sub: 'Get ready', route: '/explore' as const, accent: theme.accent, soft: theme.accentSoft },
    { label: 'Education Hub', sub: 'Learn more', route: '/explore' as const, accent: theme.terracotta, soft: theme.terracottaSoft },
  ];

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header with gradient */}
        <View style={[s.header, { backgroundColor: theme.accentSoft }]}>
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={s.headerLogo}
                resizeMode="contain"
              />
              <View>
                <Text style={[s.greeting, { color: theme.textSecondary }]}>Welcome back</Text>
                <Text style={[s.name, { color: theme.text }]}>{user?.name ?? 'Guest'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={signOut} style={[s.signOutBtn, { borderColor: theme.border, backgroundColor: theme.card }]} activeOpacity={0.7}>
              <Text style={[s.signOutText, { color: theme.textSecondary }]}>Sign out</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.demoBadge, { backgroundColor: theme.card }]}>
            <Text style={[s.demoBadgeText, { color: theme.accent }]}>Demo prototype · synthetic data only</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <View style={s.statsRow}>
            {stats.map(st => (
              <View key={st.label} style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
                <Text style={[s.statLabel, { color: theme.textSecondary }]}>{st.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick actions */}
          <Text style={[s.sectionTitle, { color: theme.text }]}>Quick actions</Text>
          <View style={s.actionsGrid}>
            {actions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={[s.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(a.route)}
                activeOpacity={0.75}
              >
                <View style={[s.actionDot, { backgroundColor: a.soft }]}>
                  <View style={[s.actionDotInner, { backgroundColor: a.accent }]} />
                </View>
                <Text style={[s.actionLabel, { color: theme.text }]}>{a.label}</Text>
                <Text style={[s.actionSub, { color: theme.textSecondary }]}>{a.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Upcoming appointments */}
          {upcoming.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { color: theme.text }]}>Upcoming appointments</Text>
              {upcoming.map(apt => {
                const daysUntil = Math.ceil((new Date(apt.date).getTime() - Date.now()) / 86400000);
                return (
                  <View key={apt.id} style={[s.aptCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[s.aptAccent, { backgroundColor: theme.accentSoft }]} />
                    <View style={s.aptBody}>
                      <Text style={[s.aptDoctor, { color: theme.text }]}>{apt.doctorName}</Text>
                      <Text style={[s.aptMeta, { color: theme.textSecondary }]}>
                        {apt.clinic}
                      </Text>
                      <Text style={[s.aptDate, { color: theme.textSecondary }]}>
                        {apt.date} at {apt.time}
                      </Text>
                    </View>
                    <View style={[s.aptBadge, { backgroundColor: theme.accentSoft }]}>
                      <Text style={[s.aptBadgeNum, { color: theme.accent }]}>{daysUntil}</Text>
                      <Text style={[s.aptBadgeUnit, { color: theme.accent }]}>days</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: '#1E1433',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  // header
  header: { paddingHorizontal: Spacing.four, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLogo: { width: 44, height: 44 },
  greeting: { fontSize: 12, fontWeight: '500' },
  name: { fontSize: 20, fontWeight: '700', marginTop: 1 },
  signOutBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  signOutText: { fontSize: 13, fontWeight: '600' },
  demoBadge: { marginTop: 12, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, alignSelf: 'flex-start' },
  demoBadgeText: { fontSize: 12, fontWeight: '600' },
  // scroll
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: 80 },
  // stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', ...CARD_SHADOW },
  statVal: { fontSize: 30, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  // section
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 28, marginBottom: 12 },
  // actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '48%', padding: 16, borderRadius: 16, borderWidth: 1, flexGrow: 1, ...CARD_SHADOW },
  actionDot: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionDotInner: { width: 14, height: 14, borderRadius: 7 },
  actionLabel: { fontSize: 14, fontWeight: '700' },
  actionSub: { fontSize: 12, marginTop: 2 },
  // appointments
  aptCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, marginBottom: 10, overflow: 'hidden', ...CARD_SHADOW },
  aptAccent: { width: 4, alignSelf: 'stretch' },
  aptBody: { flex: 1, padding: 14 },
  aptDoctor: { fontSize: 15, fontWeight: '700' },
  aptMeta: { fontSize: 13, marginTop: 2 },
  aptDate: { fontSize: 12, marginTop: 1 },
  aptBadge: { paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', marginRight: 12 },
  aptBadgeNum: { fontSize: 20, fontWeight: '700' },
  aptBadgeUnit: { fontSize: 11, fontWeight: '600' },
});
