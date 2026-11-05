import { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type Tab = 'log' | 'calendar' | 'trends';

function SliderRow({ label, value, onInc, onDec, color }: { label: string; value: number; onInc: () => void; onDec: () => void; color: string }) {
  const theme = useTheme();
  return (
    <View style={sliderStyles.row}>
      <Text style={[sliderStyles.label, { color: theme.text }]}>{label}</Text>
      <View style={sliderStyles.controls}>
        <TouchableOpacity style={[sliderStyles.btn, { borderColor: theme.border }]} onPress={onDec}>
          <Text style={[sliderStyles.btnText, { color: theme.text }]}>-</Text>
        </TouchableOpacity>
        <Text style={[sliderStyles.value, { color }]}>{value}</Text>
        <TouchableOpacity style={[sliderStyles.btn, { borderColor: theme.border }]} onPress={onInc}>
          <Text style={[sliderStyles.btnText, { color: theme.text }]}>+</Text>
        </TouchableOpacity>
        <Text style={[sliderStyles.max, { color: theme.textSecondary }]}>/10</Text>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  label: { fontSize: 15, fontWeight: '500' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 18, fontWeight: '600' },
  value: { fontSize: 20, fontWeight: '700', width: 30, textAlign: 'center' },
  max: { fontSize: 13 },
});

export default function TrackerScreen() {
  const theme = useTheme();
  const { symptoms, addSymptom } = useDemo();
  const [tab, setTab] = useState<Tab>('log');
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({ date: '', painIntensity: 3, bloating: 2, energy: 5, mood: 5, spotting: false, notes: '' });

  function handleLog() {
    if (!form.date) return;
    addSymptom({
      patientId: 'patient-1',
      date: form.date,
      painIntensity: form.painIntensity,
      bloating: form.bloating,
      energy: form.energy,
      mood: form.mood,
      spotting: form.spotting,
      notes: form.notes || undefined,
    });
    setForm({ date: '', painIntensity: 3, bloating: 2, energy: 5, mood: 5, spotting: false, notes: '' });
  }

  const sorted = useMemo(() => [...symptoms].sort((a, b) => b.date.localeCompare(a.date)), [symptoms]);
  const trendData = useMemo(() => sorted.slice(0, 30).reverse(), [sorted]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
  const firstDay = new Date(calMonth.year, calMonth.month, 1).getDay();
  const toISO = (d: Date) => d.toISOString().split('T')[0];
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const iso = toISO(new Date(calMonth.year, calMonth.month, i + 1));
    return { day: i + 1, iso, entry: symptoms.find(s => s.date === iso) };
  });
  const selectedEntry = selectedDate ? symptoms.find(s => s.date === selectedDate) : null;

  function renderChart(label: string, accessor: (e: typeof trendData[0]) => number, max: number, chartColor: string) {
    if (trendData.length < 2) return null;
    const w = 340, h = 140, px = 30, py = 16;
    const cw = w - px * 2, ch = h - py * 2;
    const step = cw / (trendData.length - 1);
    const pts = trendData.map((d, i) => `${px + i * step},${py + ch - (accessor(d) / max) * ch}`).join(' ');
    return (
      <View style={{ marginTop: Spacing.four }}>
        <Text style={[styles.chartLabel, { color: theme.text }]}>{label}</Text>
        <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
          <Line x1={px} y1={py} x2={px} y2={h - py} stroke={theme.border} strokeWidth={1} />
          <Line x1={px} y1={h - py} x2={w - px} y2={h - py} stroke={theme.border} strokeWidth={1} />
          <SvgText x={px - 4} y={py + 4} textAnchor="end" fontSize={10} fill={theme.textSecondary}>{max}</SvgText>
          <SvgText x={px - 4} y={h - py + 4} textAnchor="end" fontSize={10} fill={theme.textSecondary}>0</SvgText>
          <Polyline points={pts} stroke={chartColor} strokeWidth={2} fill="none" strokeLinejoin="round" />
          {trendData.map((d, i) => (
            <Circle key={d.id} cx={px + i * step} cy={py + ch - (accessor(d) / max) * ch} r={3} fill={chartColor} />
          ))}
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.text }]}>Symptom Tracker</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{symptoms.length} entries logged</Text>

          <View style={styles.tabBar}>
            {(['log', 'calendar', 'trends'] as Tab[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && { backgroundColor: theme.accent }]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t ? { color: '#FFF' } : { color: theme.textSecondary }]}>
                  {t === 'log' ? 'Log' : t === 'calendar' ? 'Calendar' : 'Trends'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'log' && (
            <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={form.date}
                onChangeText={t => setForm({ ...form, date: t })}
                placeholder="2026-11-01"
                placeholderTextColor={theme.textSecondary}
              />
              <SliderRow label="Pain intensity" value={form.painIntensity} color={theme.terracotta}
                onDec={() => setForm(f => ({ ...f, painIntensity: Math.max(0, f.painIntensity - 1) }))}
                onInc={() => setForm(f => ({ ...f, painIntensity: Math.min(10, f.painIntensity + 1) }))} />
              <SliderRow label="Bloating" value={form.bloating} color={theme.terracotta}
                onDec={() => setForm(f => ({ ...f, bloating: Math.max(0, f.bloating - 1) }))}
                onInc={() => setForm(f => ({ ...f, bloating: Math.min(10, f.bloating + 1) }))} />
              <SliderRow label="Energy" value={form.energy} color={theme.accent}
                onDec={() => setForm(f => ({ ...f, energy: Math.max(0, f.energy - 1) }))}
                onInc={() => setForm(f => ({ ...f, energy: Math.min(10, f.energy + 1) }))} />
              <SliderRow label="Mood" value={form.mood} color={theme.accent}
                onDec={() => setForm(f => ({ ...f, mood: Math.max(0, f.mood - 1) }))}
                onInc={() => setForm(f => ({ ...f, mood: Math.min(10, f.mood + 1) }))} />
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>Spotting</Text>
                <Switch value={form.spotting} onValueChange={v => setForm({ ...form, spotting: v })} trackColor={{ true: theme.accent }} />
              </View>
              <Text style={[styles.formLabel, { color: theme.textSecondary, marginTop: 12 }]}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={form.notes}
                onChangeText={t => setForm({ ...form, notes: t })}
                multiline
                placeholder="How are you feeling?"
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.accent }]} onPress={handleLog}>
                <Text style={styles.primaryBtnText}>Save entry</Text>
              </TouchableOpacity>
            </View>
          )}

          {tab === 'calendar' && (
            <>
              <View style={styles.calNav}>
                <TouchableOpacity onPress={() => setCalMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 })}>
                  <Text style={[styles.calNavText, { color: theme.accent }]}>Prev</Text>
                </TouchableOpacity>
                <Text style={[styles.calNavTitle, { color: theme.text }]}>{monthNames[calMonth.month]} {calMonth.year}</Text>
                <TouchableOpacity onPress={() => setCalMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 })}>
                  <Text style={[styles.calNavText, { color: theme.accent }]}>Next</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calGrid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <View key={i} style={styles.calCell}><Text style={[styles.calHeader, { color: theme.textSecondary }]}>{d}</Text></View>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <View key={`e-${i}`} style={styles.calCell} />)}
                {monthDays.map(d => (
                  <TouchableOpacity
                    key={d.day}
                    style={[styles.calCell, d.entry && { backgroundColor: theme.accentSoft, borderRadius: 8 }, selectedDate === d.iso && { backgroundColor: theme.accent, borderRadius: 8 }]}
                    onPress={() => d.entry && setSelectedDate(d.iso)}
                  >
                    <Text style={[styles.calDayText, { color: selectedDate === d.iso ? '#FFF' : d.entry ? theme.accent : theme.text }]}>{d.day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedEntry && (
                <View style={[styles.dayDetail, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.dayDetailTitle, { color: theme.text }]}>{selectedEntry.date}</Text>
                  {[
                    ['Pain', selectedEntry.painIntensity],
                    ['Bloating', selectedEntry.bloating],
                    ['Energy', selectedEntry.energy],
                    ['Mood', selectedEntry.mood],
                    ['Spotting', selectedEntry.spotting ? 'Yes' : 'No'],
                  ].map(([label, val]) => (
                    <View key={label as string} style={styles.dayRow}>
                      <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>{label as string}</Text>
                      <Text style={[styles.dayVal, { color: theme.text }]}>{typeof val === 'number' ? `${val}/10` : val as string}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {tab === 'trends' && (
            trendData.length < 2 ? (
              <View style={styles.empty}><Text style={[styles.emptyText, { color: theme.textSecondary }]}>Log at least 2 entries to see trends.</Text></View>
            ) : (
              <>
                {renderChart('Pain intensity', e => e.painIntensity, 10, theme.terracotta)}
                {renderChart('Energy level', e => e.energy, 10, theme.accent)}
                {renderChart('Mood', e => e.mood, 10, theme.accent)}
                {renderChart('Bloating', e => e.bloating, 10, theme.terracotta)}
              </>
            )
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
  title: { fontSize: 24, fontWeight: '700', marginTop: Spacing.four },
  subtitle: { fontSize: 14, marginTop: 2 },
  tabBar: { flexDirection: 'row', gap: 8, marginTop: Spacing.four },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  tabText: { fontSize: 14, fontWeight: '600' },
  formCard: { borderWidth: 1, borderRadius: 16, padding: Spacing.four, marginTop: Spacing.four },
  formLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  switchLabel: { fontSize: 15, fontWeight: '500' },
  primaryBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: Spacing.four },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  calNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.four },
  calNavText: { fontSize: 15, fontWeight: '600' },
  calNavTitle: { fontSize: 17, fontWeight: '700' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.three },
  calCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  calHeader: { fontSize: 12, fontWeight: '700' },
  calDayText: { fontSize: 14, fontWeight: '500' },
  dayDetail: { borderWidth: 1, borderRadius: 14, padding: Spacing.three, marginTop: Spacing.four },
  dayDetailTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  dayLabel: { fontSize: 14 },
  dayVal: { fontSize: 14, fontWeight: '600' },
  empty: { marginTop: Spacing.five, alignItems: 'center' },
  emptyText: { fontSize: 15 },
  chartLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
});
