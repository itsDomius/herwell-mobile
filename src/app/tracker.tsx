import { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type Tab = 'log' | 'calendar' | 'trends';

const CARD_SHADOW = {
  shadowColor: '#1E1433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
};

function SliderRow({ label, value, onInc, onDec, color }: {
  label: string; value: number; onInc: () => void; onDec: () => void; color: string;
}) {
  const theme = useTheme();
  const pct = (value / 10) * 100;
  return (
    <View style={sr.row}>
      <View style={sr.top}>
        <Text style={[sr.label, { color: theme.text }]}>{label}</Text>
        <Text style={[sr.value, { color }]}>{value}<Text style={[sr.max, { color: theme.textSecondary }]}>/10</Text></Text>
      </View>
      <View style={sr.track}>
        <View style={[sr.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <View style={sr.buttons}>
        <TouchableOpacity style={[sr.btn, { borderColor: theme.border }]} onPress={onDec}>
          <Text style={[sr.btnText, { color: theme.text }]}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[sr.btn, { borderColor: theme.border }]} onPress={onInc}>
          <Text style={[sr.btnText, { color: theme.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sr = StyleSheet.create({
  row: { paddingVertical: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  value: { fontSize: 16, fontWeight: '700' },
  max: { fontSize: 12, fontWeight: '400' },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.07)', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  btn: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 18, fontWeight: '500', lineHeight: 20 },
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
    const w = 340, h = 130, px = 28, py = 14;
    const cw = w - px * 2, ch = h - py * 2;
    const step = cw / (trendData.length - 1);
    const pts = trendData.map((d, i) => `${px + i * step},${py + ch - (accessor(d) / max) * ch}`).join(' ');
    return (
      <View style={[s.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[s.chartLabel, { color: theme.text }]}>{label}</Text>
        <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
          <Line x1={px} y1={py} x2={px} y2={h - py} stroke={theme.border} strokeWidth={1} />
          <Line x1={px} y1={h - py} x2={w - px} y2={h - py} stroke={theme.border} strokeWidth={1} />
          <SvgText x={px - 4} y={py + 4} textAnchor="end" fontSize={9} fill={theme.textSecondary}>{max}</SvgText>
          <SvgText x={px - 4} y={h - py + 4} textAnchor="end" fontSize={9} fill={theme.textSecondary}>0</SvgText>
          <Polyline points={pts} stroke={chartColor} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          {trendData.map((d, i) => (
            <Circle key={d.id} cx={px + i * step} cy={py + ch - (accessor(d) / max) * ch} r={4} fill={chartColor} />
          ))}
        </Svg>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.pageHeader, { backgroundColor: theme.terracottaSoft }]}>
          <Text style={[s.pageTitle, { color: theme.text }]}>Symptom Tracker</Text>
          <Text style={[s.pageSubtitle, { color: theme.textSecondary }]}>{symptoms.length} entries logged</Text>
          <View style={[s.tabBar, { backgroundColor: theme.card }]}>
            {(['log', 'calendar', 'trends'] as Tab[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[s.tabBtn, tab === t && { backgroundColor: theme.terracotta }]}
                onPress={() => setTab(t)}
              >
                <Text style={[s.tabText, tab === t ? { color: '#FFF' } : { color: theme.textSecondary }]}>
                  {t === 'log' ? 'Log' : t === 'calendar' ? 'Calendar' : 'Trends'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'log' && (
            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={[s.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={form.date}
                onChangeText={t => setForm({ ...form, date: t })}
                placeholder="2026-11-01"
                placeholderTextColor={theme.textSecondary}
              />
              <View style={[s.divider, { backgroundColor: theme.border }]} />
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
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <View style={s.switchRow}>
                <Text style={[s.switchLabel, { color: theme.text }]}>Spotting</Text>
                <Switch value={form.spotting} onValueChange={v => setForm({ ...form, spotting: v })}
                  trackColor={{ false: theme.border, true: theme.terracotta }} thumbColor="#FFF" />
              </View>
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Notes</Text>
              <TextInput
                style={[s.input, s.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={form.notes}
                onChangeText={t => setForm({ ...form, notes: t })}
                multiline
                placeholder="How are you feeling?"
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity style={[s.primaryBtn, { backgroundColor: theme.terracotta }]} onPress={handleLog} activeOpacity={0.8}>
                <Text style={s.primaryBtnText}>Save entry</Text>
              </TouchableOpacity>
            </View>
          )}

          {tab === 'calendar' && (
            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={s.calNav}>
                <TouchableOpacity onPress={() => setCalMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 })}>
                  <Text style={[s.calNavText, { color: theme.accent }]}>‹ Prev</Text>
                </TouchableOpacity>
                <Text style={[s.calNavTitle, { color: theme.text }]}>{monthNames[calMonth.month]} {calMonth.year}</Text>
                <TouchableOpacity onPress={() => setCalMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 })}>
                  <Text style={[s.calNavText, { color: theme.accent }]}>Next ›</Text>
                </TouchableOpacity>
              </View>
              <View style={s.calGrid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <View key={i} style={s.calCell}>
                    <Text style={[s.calHeader, { color: theme.textSecondary }]}>{d}</Text>
                  </View>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <View key={`e-${i}`} style={s.calCell} />)}
                {monthDays.map(d => (
                  <TouchableOpacity
                    key={d.day}
                    style={[s.calCell, d.entry && { backgroundColor: theme.accentSoft, borderRadius: 8 }, selectedDate === d.iso && { backgroundColor: theme.accent, borderRadius: 8 }]}
                    onPress={() => d.entry && setSelectedDate(d.iso)}
                  >
                    <Text style={[s.calDayText, { color: selectedDate === d.iso ? '#FFF' : d.entry ? theme.accent : theme.text }]}>{d.day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedEntry && (
                <View style={[s.dayDetail, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Text style={[s.dayDetailTitle, { color: theme.text }]}>{selectedEntry.date}</Text>
                  {([['Pain', selectedEntry.painIntensity], ['Bloating', selectedEntry.bloating], ['Energy', selectedEntry.energy], ['Mood', selectedEntry.mood], ['Spotting', selectedEntry.spotting ? 'Yes' : 'No']] as [string, number | string][]).map(([label, val]) => (
                    <View key={label} style={s.dayRow}>
                      <Text style={[s.dayLabel, { color: theme.textSecondary }]}>{label}</Text>
                      <Text style={[s.dayVal, { color: theme.text }]}>{typeof val === 'number' ? `${val}/10` : val}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {tab === 'trends' && (
            trendData.length < 2 ? (
              <View style={s.empty}>
                <Text style={[s.emptyText, { color: theme.textSecondary }]}>Log at least 2 entries to see trends.</Text>
              </View>
            ) : (
              <>
                {renderChart('Pain intensity', e => e.painIntensity, 10, theme.terracotta)}
                {renderChart('Energy level', e => e.energy, 10, theme.accent)}
                {renderChart('Mood', e => e.mood, 10, theme.accent)}
                {renderChart('Bloating', e => e.bloating, 10, theme.terracotta)}
              </>
            )
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
  pageHeader: { paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  pageSubtitle: { fontSize: 13, marginTop: 2, marginBottom: 12 },
  tabBar: { flexDirection: 'row', borderRadius: 14, padding: 4, gap: 2 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: 80 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, ...CARD_SHADOW },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top', marginBottom: 4 },
  divider: { height: 1, marginVertical: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchLabel: { fontSize: 15, fontWeight: '600' },
  primaryBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  calNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calNavText: { fontSize: 14, fontWeight: '700' },
  calNavTitle: { fontSize: 16, fontWeight: '700' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  calHeader: { fontSize: 11, fontWeight: '700' },
  calDayText: { fontSize: 13, fontWeight: '500' },
  dayDetail: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 12 },
  dayDetailTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  dayLabel: { fontSize: 14 },
  dayVal: { fontSize: 14, fontWeight: '600' },
  empty: { marginTop: 48, alignItems: 'center' },
  emptyText: { fontSize: 15, textAlign: 'center' },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10, ...CARD_SHADOW },
  chartLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
});
