import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useDemo } from '@/contexts/DemoContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Spacing } from '@/constants/theme';

export function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn } = useDemo();

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.hero}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={s.logoImg}
            resizeMode="contain"
          />
          <Text style={[s.tagline, { color: colors.textSecondary }]}>
            Your reproductive health companion
          </Text>
        </View>

        <View style={[s.banner, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '30' }]}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.accent} />
          <Text style={[s.bannerText, { color: colors.accent }]}>
            Demonstration Prototype — All data is synthetic
          </Text>
        </View>

        <Text style={[s.label, { color: colors.textSecondary }]}>HerWell — General Health</Text>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: colors.accent }]}
          onPress={() => signIn('elena@demo.herwell')}
          activeOpacity={0.8}
        >
          <View style={s.btnInner}>
            <Ionicons name="person-circle-outline" size={22} color="rgba(255,255,255,0.8)" />
            <View>
              <Text style={s.btnText}>Elena Papadaki</Text>
              <Text style={s.btnSub}>Reproductive health tracker</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <Text style={[s.label, { color: colors.textSecondary, marginTop: 20 }]}>IVF Clinic Portal</Text>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: '#7c3aed' }]}
          onPress={() => signIn('doctor@ivf.demo')}
          activeOpacity={0.8}
        >
          <View style={s.btnInner}>
            <Ionicons name="medical-outline" size={22} color="rgba(255,255,255,0.8)" />
            <View>
              <Text style={s.btnText}>Dr. Al. Kostopoulou</Text>
              <Text style={s.btnSub}>IVF Doctor — patient protocols</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: '#db2777' }]}
          onPress={() => signIn('patient@ivf.demo')}
          activeOpacity={0.8}
        >
          <View style={s.btnInner}>
            <Ionicons name="person-outline" size={22} color="rgba(255,255,255,0.8)" />
            <View>
              <Text style={s.btnText}>Maria Papadopoulou</Text>
              <Text style={s.btnSub}>IVF Patient — today's schedule</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <Text style={[s.disclaimer, { color: colors.textSecondary }]}>
          Demo prototype · Synthetic data only · Not for clinical use
        </Text>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: Spacing.four, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: Spacing.five },
  logoImg: { width: 120, height: 120, marginBottom: Spacing.two },
  tagline: { fontSize: 16, marginTop: Spacing.two, textAlign: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: Spacing.five,
  },
  bannerText: { fontSize: 13, fontWeight: '600', flex: 1 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.three },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    borderRadius: 18,
    marginBottom: Spacing.three,
  },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  disclaimer: { fontSize: 12, textAlign: 'center', marginTop: Spacing.four, lineHeight: 18 },
});
