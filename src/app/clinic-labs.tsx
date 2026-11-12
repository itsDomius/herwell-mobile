import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const CARD_SHADOW = { shadowColor: '#1E1433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 };

export default function ClinicLabsScreen() {
  const theme = useTheme();
  const { user, clinicLabs, addClinicLab, IVF_TODAY } = useDemo();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'blood_test' as 'blood_test' | 'ultrasound' | 'other', date: IVF_TODAY });
  if (!user) return null;

  const myLabs = clinicLabs.filter(l => l.patientId === user.id).sort((a, b) => b.date.localeCompare(a.date));

  function handleAdd() {
    if (!form.name.trim()) return;
    addClinicLab({ patientId: user!.id, ...form });
    setForm({ name: '', type: 'blood_test', date: IVF_TODAY });
    setShowForm(false);
  }

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { backgroundColor: '#f3e8ff' }]}>
          <View style={s.headerRow}>
            <View>
              <Text style={[s.headerTitle, { color: theme.text }]}>🧪 Εξετάσεις</Text>
              <Text style={[s.headerSub, { color: theme.textSecondary }]}>{myLabs.length} αρχεία</Text>
            </View>
            <TouchableOpacity style={[s.addBtn, { backgroundColor: '#7c3aed' }]} onPress={() => setShowForm(!showForm)} activeOpacity={0.8}>
              <Text style={s.addBtnText}>+ Αποστολή</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {showForm && (
            <View style={[s.formCard, { backgroundColor: theme.card, borderColor: theme.border, ...CARD_SHADOW }]}>
              <Text style={[s.formTitle, { color: theme.text }]}>Αποστολή εξέτασης</Text>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Τίτλος</Text>
              <TextInput
                value={form.name}
                onChangeText={t => setForm({ ...form, name: t })}
                placeholder="π.χ. Ορμονικό Ημέρα 7"
                placeholderTextColor={theme.textSecondary}
                style={[s.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              />
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Τύπος</Text>
              <View style={s.typeRow}>
                {(['blood_test', 'ultrasound', 'other'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[s.typeChip, form.type === t && { backgroundColor: '#7c3aed' }]}
                    onPress={() => setForm({ ...form, type: t })}
                  >
                    <Text style={[s.typeChipText, form.type === t ? { color: '#fff' } : { color: theme.textSecondary }]}>
                      {t === 'blood_test' ? '🩸 Αίμα' : t === 'ultrasound' ? '🔊 Υπερηχογράφημα' : '📄 Άλλο'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Ημερομηνία</Text>
              <TextInput
                value={form.date}
                onChangeText={t => setForm({ ...form, date: t })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                style={[s.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              />
              <View style={s.formBtns}>
                <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#7c3aed' }]} onPress={handleAdd} activeOpacity={0.8}>
                  <Text style={s.submitBtnText}>Αποστολή</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.cancelBtn, { backgroundColor: '#ede9fe' }]} onPress={() => setShowForm(false)} activeOpacity={0.8}>
                  <Text style={[s.cancelBtnText, { color: '#7c3aed' }]}>Ακύρωση</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {myLabs.map(lab => (
            <View key={lab.id} style={[s.labCard, { backgroundColor: theme.card, borderColor: !lab.reviewed ? '#fde047' : theme.border, ...CARD_SHADOW }]}>
              <View style={s.labTop}>
                <Text style={s.labIcon}>{lab.type === 'blood_test' ? '🩸' : lab.type === 'ultrasound' ? '🔊' : '📄'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.labName, { color: theme.text }]}>{lab.name}</Text>
                  <Text style={[s.labDate, { color: theme.textSecondary }]}>{lab.date}</Text>
                </View>
                {lab.reviewed
                  ? <View style={s.reviewedBadge}><Text style={s.reviewedText}>✓ Ελέγχθηκε</Text></View>
                  : <View style={s.pendingBadge}><Text style={s.pendingText}>⏳ Αναμονή</Text></View>}
              </View>
              {lab.doctorNote && (
                <View style={[s.noteBox, { backgroundColor: '#ede9fe' }]}>
                  <Text style={[s.noteLabel, { color: '#7c3aed' }]}>Σημείωση γιατρού:</Text>
                  <Text style={[s.noteText, { color: theme.text }]}>{lab.doctorNote}</Text>
                </View>
              )}
            </View>
          ))}

          {myLabs.length === 0 && !showForm && (
            <View style={s.empty}>
              <Text style={[s.emptyText, { color: theme.textSecondary }]}>Δεν έχουν αποσταλεί εξετάσεις ακόμα.</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 2 },
  addBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: 'rgba(124,58,237,0.08)' },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  submitBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 15 },
  labCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  labTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  labIcon: { fontSize: 24 },
  labName: { fontWeight: '700', fontSize: 15 },
  labDate: { fontSize: 12, marginTop: 2 },
  reviewedBadge: { backgroundColor: '#dcfce7', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  reviewedText: { color: '#16a34a', fontWeight: '700', fontSize: 11 },
  pendingBadge: { backgroundColor: '#fef9c3', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  pendingText: { color: '#d97706', fontWeight: '700', fontSize: 11 },
  noteBox: { marginTop: 10, padding: 12, borderRadius: 10 },
  noteLabel: { fontWeight: '700', fontSize: 12, marginBottom: 3 },
  noteText: { fontSize: 13, lineHeight: 19 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
