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
  { id: 'free' as const, name: 'Free', price: '$0', period: 'forever', features: ['Up to 5 records', 'Basic symptom tracking', 'Education articles'], locked: ['Trend charts', 'Doctor sharing'] },
  { id: 'premium' as const, name: 'Premium', price: '$9.99', period: '/mo', features: ['Unlimited records', 'Full tracker with trends', 'Share with doctors', 'Export health summary'], locked: [], featured: true },
  { id: 'doctor' as const, name: 'Doctor', price: '$29.99', period: '/mo', features: ['Doctor dashboard', 'Receive patient shares', 'Verified badge', 'Analytics'], locked: [] },
];

const CARD_SHADOW = {
  shadowColor: '#1E1433', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
};

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
      <View style={[s.root, { backgroundColor: theme.background }]}>
        <SafeAreaView style={s.safe}>
          <View style={[s.pageHeader, { backgroundColor: theme.accentSoft }]}>
            <TouchableOpacity onPress={() => setSelectedArticleId(null)}>
              <Text style={[s.backBtn, { color: theme.accent }]}>← Education hub</Text>
            </TouchableOpacity>
            <Text style={[s.pageTitle, { color: theme.text }]} numberOfLines={2}>{selectedArticle.title}</Text>
          </View>
          <ScrollView contentContainerStyle={s.articleScroll}>
            <View style={[s.chip, { backgroundColor: theme.accentSoft, alignSelf: 'flex-start' }]}>
              <Text style={[s.chipText, { color: theme.accent }]}>{selectedArticle.category}</Text>
            </View>
            <Text style={[s.articleMeta, { color: theme.textSecondary }]}>
              By {selectedArticle.author} · {selectedArticle.readTimeMinutes} min read
            </Text>
            <Text style={[s.articleBody, { color: theme.text }]}>{selectedArticle.body}</Text>
            <View style={[s.disclaimerBox, { backgroundColor: theme.terracottaSoft }]}>
              <Text style={[s.disclaimerText, { color: theme.terracotta }]}>
                Educational purposes only — not medical advice. Demonstration content.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe}>
        <View style={[s.pageHeader, { backgroundColor: theme.accentSoft }]}>
          <Text style={[s.pageTitle, { color: theme.text }]}>Learn & Prepare</Text>
          <View style={[s.tabBar, { backgroundColor: theme.card }]}>
            {([['education', 'Education'], ['prep', 'Appt Prep'], ['pricing', 'Plans']] as [Section, string][]).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[s.tabBtn, section === key && { backgroundColor: theme.accent }]}
                onPress={() => setSection(key)}
              >
                <Text style={[s.tabText, section === key ? { color: '#FFF' } : { color: theme.textSecondary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Education */}
          {section === 'education' && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={s.filterBarContent}>
                {articleCategories.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[s.filterChip, artFilter === c.value && { backgroundColor: theme.accent }]}
                    onPress={() => setArtFilter(c.value)}
                  >
                    <Text style={[s.filterText, artFilter === c.value ? { color: '#FFF' } : { color: theme.textSecondary }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {filteredArticles.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setSelectedArticleId(a.id)}
                  activeOpacity={0.75}
                >
                  <View style={s.cardTop}>
                    <View style={[s.chip, { backgroundColor: theme.accentSoft }]}>
                      <Text style={[s.chipText, { color: theme.accent }]}>{a.category}</Text>
                    </View>
                    <Text style={[s.readTime, { color: theme.textSecondary }]}>{a.readTimeMinutes} min</Text>
                  </View>
                  <Text style={[s.cardTitle, { color: theme.text }]}>{a.title}</Text>
                  <Text style={[s.cardSummary, { color: theme.textSecondary }]} numberOfLines={2}>{a.summary}</Text>
                </TouchableOpacity>
              ))}
              <View style={[s.disclaimerBox, { backgroundColor: theme.terracottaSoft }]}>
                <Text style={[s.disclaimerText, { color: theme.terracotta }]}>
                  For educational purposes only. Demonstration prototype with synthetic content.
                </Text>
              </View>
            </>
          )}

          {/* Appointment prep */}
          {section === 'prep' && !selectedAptId && (
            <>
              <Text style={[s.sectionHeading, { color: theme.text }]}>Select appointment to prep</Text>
              {upcoming.length === 0 ? (
                <Text style={[s.emptyText, { color: theme.textSecondary }]}>No upcoming appointments.</Text>
              ) : upcoming.map(apt => {
                const daysUntil = Math.ceil((new Date(apt.date).getTime() - Date.now()) / 86400000);
                return (
                  <TouchableOpacity
                    key={apt.id}
                    style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => setSelectedAptId(apt.id)}
                    activeOpacity={0.75}
                  >
                    <View style={s.aptCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.cardTitle, { color: theme.text }]}>{apt.doctorName}</Text>
                        <Text style={[s.cardSummary, { color: theme.textSecondary }]}>{apt.clinic}</Text>
                        <Text style={[s.cardMeta, { color: theme.textSecondary }]}>{apt.date} at {apt.time}</Text>
                      </View>
                      <View style={[s.daysBadge, { backgroundColor: theme.accentSoft }]}>
                        <Text style={[s.daysBadgeNum, { color: theme.accent }]}>{daysUntil}</Text>
                        <Text style={[s.daysBadgeUnit, { color: theme.accent }]}>days</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <Text style={[s.sectionHeading, { color: theme.text }]}>Medical glossary</Text>
              <View style={[s.glossaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {glossaryTerms.map((t, i) => (
                  <View key={i} style={[s.glossaryItem, i < glossaryTerms.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
                    <Text style={[s.glossaryTerm, { color: theme.accent }]}>{t.term}</Text>
                    <Text style={[s.glossaryDef, { color: theme.text }]}>{t.definition}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {section === 'prep' && selectedAptId && selectedApt && (
            <>
              <TouchableOpacity onPress={() => setSelectedAptId(null)} style={s.backRow}>
                <Text style={[s.backBtn, { color: theme.accent }]}>← Back to appointments</Text>
              </TouchableOpacity>
              <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[s.cardTitle, { color: theme.text }]}>{selectedApt.doctorName}</Text>
                <Text style={[s.cardMeta, { color: theme.textSecondary }]}>{selectedApt.date} at {selectedApt.time} · {selectedApt.clinic}</Text>
              </View>

              <Text style={[s.sectionHeading, { color: theme.text }]}>Questions to ask</Text>
              {aptQuestions.length === 0 ? (
                <Text style={[s.emptyText, { color: theme.textSecondary }]}>No template questions for this type.</Text>
              ) : aptQuestions.map(q => (
                <TouchableOpacity key={q.id} style={[s.checkItem, { borderColor: theme.border }]} onPress={() => toggle(q.id)}>
                  <View style={[s.checkBox, { borderColor: checked.has(q.id) ? theme.accent : theme.border }, checked.has(q.id) && { backgroundColor: theme.accent }]}>
                    {checked.has(q.id) && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.checkText, { color: theme.text }]}>{q.question}</Text>
                    <Text style={[s.checkCat, { color: theme.textSecondary }]}>{q.category}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <Text style={[s.sectionHeading, { color: theme.text }]}>What to bring</Text>
              {['Photo ID', 'Insurance card / AMKA number', 'List of current medications', 'Recent blood test results', 'Symptom diary', 'Previous imaging'].map((item, i) => (
                <TouchableOpacity key={i} style={[s.checkItem, { borderColor: theme.border }]} onPress={() => toggle(`bring-${i}`)}>
                  <View style={[s.checkBox, { borderColor: checked.has(`bring-${i}`) ? theme.accent : theme.border }, checked.has(`bring-${i}`) && { backgroundColor: theme.accent }]}>
                    {checked.has(`bring-${i}`) && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <Text style={[s.checkText, { color: theme.text }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Pricing */}
          {section === 'pricing' && (
            <>
              <Text style={[s.sectionHeading, { color: theme.text }]}>Choose your plan</Text>
              <Text style={[s.pricingNote, { color: theme.textSecondary }]}>Demonstration — no real payment is processed.</Text>
              {plans.map(plan => (
                <View
                  key={plan.id}
                  style={[
                    s.planCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    plan.featured && { borderColor: theme.accent },
                    selectedPlan === plan.id && { borderColor: theme.accent },
                  ]}
                >
                  {plan.featured && (
                    <View style={[s.featuredBadge, { backgroundColor: theme.accent }]}>
                      <Text style={s.featuredBadgeText}>Most popular</Text>
                    </View>
                  )}
                  <View style={s.planHeader}>
                    <Text style={[s.planName, { color: theme.text }]}>{plan.name}</Text>
                    <View style={s.planPriceRow}>
                      <Text style={[s.planPrice, { color: theme.accent }]}>{plan.price}</Text>
                      <Text style={[s.planPeriod, { color: theme.textSecondary }]}>{plan.period}</Text>
                    </View>
                  </View>
                  <View style={[s.planDivider, { backgroundColor: theme.border }]} />
                  {plan.features.map(f => (
                    <View key={f} style={s.featureRow}>
                      <Text style={[s.featureCheck, { color: theme.accent }]}>✓</Text>
                      <Text style={[s.featureText, { color: theme.text }]}>{f}</Text>
                    </View>
                  ))}
                  {plan.locked.map(f => (
                    <View key={f} style={s.featureRow}>
                      <Text style={[s.featureCross, { color: theme.textSecondary }]}>✕</Text>
                      <Text style={[s.featureText, { color: theme.textSecondary }]}>{f}</Text>
                    </View>
                  ))}
                  {selectedPlan === plan.id ? (
                    <View style={[s.currentBadge, { backgroundColor: theme.accentSoft }]}>
                      <Text style={[s.currentBadgeText, { color: theme.accent }]}>Current plan</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[s.planBtn, { backgroundColor: plan.featured ? theme.accent : theme.backgroundElement ?? theme.accentSoft }]}
                      onPress={() => setPlan(plan.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.planBtnText, { color: plan.featured ? '#FFF' : theme.text }]}>
                        Switch to {plan.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </>
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
  pageHeader: { paddingHorizontal: Spacing.four, paddingTop: 16, paddingBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  backBtn: { fontSize: 14, fontWeight: '700' },
  backRow: { paddingVertical: 8 },
  tabBar: { flexDirection: 'row', borderRadius: 14, padding: 4, gap: 2 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '700' },
  filterBar: { marginBottom: 12 },
  filterBarContent: { gap: 8, paddingRight: 16 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(138,110,212,0.08)' },
  filterText: { fontSize: 13, fontWeight: '600' },
  scroll: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: 80 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10, ...CARD_SHADOW },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  readTime: { fontSize: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSummary: { fontSize: 13, marginTop: 4, lineHeight: 19 },
  cardMeta: { fontSize: 12, marginTop: 3 },
  sectionHeading: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  emptyText: { fontSize: 14, color: 'gray' },
  aptCardRow: { flexDirection: 'row', alignItems: 'center' },
  daysBadge: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, alignItems: 'center' },
  daysBadgeNum: { fontSize: 20, fontWeight: '700' },
  daysBadgeUnit: { fontSize: 11, fontWeight: '600' },
  glossaryCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12, ...CARD_SHADOW },
  glossaryItem: { padding: 14 },
  glossaryTerm: { fontSize: 15, fontWeight: '700' },
  glossaryDef: { fontSize: 14, marginTop: 3, lineHeight: 20 },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkMark: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  checkText: { fontSize: 15, lineHeight: 20 },
  checkCat: { fontSize: 12, marginTop: 2 },
  disclaimerBox: { borderRadius: 12, padding: 14, marginTop: 16 },
  disclaimerText: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  pricingNote: { fontSize: 14, marginBottom: 16 },
  planCard: { borderRadius: 16, borderWidth: 2, padding: 18, marginBottom: 12, ...CARD_SHADOW },
  featuredBadge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginBottom: 10 },
  featuredBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  planName: { fontSize: 20, fontWeight: '700' },
  planPriceRow: { alignItems: 'flex-end' },
  planPrice: { fontSize: 22, fontWeight: '700' },
  planPeriod: { fontSize: 12 },
  planDivider: { height: 1, marginVertical: 10 },
  featureRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  featureCheck: { fontSize: 14, fontWeight: '700', width: 16 },
  featureCross: { fontSize: 14, width: 16 },
  featureText: { fontSize: 14, flex: 1 },
  currentBadge: { borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  currentBadgeText: { fontSize: 14, fontWeight: '700' },
  planBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  planBtnText: { fontSize: 15, fontWeight: '700' },
  articleScroll: { padding: Spacing.four, paddingBottom: 80 },
  articleMeta: { fontSize: 13, marginTop: 8, marginBottom: 20 },
  articleBody: { fontSize: 16, lineHeight: 26 },
});
