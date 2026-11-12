import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useDemo();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Your reproductive health companion
          </Text>
        </View>

        <View style={[styles.banner, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.bannerText, { color: theme.accent }]}>
            Demonstration Prototype — All data is synthetic
          </Text>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>HerWell — General Health</Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.accent }]}
          onPress={() => signIn('elena@demo.herwell')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Elena Papadaki</Text>
          <Text style={styles.btnSub}>Reproductive health tracker</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.text, marginTop: 20 }]}>IVF Clinic Portal</Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#7c3aed' }]}
          onPress={() => signIn('doctor@ivf.demo')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>👩‍⚕️ Δρ. Αλ. Κωστοπούλου</Text>
          <Text style={styles.btnSub}>IVF Doctor — patient protocols</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#db2777' }]}
          onPress={() => signIn('patient@ivf.demo')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>🌸 Μαρία Παπαδοπούλου</Text>
          <Text style={styles.btnSub}>IVF Patient — today's schedule</Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
          Demo prototype · Synthetic data only · Not for clinical use
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.four, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: Spacing.five },
  logoImg: { width: 120, height: 120, marginBottom: Spacing.two },
  tagline: { fontSize: 16, marginTop: Spacing.two },
  banner: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    marginBottom: Spacing.five,
    alignItems: 'center',
  },
  bannerText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: Spacing.three },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: Spacing.four,
    borderRadius: 14,
    marginBottom: Spacing.three,
  },
  btnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  btnSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  disclaimer: { fontSize: 12, textAlign: 'center', marginTop: Spacing.four, lineHeight: 18 },
});
