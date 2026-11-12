import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const STATUS_COLOR: Record<string, string> = {
  done: '#22c55e', pending: '#f59e0b', late: '#f97316', missed: '#ef4444',
};

const CARD_SHADOW = { shadowColor: '#1E1433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 };

export default function ClinicTodayScreen() {
  const theme = useTheme();
  const { user, clinicProtocols, clinicCompliance, clinicNotifications, confirmClinicDose, seenClinicNotif, IVF_TODAY, signOut } = useDemo();
  if (!user) return null;

  const myProtos = clinicProtocols
    .filter(p => p.patientId === user.id && p.date === IVF_TODAY)
    .sort((a, b) => a.time.localeCompare(b.time));

  const unseenNotifs = clinicNotifications.filter(n => n.patientId === user.id && !n.seenByPatient);

  function getStatus(entryId: string) {
    return clinicCompliance.find(c => c.protocolEntryId === entryId)?.status ?? 'pending';
  }

  const totalDoses = myProtos.length;
  const doneDoses = myProtos.filter(p => getStatus(p.id) === 'done').length;

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { backgroundColor: '#f3e8ff' }]}>
          <View style={s.headerRow}>
            <View>
              <Text style={[s.headerTitle, { color: theme.text }]}>Today's Protocol</Text>
              <Text style={[s.headerSub, { color: theme.textSecondary }]}>{IVF_TODAY} · {doneDoses}/{totalDoses} done</Text>
            </View>
            <TouchableOpacity onPress={signOut} style={[s.signOutBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Text style={[s.signOutText, { color: theme.textSecondary }]}>Sign out</Text>
            </TouchableOpacity>
          </View>
          {totalDoses > 0 && (
            <View style={[s.progressTrack, { backgroundColor: theme.border }]}>
              <View style={[s.progressFill, { width: `${(doneDoses / totalDoses) * 100}%` as any, backgroundColor: '#7c3aed' }]} />
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {unseenNotifs.map(n => (
            <View key={n.id} style={[s.notifCard, { backgroundColor: '#fefce8', borderColor: '#fde047' }]}>
              <Text style={[s.notifTitle, { color: '#92400e' }]}>⚠️ Πλάνο Ενημερώθηκε</Text>
              <Text style={[s.notifText, { color: '#78350f' }]}>{n.details}</Text>
              <TouchableOpacity style={s.seenBtn} onPress={() => seenClinicNotif(n.id)}>
                <Text style={s.seenBtnText}>Το είδα ✓</Text>
              </TouchableOpacity>
            </View>
          ))}

          {myProtos.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🎉</Text>
              <Text style={[s.emptyTitle, { color: theme.text }]}>Δεν υπάρχουν δόσεις σήμερα</Text>
              <Text style={[s.emptyText, { color: theme.textSecondary }]}>Ελέγξτε αύριο.</Text>
            </View>
          ) : (
            myProtos.map(p => {
              const status = getStatus(p.id);
              const done = status === 'done';
              return (
                <View key={p.id} style={[s.doseCard, { backgroundColor: done ? '#f0fdf4' : p.critical ? '#fff5f5' : theme.card, borderColor: done ? '#bbf7d0' : p.critical ? '#fecaca' : theme.border, ...CARD_SHADOW }]}>
                  <View style={s.doseTop}>
                    <View style={s.doseLeft}>
                      <Text style={s.doseIcon}>{p.route === 'injection' ? '💉' : p.route === 'oral' ? '💊' : '🔵'}</Text>
                      <View>
                        <View style={s.doseNameRow}>
                          <Text style={[s.doseName, { color: theme.text }]}>{p.medication}</Text>
                          {p.critical && <View style={s.critBadge}><Text style={s.critBadgeText}>CRITICAL</Text></View>}
                        </View>
                        <Text style={[s.doseMeta, { color: theme.textSecondary }]}>{p.dose} · {p.time} · {p.route}</Text>
                        {p.notes ? <Text style={s.doseNote}>⚠️ {p.notes}</Text> : null}
                      </View>
                    </View>
                    {done && <View style={s.doneBadge}><Text style={s.doneBadgeText}>✓ Έγινε</Text></View>}
                  </View>
                  {!done && (
                    <TouchableOpacity
                      style={[s.doneBtn, { backgroundColor: p.critical ? '#ef4444' : '#7c3aed' }]}
                      onPress={() => confirmClinicDose(p.id, user.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.doneBtnText}>✓ Το έκανα</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.four, paddingTop: 12, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 2 },
  signOutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  signOutText: { fontSize: 12, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  notifCard: { borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  notifTitle: { fontWeight: '800', fontSize: 15, marginBottom: 6 },
  notifText: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  seenBtn: { backgroundColor: '#f59e0b', paddingVertical: 9, paddingHorizontal: 18, borderRadius: 10, alignSelf: 'flex-start' },
  seenBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 14 },
  doseCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 14 },
  doseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  doseLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  doseIcon: { fontSize: 26, marginTop: 2 },
  doseNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  doseName: { fontSize: 18, fontWeight: '800' },
  critBadge: { backgroundColor: '#fee2e2', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
  critBadgeText: { color: '#ef4444', fontSize: 10, fontWeight: '800' },
  doseMeta: { fontSize: 13, marginTop: 3 },
  doseNote: { color: '#d97706', fontSize: 12, marginTop: 3 },
  doneBadge: { backgroundColor: '#dcfce7', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 16 },
  doneBadgeText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  doneBtn: { width: '100%', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
