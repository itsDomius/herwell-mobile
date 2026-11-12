import { Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDemo } from '@/contexts/DemoContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Spacing } from '@/constants/theme';

function MsgBubble({ msg, isMe, colors, index }: { msg: any; isMe: boolean; colors: any; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(isMe ? 20 : -20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay: index * 40, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(x, { toValue: 0, duration: 320, delay: index * 40, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[s.bubbleWrap, isMe ? s.bubbleRight : s.bubbleLeft, { opacity, transform: [{ translateX: x }] }]}>
      <View style={[
        s.bubble,
        isMe
          ? { backgroundColor: colors.accent, borderBottomRightRadius: 4 }
          : { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1, borderBottomLeftRadius: 4 },
      ]}>
        <Text style={[s.sender, { color: isMe ? 'rgba(255,255,255,0.65)' : colors.textSecondary }]}>{msg.fromName}</Text>
        <Text style={[s.msgText, { color: isMe ? '#fff' : colors.text }]}>{msg.text}</Text>
        <Text style={[s.time, { color: isMe ? 'rgba(255,255,255,0.45)' : colors.textSecondary }]}>{msg.createdAt.substring(11, 16)}</Text>
      </View>
    </Animated.View>
  );
}

export default function ClinicMessagesScreen() {
  const { colors } = useAppTheme();
  const { user, clinicMessages, sendClinicMessage } = useDemo();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  if (!user) return null;

  const patientId = user.clinicRole === 'patient' ? user.id : (clinicMessages[0]?.patientId ?? 'ivf-pat-1');
  const thread = clinicMessages.filter(m => m.patientId === patientId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  function handleSend() {
    if (!text.trim()) return;
    sendClinicMessage(patientId, text);
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { borderBottomColor: colors.cardBorder }]}>
          <Ionicons name="chatbubbles-outline" size={22} color={colors.accent} />
          <Text style={[s.headerTitle, { color: colors.text }]}>Messages</Text>
          <Text style={[s.headerSub, { color: colors.textSecondary }]}>Dr. Kostopoulou</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={s.msgScroll}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {thread.map((msg, i) => (
              <MsgBubble key={msg.id} msg={msg} isMe={msg.fromRole === user.clinicRole} colors={colors} index={i} />
            ))}
            <View style={{ height: 16 }} />
          </ScrollView>
          <View style={[s.inputRow, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message"
              placeholderTextColor={colors.textSecondary}
              style={[s.input, { backgroundColor: colors.accentSoft, color: colors.text }]}
              multiline
            />
            <TouchableOpacity
              style={[s.sendBtn, { backgroundColor: text.trim() ? colors.accent : colors.accentMid }]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!text.trim()}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.four, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1 },
  headerSub: { fontSize: 13 },
  msgScroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 16 },
  bubbleWrap: { marginBottom: 10 },
  bubbleLeft: { alignItems: 'flex-start' },
  bubbleRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 13, borderRadius: 18 },
  sender: { fontSize: 10, fontWeight: '700', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 },
  msgText: { fontSize: 15, lineHeight: 21 },
  time: { fontSize: 10, marginTop: 5, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1 },
  input: { flex: 1, padding: 12, borderRadius: 22, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
