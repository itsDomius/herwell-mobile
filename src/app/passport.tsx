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

const CARD_SHADOW = {
  shadowColor: '#1E1433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
};

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
      category: form.category as MedicalRecord['category'],
      title: form.title,
      date: form.date,
      provider: form.provider || undefined,
      notes: form.notes || undefined,
    });
    setForm({ category: 'blood_test', title: '', date: '', provider: '', notes: '' });
    setView('list');
  }

  if (view === 'add') {
    return (
      <View style={[s.root, { backgroundColor: theme.background }]}>
        <SafeAreaView style={s.safe}>
          <View style={[s.pageHeader, { backgroundColor: theme.accentSoft }]}>
            <TouchableOpacity onPress={() => setView('list')}>
              <Text style={[s.backBtn, { color: theme.accent }]}>← Back to records</Text>
            </TouchableOpacity>
            <Text style={[s.pageTitle, { color: theme.text }]}>Add record</Text>
          </View>
          <ScrollView contentContainerStyle={s.formScroll}>
            <View style={[s.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Category</Text>
              <View style={s.catGrid}>
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[s.catChip, form.category === c.value && { backgroundColor: theme.accent }]}
                    onPress={() => setForm({ ...form, category: c.value })}
                  >
                    <Text style={[s.catChipText, form.category === c.value ? { color: '#FFF' } : { color: theme.textSecondary }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Title *</Text>
              <TextInput style={[s.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={form.title} onChangeText={t => setForm({ ...form, title: t })}
                placeholder="e.g. Hormone Panel" placeholderTextColor={theme.textSecondary} />
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Date * (YYYY-MM-DD)</Text>
              <TextInput style={[s.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={form.date} onChangeText={t => setForm({ ...form, date: t })}
                placeholder="2026-11-01" placeholderTextColor={theme.textSecondary} />
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Provider</Text>
              <TextInput style={[s.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={form.provider} onChangeText={t => setForm({ ...form, provider: t })}
                placeholder="Athens Diagnostic Lab" placeholderTextColor={theme.textSecondary} />
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Notes</Text>
              <TextInput style={[s.input, s.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={form.notes} onChangeText={t => setForm({ ...form, notes: t })}
                multiline numberOfLines={4} placeholder="Results or observations" placeholderTextColor={theme.textSecondary} />
            </View>
            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: theme.accent }]} onPress={handleAdd} activeOpacity={0.8}>
              <Text style={s.primaryBtnText}>Save record</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (view === 'detail' && selected) {
    const catLabel = categories.find(c => c.value === selected.category)?.label ?? selected.category;
    return (
      <View style={[s.root, { backgroundColor: theme.background }]}>
        <SafeAreaView style={s.safe}>
          <View style={[s.pageHeader, { backgroundColor: theme.accentSoft }]}>
            <TouchableOpacity onPress={() => setView('list')}>
              <Text style={[s.backBtn, { color: theme.accent }]}>← Back to records</Text>
            </TouchableOpacity>
            <Text style={[s.pageTitle, { color: theme.text }]}>{selected.title}</Text>
          </View>
          <ScrollView contentContainerStyle={s.formScroll}>
            <View style={[s.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[s.chip, { backgroundColor: theme.accentSoft, alignSelf: 'flex-start' }]}>
                <Text style={[s.chipText, { color: theme.accent }]}>{catLabel}</Text>
              </View>
              <Text style={[s.detailDate, { color: theme.textSecondary }]}>
                {selected.date}{selected.provider ? ` · ${selected.provider}` : ''}
              </Text>
              {selected.notes && (
                <>
                  <View style={[s.divider, { backgroundColor: theme.border }]} />
                  <Text style={[s.notesText, { color: theme.text }]}>{selected.notes}</Text>
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe}>
        <View style={[s.pageHeader, { backgroundColor: theme.accentSoft }]}>
          <View style={s.headerRow}>
            <View>
              <Text style={[s.pageTitle, { color: theme.text }]}>Medical Passport</Text>
              <Text style={[s.pageSubtitle, { color: theme.textSecondary }]}>{records.length} records</Text>
            </View>
            <TouchableOpacity style={[s.addBtn, { backgroundColor: theme.accent }]} onPress={() => setView('add')} activeOpacity={0.8}>
              <Text style={s.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={s.filterBarContent}>
            {[{ value: 'all', label: 'All' }, ...categories].map(c => (
              <TouchableOpacity
                key={c.value}
                style={[s.filterChip, filter === c.value && { backgroundColor: theme.accent }]}
                onPress={() => setFilter(c.value)}
              >
                <Text style={[s.filterText, filter === c.value ? { color: '#FFF' } : { color: theme.textSecondary }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {sorted.length === 0 ? (
            <View style={s.empty}>
              <Text style={[s.emptyText, { color: theme.textSecondary }]}>No records yet — tap + Add to get started.</Text>
            </View>
          ) : (
            sorted.map(rec => {
              const catLabel = categories.find(c => c.value === rec.category)?.label ?? rec.category;
              return (
                <TouchableOpacity
                  key={rec.id}
                  style={[s.recordCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => { setSelectedId(rec.id); setView('detail'); }}
                  activeOpacity={0.75}
                >
                  <View style={s.recordTop}>
                    <View style={[s.chip, { backgroundColor: theme.accentSoft }]}>
                      <Text style={[s.chipText, { color: theme.accent }]}>{catLabel}</Text>
                    </View>
                    <Text style={[s.recordDate, { color: theme.textSecondary }]}>{rec.date}</Text>
                  </View>
                  <Text style={[s.recordTitle, { color: theme.text }]} numberOfLines={1}>{rec.title}</Text>
                  {rec.provider && <Text style={[s.recordProvider, { color: theme.textSecondary }]} numberOfLines={1}>{rec.provider}</Text>}
                </TouchableOpacity>
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
  pageHeader: { paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  backBtn: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  addBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  addBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  filterBar: { marginTop: 12 },
  filterBarContent: { gap: 8, paddingRight: 16 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(138,110,212,0.08)' },
  filterText: { fontSize: 13, fontWeight: '600' },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: 80 },
  recordCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10, ...CARD_SHADOW },
  recordTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  recordDate: { fontSize: 12 },
  recordTitle: { fontSize: 16, fontWeight: '700' },
  recordProvider: { fontSize: 13, marginTop: 3 },
  empty: { marginTop: 48, alignItems: 'center', paddingHorizontal: 24 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  // Form/detail
  formScroll: { padding: Spacing.four, paddingBottom: 80 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16, ...CARD_SHADOW },
  fieldLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 6 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(138,110,212,0.08)' },
  catChipText: { fontSize: 13, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  primaryBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  detailDate: { fontSize: 14, marginTop: 10 },
  divider: { height: 1, marginVertical: 14 },
  notesText: { fontSize: 15, lineHeight: 23 },
});
