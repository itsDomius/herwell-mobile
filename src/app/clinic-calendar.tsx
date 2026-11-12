import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDemo } from '@/contexts/DemoContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Spacing } from '@/constants/theme';

const SHADOW = { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 };
const STATUS_ICON: Record<string, string> = { done: 'checkmark-circle', pending: 'time-outline', late: 'warning-outline', missed: 'close-circle-outline' };
const STATUS_COLOR_MAP = (c: any): Record<string, string> => ({
  done: c.success, pending: c.warning, late: c.warning, missed: c.error,
});

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 350, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [delay]);
  return <Animated.View style={{ opacity, transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

export default function ClinicCalendarScreen() {
  const { colors } = useAppTheme();
  const { user, clinicProtocols, clinicCompliance, IVF_TODAY } = useDemo();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  if (!user) return null;

  const year = parseInt(IVF_TODAY.split('-')[0]);
  const month = parseInt(IVF_TODAY.split('-')[1]) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const monthPad = String(month + 1).padStart(2, '0');

  const statusColors = STATUS_COLOR_MAP(colors);

  function getDayStatus(date: string): string | null {
    const dayComp = clinicCompliance.filter(c => c.patientId === user!.id && c.date === date);
    if (dayComp.length === 0) return clinicProtocols.some(p => p.patientId === user!.id && p.date === date) ? 'pending' : null;
    if (dayComp.some(c => c.status === 'missed')) return 'missed';
    if (dayComp.some(c => c.status === 'late')) return 'late';
    if (dayComp.every(c => c.status === 'done')) return 'done';
    return 'pending';
  }

  const dayView = selectedDate
    ? clinicProtocols.filter(p => p.patientId === user.id && p.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
    : [];

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { borderBottomColor: colors.cardBorder }]}>
          <Ionicons name="calendar-outline" size={22} color={colors.accent} />
          <Text style={[s.headerTitle, { color: colors.text }]}>Calendar</Text>
          <Text style={[s.headerSub, { color: colors.textSecondary }]}>November {year}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <FadeIn>
            <View style={[s.calCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOW]}>
              <View style={s.weekRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <Text key={i} style={[s.weekLabel, { color: colors.textSecondary }]}>{d}</Text>
                ))}
              </View>
              <View style={s.grid}>
                {Array.from({ length: firstDow }, (_, i) => <View key={`e-${i}`} style={s.dayCell} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const date = `${year}-${monthPad}-${String(day).padStart(2, '0')}`;
                  const status = getDayStatus(date);
                  const isToday = date === IVF_TODAY;
                  const isSel = date === selectedDate;
                  return (
                    <TouchableOpacity
                      key={date}
                      style={[
                        s.dayCell,
                        isSel && { backgroundColor: colors.accent, borderRadius: 10 },
                        isToday && !isSel && { backgroundColor: colors.accentMid, borderRadius: 10 },
                      ]}
                      onPress={() => setSelectedDate(date === selectedDate ? null : date)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.dayNum, { color: isSel ? '#fff' : isToday ? colors.accent : colors.text }]}>{day}</Text>
                      {status && <View style={[s.dot, { backgroundColor: isSel ? 'rgba(255,255,255,0.8)' : statusColors[status] }]} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={s.legend}>
                {Object.entries(statusColors).map(([k, v]) => (
                  <View key={k} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: v as string }]} />
                    <Text style={[s.legendText, { color: colors.textSecondary }]}>{k}</Text>
                  </View>
                ))}
              </View>
            </View>
          </FadeIn>

          {selectedDate && (
            <FadeIn delay={80}>
              <View style={[s.daySection, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOW]}>
                <View style={s.daySectionHeader}>
                  <Ionicons name="list-outline" size={18} color={colors.accent} />
                  <Text style={[s.daySectionTitle, { color: colors.text }]}>{selectedDate}</Text>
                </View>
                {dayView.length === 0 ? (
                  <Text style={[s.emptyText, { color: colors.textSecondary }]}>No doses on this day.</Text>
                ) : (
                  dayView.map(p => {
                    const cl = clinicCompliance.find(c => c.protocolEntryId === p.id);
                    const status = cl?.status ?? (p.date > IVF_TODAY ? 'pending' : 'missed');
                    const sc = statusColors[status];
                    return (
                      <View key={p.id} style={[s.doseRow, { borderBottomColor: colors.cardBorder }]}>
                        <View style={[s.iconCircle, { backgroundColor: colors.accentSoft }]}>
                          <Ionicons name={p.route === 'injection' ? 'medkit-outline' : p.route === 'oral' ? 'nutrition-outline' : 'flask-outline'} size={18} color={colors.accent} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={[s.doseName, { color: colors.text }]}>{p.medication}  {p.dose}</Text>
                          <Text style={[s.doseTime, { color: colors.textSecondary }]}>{p.time}</Text>
                        </View>
                        <Ionicons name={STATUS_ICON[status] as any} size={20} color={sc} />
                      </View>
                    );
                  })
                )}
              </View>
            </FadeIn>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.four, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1 },
  headerSub: { fontSize: 13 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  calCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  weekRow: { flexDirection: 'row', marginBottom: 10 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  dayNum: { fontSize: 14, fontWeight: '600' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, textTransform: 'capitalize' },
  daySection: { borderRadius: 20, borderWidth: 1, padding: 16 },
  daySectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  daySectionTitle: { fontSize: 16, fontWeight: '700' },
  emptyText: { fontSize: 14 },
  doseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  doseName: { fontSize: 15, fontWeight: '700' },
  doseTime: { fontSize: 12, marginTop: 2 },
});
