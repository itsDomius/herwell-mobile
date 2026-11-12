import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useDemo, IVF_PATIENTS, type ClinicPatientRecord } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const STATUS_COLOR: Record<string, string> = {
  done: '#22c55e', pending: '#f59e0b', late: '#f97316', missed: '#ef4444',
};
const CARD_SHADOW = { shadowColor: '#1E1433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 };

function patientStatus(patientId: string, compliance: ReturnType<typeof useDemo>['clinicCompliance'], today: string) {
  const todayComp = compliance.filter(c => c.patientId === patientId && c.date === today);
  if (!todayComp.length) return 'pending';
  if (todayComp.some(c => c.status === 'missed')) return 'missed';
  if (todayComp.some(c => c.status === 'late')) return 'late';
  if (todayComp.every(c => c.status === 'done')) return 'done';
  return 'pending';
}

type Folder = { patient: ClinicPatientRecord; tab: 'protocol' | 'today' | 'messages' | 'labs' } | null;

export default function ClinicDoctorScreen() {
  const theme = useTheme();
  const { user, clinicProtocols, clinicCompliance, clinicMessages, clinicLabs, reviewClinicLab, sendClinicMessage, IVF_TODAY, signOut } = useDemo();
  const [folder, setFolder] = useState<Folder>(null);
  const [msgText, setMsgText] = useState('');
  const [reviewing, setReviewing] = useState<{ id: string; note: string } | null>(null);

  if (!user) return null;

  if (folder) {
    const { patient, tab } = folder;
    const protos = clinicProtocols.filter(p => p.patientId === patient.id).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const todayProtos = protos.filter(p => p.date === IVF_TODAY);
    const messages = clinicMessages.filter(m => m.patientId === patient.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const labs = clinicLabs.filter(l => l.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date));
    const tabs = ['protocol', 'today', 'messages', 'labs'] as const;

    return (
      <View style={[s.root, { backgroundColor: theme.background }]}>
        <SafeAreaView style={s.safe} edges={['top']}>
          <View style={[s.header, { backgroundColor: '#f3e8ff' }]}>
            <TouchableOpacity onPress={() => setFolder(null)}>
              <Text style={[s.backBtn, { color: '#7c3aed' }]}>← Πίσω</Text>
            </TouchableOpacity>
            <Text style={[s.headerTitle, { color: theme.text }]}>{patient.name}</Text>
            <Text style={[s.headerSub, { color: theme.textSecondary }]}>DOB: {patient.dob}</Text>
          </View>
          <View style={[s.tabRow, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            {tabs.map(t => (
              <TouchableOpacity key={t} onPress={() => setFolder({ patient, tab: t })} style={[s.tabBtn, tab === t && { borderBottomColor: '#7c3aed', borderBottomWidth: 2 }]}>
                <Text style={[s.tabText, { color: tab === t ? '#7c3aed' : theme.textSecondary }]}>
                  {t === 'protocol' ? 'Πρωτόκολλο' : t === 'today' ? 'Σήμερα' : t === 'messages' ? 'Chat' : 'Εξετάσεις'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {tab === 'protocol' && protos.map(p => (
              <View key={p.id} style={[s.row, { backgroundColor: theme.card, borderColor: p.critical ? '#fecaca' : theme.border }]}>
                <Text style={s.rowIcon}>{p.route === 'injection' ? '💉' : p.route === 'oral' ? '💊' : '🔵'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.rowTitle, { color: theme.text }]}>{p.medication} {p.dose}</Text>
                  <Text style={[s.rowSub, { color: theme.textSecondary }]}>{p.date} · {p.time}</Text>
                </View>
                {p.critical && <View style={s.critBadge}><Text style={s.critBadgeText}>CRIT</Text></View>}
              </View>
            ))}
            {tab === 'today' && todayProtos.map(p => {
              const cl = clinicCompliance.find(c => c.protocolEntryId === p.id);
              const status = cl?.status ?? 'pending';
              return (
                <View key={p.id} style={[s.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={s.rowIcon}>{p.route === 'injection' ? '💉' : p.route === 'oral' ? '💊' : '🔵'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowTitle, { color: theme.text }]}>{p.medication} {p.dose}</Text>
                    <Text style={[s.rowSub, { color: theme.textSecondary }]}>{p.time}</Text>
                  </View>
                  <View style={[s.statusChip, { backgroundColor: `${STATUS_COLOR[status]}20` }]}>
                    <Text style={[s.statusText, { color: STATUS_COLOR[status] }]}>
                      {status === 'done' ? '✓' : status === 'pending' ? '⏳' : status === 'late' ? '⚠' : '✗'}
                    </Text>
                  </View>
                </View>
              );
            })}
            {tab === 'messages' && (
              <>
                {messages.map(msg => {
                  const isDoctor = msg.fromRole === 'doctor';
                  return (
                    <View key={msg.id} style={[s.bubbleWrap, isDoctor ? s.bubbleRight : s.bubbleLeft]}>
                      <View style={[s.bubble, isDoctor ? { backgroundColor: '#7c3aed' } : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                        <Text style={[s.bubbleText, { color: isDoctor ? '#fff' : theme.text }]}>{msg.text}</Text>
                        <Text style={[s.bubbleTime, { color: isDoctor ? 'rgba(255,255,255,0.5)' : theme.textSecondary }]}>{msg.createdAt.substring(11, 16)}</Text>
                      </View>
                    </View>
                  );
                })}
                <View style={[s.msgInputRow, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                  <TouchableOpacity
                    style={[s.sendRow]}
                    onPress={() => { if (msgText.trim()) { sendClinicMessage(patient.id, msgText); setMsgText(''); } }}
                  />
                </View>
              </>
            )}
            {tab === 'labs' && labs.map(lab => (
              <View key={lab.id} style={[s.labCard, { backgroundColor: !lab.reviewed ? '#fefce8' : theme.card, borderColor: !lab.reviewed ? '#fde047' : theme.border }]}>
                <View style={s.labTop}>
                  <Text style={s.rowIcon}>{lab.type === 'blood_test' ? '🩸' : lab.type === 'ultrasound' ? '🔊' : '📄'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowTitle, { color: theme.text }]}>{lab.name}</Text>
                    <Text style={[s.rowSub, { color: theme.textSecondary }]}>{lab.date}</Text>
                    {lab.doctorNote && <Text style={[s.noteText, { color: '#7c3aed' }]}>📝 {lab.doctorNote}</Text>}
                  </View>
                  {!lab.reviewed && reviewing?.id !== lab.id && (
                    <TouchableOpacity style={s.reviewBtn} onPress={() => setReviewing({ id: lab.id, note: '' })}>
                      <Text style={s.reviewBtnText}>Έλεγχος</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {reviewing?.id === lab.id && (
                  <View style={s.reviewForm}>
                    <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#7c3aed' }]} onPress={() => { reviewClinicLab(lab.id, reviewing.note || 'Reviewed'); setReviewing(null); }} activeOpacity={0.8}>
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Επιβεβαίωση ελέγχου</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { backgroundColor: '#f3e8ff' }]}>
          <View style={s.headerRow}>
            <View>
              <Text style={[s.headerTitle, { color: theme.text }]}>👩‍⚕️ Ασθενείς</Text>
              <Text style={[s.headerSub, { color: theme.textSecondary }]}>{IVF_PATIENTS.length} ενεργοί · {IVF_TODAY}</Text>
            </View>
            <TouchableOpacity onPress={signOut} style={[s.signOutBtn, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Text style={[s.signOutText, { color: theme.textSecondary }]}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {IVF_PATIENTS.map(p => {
            const status = patientStatus(p.id, clinicCompliance, IVF_TODAY);
            const todayCount = clinicCompliance.filter(c => c.patientId === p.id && c.date === IVF_TODAY).length;
            const doneCount = clinicCompliance.filter(c => c.patientId === p.id && c.date === IVF_TODAY && c.status === 'done').length;
            return (
              <TouchableOpacity key={p.id} style={[s.patientCard, { backgroundColor: theme.card, borderColor: theme.border, ...CARD_SHADOW }]} onPress={() => setFolder({ patient: p, tab: 'today' })} activeOpacity={0.75}>
                <View style={[s.patientAvatar, { backgroundColor: `${STATUS_COLOR[status]}20` }]}>
                  <Text style={{ fontSize: 22 }}>🌸</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.patientName, { color: theme.text }]}>{p.name}</Text>
                  <Text style={[s.patientMeta, { color: theme.textSecondary }]}>Σήμερα: {doneCount}/{todayCount} δόσεις</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[status] }]} />
                  <Text style={[s.statusLabel, { color: STATUS_COLOR[status] }]}>{status}</Text>
                </View>
                <Text style={[s.arrow, { color: theme.textSecondary }]}>›</Text>
              </TouchableOpacity>
            );
          })}
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
  backBtn: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  signOutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  signOutText: { fontSize: 12, fontWeight: '600' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 12, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  patientCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  patientAvatar: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 16, fontWeight: '700' },
  patientMeta: { fontSize: 13, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  arrow: { fontSize: 20, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  rowIcon: { fontSize: 20 },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  critBadge: { backgroundColor: '#fee2e2', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
  critBadgeText: { color: '#ef4444', fontSize: 10, fontWeight: '800' },
  statusChip: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontSize: 14, fontWeight: '700' },
  bubbleWrap: { marginBottom: 10 },
  bubbleLeft: { alignItems: 'flex-start' },
  bubbleRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 14 },
  bubbleText: { fontSize: 14 },
  bubbleTime: { fontSize: 10, marginTop: 3 },
  msgInputRow: { borderTopWidth: 1, padding: 12 },
  sendRow: {},
  labCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 10 },
  labTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  noteText: { fontSize: 12, marginTop: 4 },
  reviewBtn: { backgroundColor: '#7c3aed', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  reviewBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  reviewForm: { marginTop: 10 },
  submitBtn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
});
