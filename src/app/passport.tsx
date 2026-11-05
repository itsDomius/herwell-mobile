import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDemo, type MedicalRecord } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const categories = [
  { value: 'blood_test', label: 'Blood Tests' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'medication', label: 'Medications' },
  { value: 'surgery', label: 'Surgeries' },
  { value: 'consultation', label: 'Consultations' },
  { value: 'note', label: 'Notes' },
];

export default function PassportScreen() {
  const theme = useTheme();
  const { records, addRecord } = useDemo();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'list' | 'detail' | 'add'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: 'blood_test', title: '', date: '', provider: '', notes: '' });

  const filtered = filter === 'all' ? records : records.filter(r => r.category === filter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const selected = records.find(r => r.id === selectedId);

  function handleAdd() {
    if (!form.title || !form.date) return;
    addRecord({
      patientId: 'patient-1',
      category: form.category,
      title: form.title,
      date: form.date,
      provider: form.provider || undefined,
      notes: form.notes || undefined,
    });
    setForm({ category: 'blood_test', title: '', date: '', provider: '', notes: '' });
    setView('list');
  }

  function openDetail(rec: MedicalRecord) {
    setSelectedId(rec.id);
    setView('detail');
  }

  if (view === 'add') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => setView('list')}>
              <Text style={[styles.backBtn, { color: theme.accent }]}>Back to records</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Add record</Text>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              value={form.title}
              onChangeText={t => setForm({ ...form, title: t })}
              placeholder="e.g. Hormone Panel"
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              value={form.date}
              onChangeText={t => setForm({ ...form, date: t })}
              placeholder="2026-11-01"
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Provider (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              value={form.provider}
              onChangeText={t => setForm({ ...form, provider: t })}
              placeholder="e.g. Athens Diagnostic Lab"
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              value={form.notes}
              onChangeText={t => setForm({ ...form, notes: t })}
              multiline
              numberOfLines={4}
              placeholder="Results or observations"
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.accent }]} onPress={handleAdd}>
              <Text style={styles.primaryBtnText}>Save record</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (view === 'detail' && selected) {
    const catLabel = categories.find(c => c.value === selected.category)?.label ?? selected.category;
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => setView('list')}>
              <Text style={[styles.backBtn, { color: theme.accent }]}>Back to records</Text>
            </TouchableOpacity>
            <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.badgeText, { color: theme.accent }]}>{catLabel}</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{selected.title}</Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {selected.date}{selected.provider ? ` · ${selected.provider}` : ''}
            </Text>
            {selected.notes && (
              <View style={[styles.notesBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.notesText, { color: theme.text }]}>{selected.notes}</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Medical Passport</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{records.length} records</Text>
            </View>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.accent }]} onPress={() => setView('add')}>
              <Text style={styles.primaryBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
            {[{ value: 'all', label: 'All' }, ...categories].map(c => (
              <TouchableOpacity
                key={c.value}
                style={[styles.filterChip, filter === c.value && { backgroundColor: theme.accent }]}
                onPress={() => setFilter(c.value)}
              >
                <Text style={[styles.filterText, filter === c.value ? { color: '#FFF' } : { color: theme.textSecondary }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {sorted.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No records yet.</Text>
            </View>
          ) : (
            sorted.map(rec => {
              const catLabel = categories.find(c => c.value === rec.category)?.label ?? rec.category;
              return (
                <TouchableOpacity
                  key={rec.id}
                  style={[styles.recordRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => openDetail(rec)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
                    <Text style={[styles.badgeText, { color: theme.accent }]}>{catLabel}</Text>
                  </View>
                  <Text style={[styles.recordTitle, { color: theme.text }]} numberOfLines={1}>{rec.title}</Text>
                  {rec.provider && <Text style={[styles.recordProvider, { color: theme.textSecondary }]} numberOfLines={1}>{rec.provider}</Text>}
                  <Text style={[styles.recordDate, { color: theme.textSecondary }]}>{rec.date}</Text>
                </TouchableOpacity>
              );
            })
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.four },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  backBtn: { fontSize: 15, fontWeight: '600', marginTop: Spacing.four, marginBottom: Spacing.three },
  filterBar: { marginTop: Spacing.three, marginBottom: Spacing.three },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  filterText: { fontSize: 13, fontWeight: '600' },
  recordRow: { padding: Spacing.three, borderRadius: 14, borderWidth: 1, marginBottom: Spacing.three },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  recordTitle: { fontSize: 16, fontWeight: '600' },
  recordProvider: { fontSize: 13, marginTop: 2 },
  recordDate: { fontSize: 12, marginTop: 4 },
  empty: { marginTop: Spacing.five, alignItems: 'center' },
  emptyText: { fontSize: 15 },
  label: { fontSize: 13, fontWeight: '600', marginTop: Spacing.three, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  primaryBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', marginTop: Spacing.four },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 14, marginTop: 4 },
  notesBox: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, marginTop: Spacing.four },
  notesText: { fontSize: 15, lineHeight: 22 },
});
