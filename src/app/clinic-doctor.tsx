import { Animated, Easing, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDemo, IVF_PATIENTS, type ClinicPatientRecord } from '@/contexts/DemoContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Spacing } from '@/constants/theme';

const SHADOW = { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 };

const STATUS_COLOR_MAP = (c: any): Record<string, string> => ({
  done: c.success, pending: c.warning, late: c.warning, missed: c.error,
});
const STATUS_ICON: Record<string, any> = {
  done: 'checkmark-circle', pending: 'time-outline', late: 'warning-outline', missed: 'close-circle',
};
const ROUTE_ICON: Record<string, any> = {
  injection: 'medkit-outline', oral: 'nutrition-outline', topical: 'flask-outline',
};

function patientStatus(patientId: string, compliance: ReturnType<typeof useDemo>['clinicCompliance'], today: string) {
  const todayComp = compliance.filter(c => c.patientId === patientId && c.date === today);
  if (!todayComp.length) return 'pending';
  if (todayComp.some(c => c.status === 'missed')) return 'missed';
  if (todayComp.some(c => c.status === 'late')) return 'late';
  if (todayComp.every(c => c.status === 'done')) return 'done';
  return 'pending';
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 320, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [delay]);
  return <Animated.View style={{ opacity, transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

type PatientFolder = { patient: ClinicPatientRecord; tab: 'protocol' | 'today' | 'messages' | 'labs' } | null;

export default function ClinicDoctorScreen() {
  const { colors } = useAppTheme();
  const { user, clinicProtocols, clinicCompliance, clinicMessages, clinicLabs, reviewClinicLab, sendClinicMessage, IVF_TODAY, signOut } = useDemo();
  const [folder, setFolder] = useState<PatientFolder>(null);
  const [msgText, setMsgText] = useState('');
  const [reviewing, setReviewing] = useState<{ id: string; note: string } | null>(null);
  const statusColors = STATUS_COLOR_MAP(colors);

  if (!user) return null;

  if (folder) {
    const { patient, tab } = folder;
    const protos = clinicProtocols.filter(p => p.patientId === patient.id).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const todayProtos = protos.filter(p => p.date === IVF_TODAY);
    const messages = clinicMessages.filter(m => m.patientId === patient.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const labs = clinicLabs.filter(l => l.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date));
    const tabs = ['protocol', 'today', 'messages', 'labs'] as const;
    const tabLabel = { protocol: 'Protocol', today: 'Today', messages: 'Chat', labs: 'Labs' };

    return (
      <AnimatedBackground>
        <SafeAreaView style={s.safe} edges={['top']}>
          <View style={[s.header, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setFolder(null)} style={s.backBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color={colors.accent} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[s.headerTitle, { color: colors.text }]}>{patient.name}</Text>
              <Text style={[s.headerSub, { color: colors.textSecondary }]}>DOB: {patient.dob}</Text>
            </View>
          </View>

          <View style={[s.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            {tabs.map(t => (
              <TouchableOpacity key={t} onPress={() => setFolder({ patient, tab: t })} style={[s.tabBtn, tab === t && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]} activeOpacity={0.7}>
                <Text style={[s.tabText, { color: tab === t ? colors.accent : colors.textSecondary }]}>{tabLabel[t]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {tab === 'protocol' && protos.map((p, i) => (
              <FadeIn key={p.id} delay={i * 40}>
                <View style={[s.row, { backgroundColor: colors.card, borderColor: p.critical ? colors.error + '55' : colors.cardBorder }, SHADOW]}>
                  <View style={[s.iconCircle, { backgroundColor: p.critical ? colors.error + '18' : colors.accentSoft }]}>
                    <Ionicons name={ROUTE_ICON[p.route] ?? 'medkit-outline'} size={18} color={p.critical ? colors.error : colors.accent} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[s.rowTitle, { color: colors.text }]}>{p.medication}  {p.dose}</Text>
                    <Text style={[s.rowSub, { color: colors.textSecondary }]}>{p.date}  {p.time}</Text>
                  </View>
                  {p.critical && (
                    <View style={[s.critBadge, { backgroundColor: colors.error + '18' }]}>
                      <Text style={[s.critBadgeText, { color: colors.error }]}>CRIT</Text>
                    </View>
                  )}
                </View>
              </FadeIn>
            ))}

            {tab === 'today' && todayProtos.map((p, i) => {
              const cl = clinicCompliance.find(c => c.protocolEntryId === p.id);
              const status = cl?.status ?? 'pending';
              const sc = statusColors[status];
              return (
                <FadeIn key={p.id} delay={i * 40}>
                  <View style={[s.row, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOW]}>
                    <View style={[s.iconCircle, { backgroundColor: colors.accentSoft }]}>
                      <Ionicons name={ROUTE_ICON[p.route] ?? 'medkit-outline'} size={18} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[s.rowTitle, { color: colors.text }]}>{p.medication}  {p.dose}</Text>
                      <Text style={[s.rowSub, { color: colors.textSecondary }]}>{p.time}</Text>
                    </View>
                    <View style={[s.statusChip, { backgroundColor: sc + '20' }]}>
                      <Ionicons name={STATUS_ICON[status]} size={18} color={sc} />
                    </View>
                  </View>
                </FadeIn>
              );
            })}

            {tab === 'messages' && (
              <>
                {messages.map((msg, i) => {
                  const isDoctor = msg.fromRole === 'doctor';
                  return (
                    <FadeIn key={msg.id} delay={i * 30}>
                      <View style={[s.bubbleWrap, isDoctor ? s.bubbleRight : s.bubbleLeft]}>
                        <View style={[
                          s.bubble,
                          isDoctor
                            ? { backgroundColor: colors.accent }
                            : { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 },
                        ]}>
                          <Text style={[s.bubbleText, { color: isDoctor ? '#fff' : colors.text }]}>{msg.text}</Text>
                          <Text style={[s.bubbleTime, { color: isDoctor ? 'rgba(255,255,255,0.5)' : colors.textSecondary }]}>{msg.createdAt.substring(11, 16)}</Text>
                        </View>
                      </View>
                    </FadeIn>
                  );
                })}
                <View style={[s.msgInputRow, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
                  <TextInput
                    value={msgText}
                    onChangeText={setMsgText}
                    placeholder="Reply to patient..."
                    placeholderTextColor={colors.textSecondary}
                    style={[s.msgInput, { backgroundColor: colors.accentSoft, color: colors.text }]}
                    multiline
                  />
                  <TouchableOpacity
                    style={[s.sendBtn, { backgroundColor: msgText.trim() ? colors.accent : colors.accentMid }]}
                    onPress={() => { if (msgText.trim()) { sendClinicMessage(patient.id, msgText); setMsgText(''); } }}
                    disabled={!msgText.trim()}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="arrow-up" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {tab === 'labs' && labs.map((lab, i) => (
              <FadeIn key={lab.id} delay={i * 50}>
                <View style={[
                  s.labCard,
                  { backgroundColor: !lab.reviewed ? colors.warning + '10' : colors.card, borderColor: !lab.reviewed ? colors.warning + '55' : colors.cardBorder },
                  SHADOW,
                ]}>
                  <View style={s.labTop}>
                    <View style={[s.iconCircle, { backgroundColor: colors.accentSoft }]}>
                      <Ionicons name={lab.type === 'blood_test' ? 'water-outline' : lab.type === 'ultrasound' ? 'pulse-outline' : 'document-text-outline'} size={18} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[s.rowTitle, { color: colors.text }]}>{lab.name}</Text>
                      <Text style={[s.rowSub, { color: colors.textSecondary }]}>{lab.date}</Text>
                      {lab.doctorNote && <Text style={[s.rowSub, { color: colors.accent, marginTop: 3 }]}>{lab.doctorNote}</Text>}
                    </View>
                    {!lab.reviewed && reviewing?.id !== lab.id && (
                      <TouchableOpacity style={[s.reviewBtn, { backgroundColor: colors.accent }]} onPress={() => setReviewing({ id: lab.id, note: '' })} activeOpacity={0.8}>
                        <Text style={s.reviewBtnText}>Review</Text>
                      </TouchableOpacity>
                    )}
                    {lab.reviewed && (
                      <View style={[s.reviewedBadge, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                        <Text style={[s.reviewedText, { color: colors.success }]}>Done</Text>
                      </View>
                    )}
                  </View>
                  {reviewing?.id === lab.id && (
                    <TouchableOpacity
                      style={[s.confirmBtn, { backgroundColor: colors.accent }]}
                      onPress={() => { reviewClinicLab(lab.id, reviewing.note || 'Reviewed'); setReviewing(null); }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={s.confirmBtnText}>Confirm review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </FadeIn>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { borderBottomColor: colors.cardBorder }]}>
          <Ionicons name="people-outline" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[s.headerTitle, { color: colors.text }]}>Patients</Text>
            <Text style={[s.headerSub, { color: colors.textSecondary }]}>{IVF_PATIENTS.length} active  {IVF_TODAY}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={[s.signOutBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={15} color={colors.textSecondary} />
            <Text style={[s.signOutText, { color: colors.textSecondary }]}>Out</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {IVF_PATIENTS.map((p, i) => {
            const status = patientStatus(p.id, clinicCompliance, IVF_TODAY);
            const todayCount = clinicProtocols.filter(c => c.patientId === p.id && c.date === IVF_TODAY).length;
            const doneCount = clinicCompliance.filter(c => c.patientId === p.id && c.date === IVF_TODAY && c.status === 'done').length;
            const sc = statusColors[status];
            return (
              <FadeIn key={p.id} delay={i * 60}>
                <TouchableOpacity
                  style={[s.patientCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOW]}
                  onPress={() => setFolder({ patient: p, tab: 'today' })}
                  activeOpacity={0.75}
                >
                  <View style={[s.patientAvatar, { backgroundColor: sc + '18' }]}>
                    <Ionicons name="person" size={22} color={sc} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[s.patientName, { color: colors.text }]}>{p.name}</Text>
                    <Text style={[s.patientMeta, { color: colors.textSecondary }]}>Today: {doneCount}/{todayCount} doses</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[s.statusDot, { backgroundColor: sc }]} />
                    <Text style={[s.statusLabel, { color: sc }]}>{status}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </FadeIn>
            );
          })}
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
  backBtn: { padding: 2, marginRight: 2 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  signOutText: { fontSize: 13, fontWeight: '600' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 12, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  patientCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  patientAvatar: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 16, fontWeight: '700' },
  patientMeta: { fontSize: 13, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  critBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  critBadgeText: { fontSize: 10, fontWeight: '800' },
  statusChip: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  bubbleWrap: { marginBottom: 10 },
  bubbleLeft: { alignItems: 'flex-start' },
  bubbleRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 13, borderRadius: 18 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 3 },
  msgInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1, marginTop: 8 },
  msgInput: { flex: 1, padding: 12, borderRadius: 22, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  labCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  labTop: { flexDirection: 'row', alignItems: 'center' },
  reviewBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 10 },
  reviewBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  reviewedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  reviewedText: { fontSize: 11, fontWeight: '700' },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
