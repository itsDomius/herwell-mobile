import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useDemo } from '@/contexts/DemoContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Spacing } from '@/constants/theme';

const SHADOW = { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 };

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOW]}>
        {children}
      </View>
    </View>
  );
}

function Row({ label, sublabel, left, right, colors, last = false }: { label: string; sublabel?: string; left?: React.ReactNode; right?: React.ReactNode; colors: any; last?: boolean }) {
  return (
    <View style={[s.row, { borderBottomColor: colors.cardBorder, borderBottomWidth: last ? 0 : 1 }]}>
      {left && <View style={s.rowLeft}>{left}</View>}
      <View style={{ flex: 1, marginLeft: left ? 10 : 0 }}>
        <Text style={[s.rowLabel, { color: colors.text }]}>{label}</Text>
        {sublabel ? <Text style={[s.rowSub, { color: colors.textSecondary }]}>{sublabel}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, appTheme, toggleTheme, setTheme } = useAppTheme();
  const isDark = appTheme === 'dark';
  const { user, signOut } = useDemo();

  const roleLabel = !user ? 'Not signed in'
    : user.mode === 'clinic' ? (user.clinicRole === 'doctor' ? 'IVF Doctor' : 'IVF Patient')
    : 'General Health';

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { borderBottomColor: colors.cardBorder }]}>
          <Ionicons name="settings-outline" size={22} color={colors.accent} />
          <Text style={[s.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Section title="APPEARANCE" colors={colors}>
            <Row
              label="Dark Mode"
              sublabel={isDark ? 'Dark theme active' : 'Light theme active'}
              colors={colors}
              left={<View style={[s.iconCircle, { backgroundColor: colors.accentSoft }]}><Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.accent} /></View>}
              right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.accentMid, true: colors.accent }} thumbColor="#fff" />}
              last
            />
          </Section>

          <Section title="THEME" colors={colors}>
            <TouchableOpacity onPress={() => setTheme('light')} activeOpacity={0.7}>
              <Row
                label="Light"
                sublabel="Purple on white"
                colors={colors}
                left={<View style={[s.iconCircle, { backgroundColor: '#F5F3FF' }]}><Ionicons name="sunny-outline" size={18} color="#8B5CF6" /></View>}
                right={!isDark ? <Ionicons name="checkmark-circle" size={22} color={colors.accent} /> : <View style={[s.checkCircleOff, { borderColor: colors.cardBorder }]} />}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTheme('dark')} activeOpacity={0.7}>
              <Row
                label="Dark"
                sublabel="Purple on deep violet"
                colors={colors}
                left={<View style={[s.iconCircle, { backgroundColor: '#1C1535' }]}><Ionicons name="moon-outline" size={18} color="#A78BFA" /></View>}
                right={isDark ? <Ionicons name="checkmark-circle" size={22} color={colors.accent} /> : <View style={[s.checkCircleOff, { borderColor: colors.cardBorder }]} />}
                last
              />
            </TouchableOpacity>
          </Section>

          {user && (
            <Section title="ACCOUNT" colors={colors}>
              <Row
                label={user.name}
                sublabel={roleLabel}
                colors={colors}
                left={<View style={[s.iconCircle, { backgroundColor: colors.accentSoft }]}><Ionicons name="person-circle-outline" size={18} color={colors.accent} /></View>}
                last
              />
            </Section>
          )}

          {user && (
            <Section title="SESSION" colors={colors}>
              <TouchableOpacity onPress={signOut} activeOpacity={0.7}>
                <Row
                  label="Sign out"
                  sublabel={`Signed in as ${user.email}`}
                  colors={colors}
                  left={<View style={[s.iconCircle, { backgroundColor: colors.error + '18' }]}><Ionicons name="log-out-outline" size={18} color={colors.error} /></View>}
                  right={<Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
                  last
                />
              </TouchableOpacity>
            </Section>
          )}

          <View style={[s.footer, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.accent} />
            <Text style={[s.footerText, { color: colors.textSecondary }]}>Demo prototype · Synthetic data only</Text>
          </View>

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
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 },
  sectionCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  rowLeft: {},
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  checkCircleOff: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginBottom: 8 },
  footerText: { fontSize: 13 },
});
