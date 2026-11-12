import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function ClinicMessagesScreen() {
  const theme = useTheme();
  const { user, clinicMessages, sendClinicMessage } = useDemo();
  const [text, setText] = useState('');
  if (!user) return null;

  const thread = clinicMessages
    .filter(m => m.patientId === (user.clinicRole === 'patient' ? user.id : clinicMessages[0]?.patientId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const patientId = user.clinicRole === 'patient' ? user.id : (clinicMessages[0]?.patientId ?? 'ivf-pat-1');

  function handleSend() {
    if (!text.trim()) return;
    sendClinicMessage(patientId, text);
    setText('');
  }

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { backgroundColor: '#f3e8ff' }]}>
          <Text style={[s.headerTitle, { color: theme.text }]}>💬 Μηνύματα</Text>
          <Text style={[s.headerSub, { color: theme.textSecondary }]}>Δρ. Κωστοπούλου</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
          <ScrollView contentContainerStyle={s.msgScroll} showsVerticalScrollIndicator={false}>
            {thread.map(msg => {
              const isMe = msg.fromRole === user.clinicRole;
              return (
                <View key={msg.id} style={[s.bubbleWrap, isMe ? s.bubbleRight : s.bubbleLeft]}>
                  <View style={[s.bubble, isMe ? [s.bubbleMe, { backgroundColor: '#7c3aed' }] : [s.bubbleOther, { backgroundColor: theme.card, borderColor: theme.border }]]}>
                    <Text style={[s.bubbleSender, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}>{msg.fromName}</Text>
                    <Text style={[s.bubbleText, { color: isMe ? '#fff' : theme.text }]}>{msg.text}</Text>
                    <Text style={[s.bubbleTime, { color: isMe ? 'rgba(255,255,255,0.5)' : theme.textSecondary }]}>{msg.createdAt.substring(11, 16)}</Text>
                  </View>
                </View>
              );
            })}
            <View style={{ height: 16 }} />
          </ScrollView>
          <View style={[s.inputRow, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Γράψτε μήνυμα…"
              placeholderTextColor={theme.textSecondary}
              style={[s.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              multiline
            />
            <TouchableOpacity style={s.sendBtn} onPress={handleSend} activeOpacity={0.8}>
              <Text style={s.sendBtnText}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  msgScroll: { paddingHorizontal: Spacing.four, paddingTop: 20, paddingBottom: 16 },
  bubbleWrap: { marginBottom: 10 },
  bubbleLeft: { alignItems: 'flex-start' },
  bubbleRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  bubbleMe: { borderRadius: 16, borderBottomRightRadius: 4 },
  bubbleOther: { borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleSender: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1 },
  input: { flex: 1, padding: 10, borderRadius: 20, borderWidth: 1, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
});
