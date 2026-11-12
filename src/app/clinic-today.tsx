import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDemo } from '@/contexts/DemoContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Spacing } from '@/constants/theme';

const SHADOW = { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 3 };

function DoseCard({ p, onConfirm, colors }: { p: any; onConfirm: () => void; colors: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.03, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    Animated.timing(checkAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(2)), useNativeDriver: true }).start();
    onConfirm();
  }

  const routeIcon = p.route === 'injection' ? 'medkit-outline' : p.route === 'oral' ? 'nutrition-outline' : 'flask-outline';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={[s.doseCard, {
        backgroundColor: colors.card,
        borderColor: p.critical ? colors.error + '55' : colors.cardBorder,
        borderWidth: p.critical ? 1.5 : 1,
      }, SHADOW]}>
        <View style={s.doseRow}>
          <View style={[s.iconCircle, { backgroundColor: p.critical ? colors.error + '18' : colors.accentSoft }]}>
            <Ionicons name={routeIcon as any} size={22} color={p.critical ? colors.error : colors.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={s.nameRow}>
              <Text style={[s.medName, { color: colors.text }]}>{p.medication}</Text>
              {p.critical && (
                <View style={[s.critBadge, { backgroundColor: colors.error + '18' }]}>
                  <Ionicons name="alert-circle" size={11} color={colors.error} />
                  <Text style={[s.critText, { color: colors.error }]}>CRITICAL</Text>
                </View>
              )}
            </View>
            <Text style={[s.doseMeta, { color: colors.textSecondary }]}>{p.dose}  {p.time}  {p.route}</Text>
            {p.notes ? <Text style={[s.noteText, { color: colors.warning }]}>{p.notes}</Text> : null}
          </View>
        </View>

        <TouchableOpacity
          style={[s.doneBtn, { backgroundColor: p.critical ? colors.error : colors.accent }]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={s.doneBtnText}>I took it</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function DoneCard({ p, colors }: { p: any; colors: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={[s.doseCard, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '33', borderWidth: 1 }]}>
        <View style={s.doseRow}>
          <View style={[s.iconCircle, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.medName, { color: colors.text }]}>{p.medication}</Text>
            <Text style={[s.doseMeta, { color: colors.textSecondary }]}>{p.dose}  {p.time}</Text>
          </View>
          <View style={[s.donePill, { backgroundColor: colors.success + '20' }]}>
            <Text style={[s.donePillText, { color: colors.success }]}>Done</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ClinicTodayScreen() {
  const { colors } = useAppTheme();
  const { user, clinicProtocols, clinicCompliance, clinicNotifications, confirmClinicDose, seenClinicNotif, IVF_TODAY, signOut } = useDemo();
  if (!user) return null;

  const myProtos = clinicProtocols
    .filter(p => p.patientId === user.id && p.date === IVF_TODAY)
    .sort((a, b) => a.time.localeCompare(b.time));

  const unseenNotifs = clinicNotifications.filter(n => n.patientId === user.id && !n.seenByPatient);
  const getStatus = (id: string) => clinicCompliance.find(c => c.protocolEntryId === id)?.status ?? 'pending';
  const done = myProtos.filter(p => getStatus(p.id) === 'done').length;
  const total = myProtos.length;
  const pct = total > 0 ? done / total : 0;

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { borderBottomColor: colors.cardBorder }]}>
          <View style={s.headerLeft}>
            <View style={[s.iconCircle, { backgroundColor: colors.accent + '25', marginRight: 10 }]}>
              <Ionicons name="today-outline" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={[s.headerTitle, { color: colors.text }]}>Today</Text>
              <Text style={[s.headerSub, { color: colors.textSecondary }]}>{done}/{total} completed</Text>
            </View>
          </View>
          <TouchableOpacity style={[s.signOutBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]} onPress={signOut}>
            <Ionicons name="log-out-outline" size={16} color={colors.textSecondary} />
            <Text style={[s.signOutText, { color: colors.textSecondary }]}>Out</Text>
          </TouchableOpacity>
        </View>

        {total > 0 && (
          <View style={[s.progressWrap, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <View style={[s.progressTrack, { backgroundColor: colors.accentMid }]}>
              <View style={[s.progressFill, { width: `${pct * 100}%` as any, backgroundColor: colors.accent }]} />
            </View>
          </View>
        )}

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {unseenNotifs.map(n => (
            <View key={n.id} style={[s.notifCard, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '50' }]}>
              <View style={s.notifTop}>
                <Ionicons name="notifications-outline" size={18} color={colors.warning} />
                <Text style={[s.notifTitle, { color: colors.text }]}>Plan Updated</Text>
              </View>
              <Text style={[s.notifText, { color: colors.textSecondary }]}>{n.details}</Text>
              <TouchableOpacity style={[s.seenBtn, { backgroundColor: colors.warning }]} onPress={() => seenClinicNotif(n.id)}>
                <Ionicons name="eye-outline" size={15} color="#fff" />
                <Text style={s.seenBtnText}>I saw it</Text>
              </TouchableOpacity>
            </View>
          ))}

          {myProtos.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.accent + '60'} />
              <Text style={[s.emptyTitle, { color: colors.text }]}>No doses today</Text>
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>Check back tomorrow.</Text>
            </View>
          ) : (
            myProtos.map(p => {
              const isDone = getStatus(p.id) === 'done';
              return isDone
                ? <DoneCard key={p.id} p={p} colors={colors} />
                : <DoseCard key={p.id} p={p} onConfirm={() => confirmClinicDose(p.id, user.id)} colors={colors} />;
            })
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: 14, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, marginTop: 1 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  signOutText: { fontSize: 13, fontWeight: '600' },
  progressWrap: { paddingHorizontal: Spacing.four, paddingVertical: 10, borderBottomWidth: 1 },
  progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  notifCard: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  notifTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  notifTitle: { fontWeight: '800', fontSize: 15 },
  notifText: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  seenBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 10, alignSelf: 'flex-start' },
  seenBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14 },
  doseCard: { borderRadius: 20, padding: 18, marginBottom: 14, gap: 14 },
  doseRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  medName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  critBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 6 },
  critText: { fontSize: 10, fontWeight: '800' },
  doseMeta: { fontSize: 13, marginTop: 3 },
  noteText: { fontSize: 12, marginTop: 3 },
  doneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14 },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  donePill: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  donePillText: { fontSize: 13, fontWeight: '700' },
});
