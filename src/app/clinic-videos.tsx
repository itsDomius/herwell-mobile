import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDemo, IVF_VIDEOS } from '@/contexts/DemoContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Spacing } from '@/constants/theme';

const SHADOW = { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 };

function VideoCard({ v, colors, index }: { v: any; colors: any; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 350, delay: index * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: y }] }}>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, SHADOW]}>
        <View style={[s.thumb, { backgroundColor: colors.accent }]}>
          <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
          <Text style={s.thumbDuration}>{v.duration}</Text>
        </View>
        <View style={s.info}>
          <View style={[s.medChip, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="medkit-outline" size={12} color={colors.accent} />
            <Text style={[s.medChipText, { color: colors.accent }]}>{v.medication}</Text>
          </View>
          <Text style={[s.title, { color: colors.text }]}>{v.title}</Text>
          <Text style={[s.desc, { color: colors.textSecondary }]} numberOfLines={2}>{v.description}</Text>
        </View>
        <TouchableOpacity style={[s.watchBtn, { borderTopColor: colors.cardBorder }]} activeOpacity={0.7}>
          <Ionicons name="play-outline" size={16} color={colors.accent} />
          <Text style={[s.watchBtnText, { color: colors.accent }]}>Watch tutorial</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function ClinicVideosScreen() {
  const { colors } = useAppTheme();
  const { user, clinicProtocols } = useDemo();
  if (!user) return null;

  const usedVideoIds = [...new Set(clinicProtocols.filter(p => p.patientId === user.id && p.videoId).map(p => p.videoId!))];
  const myVideos = IVF_VIDEOS.filter(v => usedVideoIds.includes(v.id));

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { borderBottomColor: colors.cardBorder }]}>
          <Ionicons name="play-circle-outline" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[s.headerTitle, { color: colors.text }]}>Video Library</Text>
            <Text style={[s.headerSub, { color: colors.textSecondary }]}>{myVideos.length} injection tutorials</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {myVideos.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="videocam-off-outline" size={56} color={colors.accent + '50'} />
              <Text style={[s.emptyTitle, { color: colors.text }]}>No videos yet</Text>
              <Text style={[s.emptyText, { color: colors.textSecondary }]}>Videos assigned to your protocol will appear here.</Text>
            </View>
          ) : (
            myVideos.map((v, i) => <VideoCard key={v.id} v={v} colors={colors} index={i} />)
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
  scroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 80 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  thumb: { height: 110, alignItems: 'center', justifyContent: 'center' },
  thumbDuration: { position: 'absolute', bottom: 8, right: 12, color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  info: { padding: 16, gap: 6 },
  medChip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  medChipText: { fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13, lineHeight: 19 },
  watchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderTopWidth: 1 },
  watchBtnText: { fontWeight: '700', fontSize: 15 },
});
