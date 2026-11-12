import { Animated, Easing, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDemo } from '@/contexts/DemoContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Spacing } from '@/constants/theme';

const SHADOW = { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 };

const TYPE_ICON: Record<string, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
  blood_test: 'water-outline',
  ultrasound: 'pulse-outline',
  other: 'document-text-outline',
};
const TYPE_LABEL: Record<string, string> = {
  blood_test: 'Blood Test',
  ultrasound: 'Ultrasound',
  other: 'Other',
};

function LabCard({ lab, colors, index }: { lab: any; colors: any; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 350, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [index]);

  const icon = TYPE_ICON[lab.type] ?? 'document-text-outline';
  const pending = !lab.reviewed;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: y }] }}>
      <View style={[
        s.labCard,
        { backgroundColor: colors.card, borderColor: pending ? colors.warning + '55' : colors.cardBorder, borderWidth: pending ? 1.5 : 1 },
        SHADOW,
      ]}>
        <View style={s.labTop}>
          <View style={[s.iconCircle, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name={icon} size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.labName, { color: colors.text }]}>{lab.name}</Text>
            <Text style={[s.labDate, { color: colors.textSecondary }]}>{lab.date}  {TYPE_LABEL[lab.type]}</Text>
          </View>
          {lab.reviewed ? (
            <View style={[s.badge, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={13} color={colors.success} />
              <Text style={[s.badgeText, { color: colors.success }]}>Reviewed</Text>
            </View>
          ) : (
            <View style={[s.badge, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="time-outline" size={13} color={colors.warning} />
              <Text style={[s.badgeText, { color: colors.warning }]}>Pending</Text>
            </View>
          )}
        </View>
        {lab.doctorNote ? (
          <View style={[s.noteBox, { backgroundColor: colors.accentSoft }]}>
            <View style={s.noteLabelRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={13} color={colors.accent} />
              <Text style={[s.noteLabel, { color: colors.accent }]}>Doctor note</Text>
            </View>
            <Text style={[s.noteText, { color: colors.text }]}>{lab.doctorNote}</Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default function ClinicLabsScreen() {
  const { colors } = useAppTheme();
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
    <AnimatedBackground>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { borderBottomColor: colors.cardBorder }]}>
          <Ionicons name="flask-outline" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[s.headerTitle, { color: colors.text }]}>Lab Files</Text>
            <Text style={[s.headerSub, { color: colors.textSecondary }]}>{myLabs.length} records</Text>
          </View>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: showForm ? colors.accentMid : colors.accent }]}
            onPress={() => setShowForm(!showForm)}
            activeOpacity={0.8}
          >
            <Ionicons name={showForm ? 'close' : 'add'} size={18} color="#fff" />
            <Text style={s.addBtnText}>{showForm ? 'Cancel' : 'Upload'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {showForm && (
            <View style={[s.formCard, { backgroundColor: colors.card, borderColor: colors.accent + '44' }, SHADOW]}>
              <View style={s.formTitleRow}>
                <Ionicons name="cloud-upload-outline" size={18} color={colors.accent} />
                <Text style={[s.formTitle, { color: colors.text }]}>Upload Lab File</Text>
              </View>

              <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>Title</Text>
              <TextInput
                value={form.name}
                onChangeText={t => setForm({ ...form, name: t })}
                placeholder="e.g. Day 7 Hormonal Panel"
                placeholderTextColor={colors.textSecondary}
                style={[s.input, { backgroundColor: colors.accentSoft, borderColor: colors.cardBorder, color: colors.text }]}
              />

              <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>Type</Text>
              <View style={s.typeRow}>
                {(['blood_test', 'ultrasound', 'other'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[s.typeChip, { backgroundColor: form.type === t ? colors.accent : colors.accentSoft }]}
                    onPress={() => setForm({ ...form, type: t })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={TYPE_ICON[t]} size={14} color={form.type === t ? '#fff' : colors.accent} />
                    <Text style={[s.typeChipText, { color: form.type === t ? '#fff' : colors.accent }]}>{TYPE_LABEL[t]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>Date</Text>
              <TextInput
                value={form.date}
                onChangeText={t => setForm({ ...form, date: t })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                style={[s.input, { backgroundColor: colors.accentSoft, borderColor: colors.cardBorder, color: colors.text }]}
              />

              <TouchableOpacity style={[s.submitBtn, { backgroundColor: colors.accent }]} onPress={handleAdd} activeOpacity={0.8}>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={s.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          {myLabs.length === 0 && !showForm ? (
            <View style={s.empty}>
              <Ionicons name="documents-outline" size={56} color={colors.accent + '50'} />
              <Text style={[s.emptyTitle, { color: colors.text }]}>No lab files yet</Text>
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>Upload your first result using the button above.</Text>
            </View>
          ) : (
            myLabs.map((lab, i) => <LabCard key={lab.id} lab={lab} colors={colors} index={i} />)
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
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  formCard: { borderRadius: 20, borderWidth: 1.5, padding: 20, marginBottom: 20 },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: '700' },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  labCard: { borderRadius: 20, padding: 16, marginBottom: 12 },
  labTop: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  labName: { fontWeight: '700', fontSize: 15 },
  labDate: { fontSize: 12, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontWeight: '700', fontSize: 11 },
  noteBox: { marginTop: 12, padding: 12, borderRadius: 12 },
  noteLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  noteLabel: { fontWeight: '700', fontSize: 12 },
  noteText: { fontSize: 13, lineHeight: 19 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
