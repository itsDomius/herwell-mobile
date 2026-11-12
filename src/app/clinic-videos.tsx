import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemo, IVF_VIDEOS } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const CARD_SHADOW = { shadowColor: '#1E1433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 };

export default function ClinicVideosScreen() {
  const theme = useTheme();
  const { user, clinicProtocols } = useDemo();
  if (!user) return null;

  const usedVideoIds = [...new Set(clinicProtocols.filter(p => p.patientId === user.id && p.videoId).map(p => p.videoId!))];
  const myVideos = IVF_VIDEOS.filter(v => usedVideoIds.includes(v.id));

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { backgroundColor: '#f3e8ff' }]}>
          <Text style={[s.headerTitle, { color: theme.text }]}>▶️ Βιντεοθήκη</Text>
          <Text style={[s.headerSub, { color: theme.textSecondary }]}>Πώς να κάνετε τις ενέσεις</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {myVideos.length === 0 ? (
            <View style={s.empty}>
              <Text style={[s.emptyText, { color: theme.textSecondary }]}>Δεν έχουν ανατεθεί βίντεο ακόμα.</Text>
            </View>
          ) : (
            myVideos.map(v => (
              <View key={v.id} style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, ...CARD_SHADOW }]}>
                <View style={[s.thumb, { backgroundColor: '#7c3aed' }]}>
                  <Text style={s.thumbIcon}>▶️</Text>
                </View>
                <View style={s.info}>
                  <Text style={[s.title, { color: theme.text }]}>{v.title}</Text>
                  <Text style={[s.desc, { color: theme.textSecondary }]} numberOfLines={2}>{v.description}</Text>
                  <Text style={[s.meta, { color: theme.textSecondary }]}>⏱ {v.duration} · {v.medication}</Text>
                </View>
                <TouchableOpacity style={[s.watchBtn, { backgroundColor: '#ede9fe' }]} activeOpacity={0.7}>
                  <Text style={s.watchBtnText}>Watch →</Text>
                </TouchableOpacity>
              </View>
            ))
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
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 2 },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 15, textAlign: 'center' },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  thumb: { height: 100, alignItems: 'center', justifyContent: 'center' },
  thumbIcon: { fontSize: 40 },
  info: { padding: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, lineHeight: 19, marginBottom: 6 },
  meta: { fontSize: 12 },
  watchBtn: { marginHorizontal: 16, marginBottom: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  watchBtnText: { color: '#7c3aed', fontWeight: '700', fontSize: 15 },
});
