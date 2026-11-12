import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const STATUS_COLOR: Record<string, string> = {
  done: '#22c55e', pending: '#f59e0b', late: '#f97316', missed: '#ef4444',
};
const CARD_SHADOW = { shadowColor: '#1E1433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 };

export default function ClinicCalendarScreen() {
  const theme = useTheme();
  const { user, clinicProtocols, clinicCompliance, IVF_TODAY } = useDemo();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  if (!user) return null;

  const year = parseInt(IVF_TODAY.split('-')[0]);
  const month = parseInt(IVF_TODAY.split('-')[1]) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  function getDayStatus(date: string) {
    const dayComp = clinicCompliance.filter(c => c.patientId === user.id && c.date === date);
    if (dayComp.length === 0) {
      return clinicProtocols.some(p => p.patientId === user.id && p.date === date) ? 'pending' : null;
    }
    if (dayComp.some(c => c.status === 'missed')) return 'missed';
    if (dayComp.some(c => c.status === 'late')) return 'late';
    if (dayComp.every(c => c.status === 'done')) return 'done';
    return 'pending';
  }

  const dayView = selectedDate
    ? clinicProtocols.filter(p => p.patientId === user.id && p.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
    : [];

  const monthNum = String(month + 1).padStart(2, '0');

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { backgroundColor: '#f3e8ff' }]}>
          <Text style={[s.headerTitle, { color: theme.text }]}>📅 Ημερολόγιο</Text>
          <Text style={[s.headerSub, { color: theme.textSecondary }]}>Νοέμβριος {year}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={[s.calCard, { backgroundColor: theme.card, borderColor: theme.border, ...CARD_SHADOW }]}>
            <View style={s.weekRow}>
              {['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'].map(d => (
                <Text key={d} style={[s.weekLabel, { color: theme.textSecondary }]}>{d}</Text>
              ))}
            </View>
            <View style={s.grid}>
              {Array.from({ length: firstDow }, (_, i) => <View key={`e-${i}`} style={s.dayCell} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = `${year}-${monthNum}-${String(day).padStart(2, '0')}`;
                const status = getDayStatus(date);
                const isToday = date === IVF_TODAY;
                const isSelected = date === selectedDate;
                return (
                  <TouchableOpacity
                    key={date}
                    style={[s.dayCell, isSelected && { backgroundColor: '#7c3aed' }, isToday && !isSelected && { backgroundColor: '#ede9fe' }]}
                    onPress={() => setSelectedDate(date === selectedDate ? null : date)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.dayNum, { color: isSelected ? '#fff' : isToday ? '#7c3aed' : theme.text }]}>{day}</Text>
                    {status && <View style={[s.statusDot, { backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : STATUS_COLOR[status] }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedDate && (
            <View style={{ marginTop: 20 }}>
              <Text style={[s.sectionTitle, { color: theme.text }]}>{selectedDate}</Text>
              {dayView.length === 0 ? (
                <Text style={[s.emptyText, { color: theme.textSecondary }]}>Δεν υπάρχουν δόσεις αυτή τη μέρα.</Text>
              ) : (
                dayView.map(p => {
                  const cl = clinicCompliance.find(c => c.protocolEntryId === p.id);
                  const status = cl?.status ?? (p.date > IVF_TODAY ? 'pending' : 'missed');
                  return (
                    <View key={p.id} style={[s.doseRow, { backgroundColor: theme.card, borderColor: theme.border, ...CARD_SHADOW }]}>
                      <Text style={s.doseIcon}>{p.route === 'injection' ? '💉' : p.route === 'oral' ? '💊' : '🔵'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.doseName, { color: theme.text }]}>{p.medication} {p.dose}</Text>
                        <Text style={[s.doseMeta, { color: theme.textSecondary }]}>{p.time}</Text>
                      </View>
                      <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLOR[status]}20` }]}>
                        <Text style={[s.statusText, { color: STATUS_COLOR[status] }]}>
                          {status === 'done' ? '✓' : status === 'pending' ? '⏳' : status === 'late' ? '⚠' : '✗'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
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
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 2 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  calCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, padding: 2 },
  dayNum: { fontSize: 14, fontWeight: '600' },
  statusDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  emptyText: { fontSize: 14 },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  doseIcon: { fontSize: 20 },
  doseName: { fontSize: 15, fontWeight: '700' },
  doseMeta: { fontSize: 12, marginTop: 2 },
  statusBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 14, fontWeight: '700' },
});
