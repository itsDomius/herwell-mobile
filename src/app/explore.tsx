import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDemo } from '@/contexts/DemoContext';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type Section = 'education' | 'prep' | 'pricing';

const articleCategories = [
  { value: 'all', label: 'All' },
  { value: 'endometriosis', label: 'Endometriosis' },
  { value: 'pcos', label: 'PCOS' },
  { value: 'tests', label: 'Tests' },
  { value: 'ovulation', label: 'Ovulation' },
  { value: 'treatment', label: 'Treatment' },
];

const plans = [
  { id: 'free' as const, name: 'Free', price: '$0', features: ['Up to 5 records', 'Basic symptom tracking', 'Education articles'], locked: ['Trend charts', 'Doctor sharing'] },
  { id: 'premium' as const, name: 'Premium', price: '$9.99/mo', features: ['Unlimited records', 'Full tracker with trends', 'Share with doctors', 'Export health summary'], locked: [], featured: true },
  { id: 'doctor' as const, name: 'Doctor', price: '$29.99/mo', features: ['Doctor dashboard', 'Receive patient shares', 'Verified badge', 'Analytics'], locked: [] },
];

export default function ExploreScreen() {
  const theme = useTheme();
  const { articles, appointments, glossaryTerms, prepQuestions, selectedPlan, setPlan } = useDemo();
  const [section, setSection] = useState<Section>('education');
  const [artFilter, setArtFilter] = useState('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const filteredArticles = artFilter === 'all' ? articles : articles.filter(a => a.category === artFilter);
  const selectedArticle = articles.find(a => a.id === selectedArticleId);
  const upcoming = appointments.filter(a => new Date(a.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date));
  const selectedApt = appointments.find(a => a.id === selectedAptId);
  const aptQuestions = selectedApt ? prepQuestions.filter(q => q.appointmentType === selectedApt.type) : [];

  function toggle(id: string) {
    setChecked(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  if (selectedArticle) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => setSelectedArticleId(null)}>
              <Text style={[styles.backBtn, { color: theme.accent }]}>Back to articles</Text>
            </TouchableOpacity>
            <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.badgeText, { color: theme.accent }]}>{selectedArticle.category}</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{selectedArticle.title}</Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              By {selectedArticle.author} · {selectedArticle.readTimeMinutes} min read
            </Text>
            <Text style={[styles.body, { color: theme.text }]}>{selectedArticle.body}</Text>
            <View style={[styles.disclaimer, { backgroundColor: theme.terracottaSoft }]}>
              <Text style={[styles.disclaimerText, { color: theme.terracotta }]}>
                Educational purposes only — not medical advice. Demonstration content with synthetic data.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.text }]}>Learn & Prepare</Text>

          <View style={styles.sectionTabs}>
            {([['education', 'Education'], ['prep', 'Appt Prep'], ['pricing', 'Plans']] as [Section, string][]).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.sectionTab, section === key && { backgroundColor: theme.accent }]}
                onPress={() => setSection(key)}
              >
                <Text style={[styles.sectionTabText, section === key ? { color: '#FFF' } : { color: theme.textSecondary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {section === 'education' && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                {articleCategories.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.filterChip, artFilter === c.value && { backgroundColor: theme.accent }]}
                    onPress={() => setArtFilter(c.value)}
                  >
                    <Text style={[styles.filterText, artFilter === c.value ? { color: '#FFF' } : { color: theme.textSecondary }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {filteredArticles.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setSelectedArticleId(a.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
                    <Text style={[styles.badgeText, { color: theme.accent }]}>{a.category}</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{a.title}</Text>
                  <Text style={[styles.cardSummary, { color: theme.textSecondary }]} numberOfLines={2}>{a.summary}</Text>
                  <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>{a.readTimeMinutes} min read</Text>
                </TouchableOpacity>
              ))}
              <View style={[styles.disclaimer, { backgroundColor: theme.terracottaSoft }]}>
                <Text style={[styles.disclaimerText, { color: theme.terracotta }]}>
                  All articles are for educational purposes only. Demonstration prototype with synthetic content.
                </Text>
              </View>
            </>
          )}

          {section === 'prep' && !selectedAptId && (
            <>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Upcoming appointments</Text>
              {upcoming.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No upcoming appointments.</Text>
              ) : (
                upcoming.map(apt => {
                  const daysUntil = Math.ceil((new Date(apt.date).getTime() - Date.now()) / 86400000);
                  return (
                    <TouchableOpacity
                      key={apt.id}
                      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                      onPress={() => setSelectedAptId(apt.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.cardTitle, { color: theme.text }]}>{apt.doctorName}</Text>
                      <Text style={[styles.cardSummary, { color: theme.textSecondary }]}>
                        {apt.clinic} · {apt.date} at {apt.time}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: theme.accentSoft, marginTop: 8 }]}>
                        <Text style={[styles.badgeText, { color: theme.accent }]}>{daysUntil} days away</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}

              <Text style={[styles.sectionHeading, { color: theme.text, marginTop: Spacing.five }]}>Medical glossary</Text>
              {glossaryTerms.map((t, i) => (
                <View key={i} style={[styles.glossaryItem, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.glossaryTerm, { color: theme.accent }]}>{t.term}</Text>
                  <Text style={[styles.glossaryDef, { color: theme.text }]}>{t.definition}</Text>
                </View>
              ))}
            </>
          )}

          {section === 'prep' && selectedAptId && selectedApt && (
            <>
              <TouchableOpacity onPress={() => setSelectedAptId(null)}>
                <Text style={[styles.backBtn, { color: theme.accent }]}>Back to appointments</Text>
              </TouchableOpacity>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Prep: {selectedApt.doctorName}</Text>
              <Text style={[styles.meta, { color: theme.textSecondary }]}>{selectedApt.date} at {selectedApt.time} · {selectedApt.clinic}</Text>

              <Text style={[styles.checklistTitle, { color: theme.text }]}>Questions to ask</Text>
              {aptQuestions.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No template questions for this type.</Text>
              ) : (
                aptQuestions.map(q => (
                  <TouchableOpacity key={q.id} style={styles.checkItem} onPress={() => toggle(q.id)}>
                    <View style={[styles.checkBox, checked.has(q.id) && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                      {checked.has(q.id) && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.checkText, { color: theme.text }]}>{q.question}</Text>
                      <Text style={[styles.checkCat, { color: theme.textSecondary }]}>{q.category}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}

              <Text style={[styles.checklistTitle, { color: theme.text }]}>What to bring</Text>
              {['Photo ID', 'Insurance card / AMKA number', 'List of current medications', 'Recent blood test results', 'Symptom diary', 'Previous imaging'].map((item, i) => (
                <TouchableOpacity key={i} style={styles.checkItem} onPress={() => toggle(`bring-${i}`)}>
                  <View style={[styles.checkBox, checked.has(`bring-${i}`) && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                    {checked.has(`bring-${i}`) && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.checkText, { color: theme.text }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {section === 'pricing' && (
            <>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Choose your plan</Text>
              <Text style={[styles.meta, { color: theme.textSecondary, marginBottom: Spacing.four }]}>
                Demonstration — no real payment is processed.
              </Text>
              {plans.map(plan => (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    selectedPlan === plan.id && { borderColor: theme.accent, borderWidth: 2 },
                  ]}
                >
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                    <Text style={[styles.planPrice, { color: theme.accent }]}>{plan.price}</Text>
                  </View>
                  {plan.features.map(f => (
                    <Text key={f} style={[styles.planFeature, { color: theme.text }]}>✓  {f}</Text>
                  ))}
                  {plan.locked.map(f => (
                    <Text key={f} style={[styles.planLocked, { color: theme.textSecondary }]}>✕  {f}</Text>
                  ))}
                  {selectedPlan === plan.id ? (
                    <View style={[styles.currentBadge, { backgroundColor: theme.accentSoft }]}>
                      <Text style={[styles.currentBadgeText, { color: theme.accent }]}>Current plan</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.planBtn, plan.featured ? { backgroundColor: theme.accent } : { backgroundColor: theme.backgroundElement }]}
                      onPress={() => setPlan(plan.id)}
                    >
                      <Text style={[styles.planBtnText, plan.featured ? { color: '#FFF' } : { color: theme.text }]}>
                        Switch to {plan.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '700', marginTop: Spacing.four },
  sectionTabs: { flexDirection: 'row', gap: 8, marginTop: Spacing.four },
  sectionTab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  sectionTabText: { fontSize: 13, fontWeight: '600' },
  filterBar: { marginTop: Spacing.three, marginBottom: Spacing.three },
  filterChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  filterText: { fontSize: 12, fontWeight: '600' },
  card: { padding: Spacing.three, borderRadius: 14, borderWidth: 1, marginBottom: Spacing.three },
  badge: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, marginBottom: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSummary: { fontSize: 13, marginTop: 4, lineHeight: 19 },
  cardMeta: { fontSize: 12, marginTop: 6 },
  backBtn: { fontSize: 15, fontWeight: '600', marginTop: Spacing.four, marginBottom: Spacing.three },
  meta: { fontSize: 14, marginTop: 4 },
  body: { fontSize: 15, lineHeight: 24, marginTop: Spacing.four },
  disclaimer: { padding: Spacing.three, borderRadius: 12, marginTop: Spacing.five },
  disclaimerText: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  sectionHeading: { fontSize: 18, fontWeight: '700', marginTop: Spacing.four, marginBottom: Spacing.three },
  emptyText: { fontSize: 14, marginTop: Spacing.two },
  glossaryItem: { paddingVertical: 12, borderBottomWidth: 1 },
  glossaryTerm: { fontSize: 15, fontWeight: '700' },
  glossaryDef: { fontSize: 14, marginTop: 2, lineHeight: 20 },
  checklistTitle: { fontSize: 16, fontWeight: '700', marginTop: Spacing.five, marginBottom: Spacing.three },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CCC', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkMark: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  checkText: { fontSize: 15, lineHeight: 21 },
  checkCat: { fontSize: 12, marginTop: 2 },
  planCard: { borderWidth: 1, borderRadius: 16, padding: Spacing.four, marginBottom: Spacing.three },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
  planName: { fontSize: 20, fontWeight: '700' },
  planPrice: { fontSize: 20, fontWeight: '700' },
  planFeature: { fontSize: 14, lineHeight: 24 },
  planLocked: { fontSize: 14, lineHeight: 24, textDecorationLine: 'line-through' },
  currentBadge: { paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: Spacing.three },
  currentBadgeText: { fontSize: 14, fontWeight: '600' },
  planBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: Spacing.three },
  planBtnText: { fontSize: 14, fontWeight: '600' },
});
