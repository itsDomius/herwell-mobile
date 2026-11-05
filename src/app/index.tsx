import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back,</Text>
              <Text style={[styles.name, { color: theme.text }]}>{user?.name ?? 'Guest'}</Text>
            </View>
            <TouchableOpacity onPress={signOut} activeOpacity={0.7}>
              <Text style={[styles.signOut, { color: theme.terracotta }]}>Sign out</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.demoBanner, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.demoBannerText, { color: theme.accent }]}>
              Demo prototype — synthetic data only
            </Text>
          </View>

          <View style={styles.statsRow}>
            {[
              { label: 'Records', value: records.length },
              { label: 'Entries', value: symptoms.length },
              { label: 'Upcoming', value: upcoming.length },
            ].map(s => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.statVal, { color: theme.accent }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: 'Medical Passport', route: '/passport' as const, color: theme.accent },
              { label: 'Log Symptoms', route: '/tracker' as const, color: theme.terracotta },
              { label: 'Appointment Prep', route: '/explore' as const, color: theme.accent },
              { label: 'Education Hub', route: '/explore' as const, color: theme.terracotta },
            ].map((a, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(a.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionDot, { backgroundColor: a.color }]} />
                <Text style={[styles.actionLabel, { color: theme.text }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {upcoming.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming appointments</Text>
              {upcoming.map(apt => {
                const daysUntil = Math.ceil((new Date(apt.date).getTime() - Date.now()) / 86400000);
                return (
                  <View key={apt.id} style={[styles.aptCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.aptInfo}>
                      <Text style={[styles.aptDoctor, { color: theme.text }]}>{apt.doctorName}</Text>
                      <Text style={[styles.aptMeta, { color: theme.textSecondary }]}>
                        {apt.clinic} · {apt.date} at {apt.time}
                      </Text>
                    </View>
                    <View style={[styles.aptBadge, { backgroundColor: theme.accentSoft }]}>
                      <Text style={[styles.aptBadgeText, { color: theme.accent }]}>{daysUntil}d</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.four },
  greeting: { fontSize: 14 },
  name: { fontSize: 24, fontWeight: '700', marginTop: 2 },
  signOut: { fontSize: 14, fontWeight: '600' },
  demoBanner: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginTop: Spacing.four, alignItems: 'center' },
  demoBannerText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.four },
  statCard: { flex: 1, padding: Spacing.three, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.five },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.three },
  actionCard: { width: '47%', padding: Spacing.three, borderRadius: 14, borderWidth: 1, flexGrow: 1 },
  actionDot: { width: 10, height: 10, borderRadius: 5, marginBottom: Spacing.two },
  actionLabel: { fontSize: 14, fontWeight: '600' },
  aptCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: 14, borderWidth: 1, marginTop: Spacing.three },
  aptInfo: { flex: 1 },
  aptDoctor: { fontSize: 15, fontWeight: '600' },
  aptMeta: { fontSize: 13, marginTop: 2 },
  aptBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  aptBadgeText: { fontSize: 13, fontWeight: '700' },
});
