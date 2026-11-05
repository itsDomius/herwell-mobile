import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  category: string;
  title: string;
  date: string;
  provider?: string;
  notes?: string;
}

export interface SymptomEntry {
  id: string;
  patientId: string;
  date: string;
  painIntensity: number;
  bloating: number;
  energy: number;
  mood: number;
  spotting: boolean;
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  type: string;
  doctorName: string;
  clinic: string;
  date: string;
  time: string;
  notes?: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  author: string;
  readTimeMinutes: number;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface PrepQuestion {
  id: string;
  question: string;
  appointmentType: string;
  category: string;
}

const SEED_RECORDS: MedicalRecord[] = [
  { id: 'rec-1', patientId: 'patient-1', category: 'blood_test', title: 'Hormone Panel — FSH, LH, Estradiol', date: '2026-09-13', provider: 'Athens Diagnostic Lab', notes: 'FSH: 7.2 mIU/mL, LH: 5.1 mIU/mL, Estradiol: 48 pg/mL.' },
  { id: 'rec-2', patientId: 'patient-1', category: 'blood_test', title: 'AMH Test', date: '2026-09-13', provider: 'Athens Diagnostic Lab', notes: 'AMH: 3.4 ng/mL — normal for age 29.' },
  { id: 'rec-3', patientId: 'patient-1', category: 'imaging', title: 'Transvaginal Ultrasound', date: '2026-09-20', provider: 'MetroHealth Imaging', notes: 'Right ovary: 2.8 cm cyst, consistent with endometrioma.' },
  { id: 'rec-4', patientId: 'patient-1', category: 'medication', title: 'Visanne 2mg (Dienogest)', date: '2026-07-01', provider: 'Prescription by Dr. Georgiou', notes: 'Continuous progestogen therapy for endometriosis.' },
  { id: 'rec-5', patientId: 'patient-1', category: 'consultation', title: 'Follow-up — Treatment Response', date: '2026-10-05', provider: 'Dr. Konstantina Georgiou', notes: 'Pain reduced from 8/10 to 4/10 since starting dienogest. Continue current protocol.' },
  { id: 'rec-6', patientId: 'patient-1', category: 'blood_test', title: 'Thyroid Function — TSH, Free T4', date: '2026-08-01', provider: 'Athens Diagnostic Lab' },
  { id: 'rec-7', patientId: 'patient-1', category: 'blood_test', title: 'Complete Blood Count + Iron Studies', date: '2026-08-01', provider: 'Athens Diagnostic Lab', notes: 'Ferritin: 18 ng/mL (low). Iron supplementation recommended.' },
];

const SEED_SYMPTOMS: SymptomEntry[] = Array.from({ length: 14 }, (_, i) => ({
  id: `sym-${i + 1}`,
  patientId: 'patient-1',
  date: `2026-10-${String(i + 1).padStart(2, '0')}`,
  painIntensity: Math.round(3 + Math.sin(i * 0.7) * 3),
  bloating: Math.round(2 + Math.cos(i * 0.5) * 2),
  energy: Math.round(5 + Math.sin(i * 0.4) * 3),
  mood: Math.round(5 + Math.cos(i * 0.6) * 2),
  spotting: i === 3 || i === 10,
}));

const SEED_APPOINTMENTS: Appointment[] = [
  { id: 'apt-1', patientId: 'patient-1', type: 'gynecologist', doctorName: 'Dr. Konstantina Georgiou', clinic: 'Athens Women\'s Clinic', date: '2026-11-18', time: '10:30', notes: 'Follow-up on dienogest treatment' },
  { id: 'apt-2', patientId: 'patient-1', type: 'endocrinologist', doctorName: 'Dr. Alexandros Dimitriou', clinic: 'Endocrine Partners Athens', date: '2026-11-25', time: '14:00', notes: 'Thyroid re-check' },
];

const SEED_ARTICLES: Article[] = [
  { id: 'art-1', title: 'Understanding Endometriosis', summary: 'An overview of endometriosis — what it is, common symptoms, and treatment approaches.', body: 'Endometriosis occurs when tissue similar to the lining of the uterus grows outside the uterus. It affects an estimated 1 in 10 women of reproductive age. Common symptoms include painful periods, chronic pelvic pain, pain during intercourse, and infertility. Treatment options range from pain management and hormonal therapy to surgical intervention. Early diagnosis and a multidisciplinary approach can significantly improve quality of life.', category: 'endometriosis', author: 'HerWell Medical Content Team', readTimeMinutes: 5 },
  { id: 'art-2', title: 'PCOS Explained', summary: 'A guide to Polycystic Ovary Syndrome.', body: 'Polycystic ovary syndrome (PCOS) is a hormonal disorder common among women of reproductive age. It may cause irregular periods, excess androgen levels, and polycystic ovaries. Lifestyle changes, medications, and monitoring can help manage symptoms effectively.', category: 'pcos', author: 'HerWell Medical Content Team', readTimeMinutes: 4 },
  { id: 'art-3', title: 'Hormone Testing: What Your Blood Work Means', summary: 'A guide to common reproductive hormone tests.', body: 'Reproductive hormone tests help your doctor assess ovarian function, thyroid health, and more. Key tests include FSH, LH, estradiol, AMH, TSH, and progesterone. Understanding your results empowers you to have informed conversations with your healthcare team.', category: 'tests', author: 'HerWell Medical Content Team', readTimeMinutes: 7 },
  { id: 'art-4', title: 'Understanding Ovulation', summary: 'Your body\'s monthly fertility window.', body: 'Ovulation is the release of an egg from one of your ovaries, typically occurring mid-cycle. Tracking ovulation through basal body temperature, cervical mucus changes, and ovulation prediction kits can help with family planning.', category: 'ovulation', author: 'HerWell Medical Content Team', readTimeMinutes: 4 },
  { id: 'art-5', title: 'Egg Freezing Explained', summary: 'What to expect from fertility preservation.', body: 'Egg freezing (oocyte cryopreservation) allows you to preserve eggs for future use. The process involves ovarian stimulation, egg retrieval, and vitrification. It is increasingly accessible and can provide peace of mind for future family planning.', category: 'treatment', author: 'HerWell Medical Content Team', readTimeMinutes: 6 },
];

const SEED_GLOSSARY: GlossaryTerm[] = [
  { term: 'AMH', definition: 'Anti-Mullerian hormone — indicates ovarian reserve.' },
  { term: 'FSH', definition: 'Follicle-stimulating hormone — regulates egg development.' },
  { term: 'LH', definition: 'Luteinizing hormone — triggers ovulation.' },
  { term: 'Endometrioma', definition: 'An ovarian cyst caused by endometriosis.' },
  { term: 'Dienogest', definition: 'A progestogen used to treat endometriosis.' },
  { term: 'Laparoscopy', definition: 'Minimally invasive surgery to diagnose or treat pelvic conditions.' },
  { term: 'Estradiol', definition: 'The primary form of estrogen, key to reproductive health.' },
  { term: 'TSH', definition: 'Thyroid-stimulating hormone — screens for thyroid disorders.' },
];

const SEED_PREP_QUESTIONS: PrepQuestion[] = [
  { id: 'pq-1', question: 'Has my pain level changed since starting dienogest?', appointmentType: 'gynecologist', category: 'Treatment progress' },
  { id: 'pq-2', question: 'Should we schedule another ultrasound to check the endometrioma?', appointmentType: 'gynecologist', category: 'Monitoring' },
  { id: 'pq-3', question: 'Are there side effects I should watch for with this medication?', appointmentType: 'gynecologist', category: 'Medication' },
  { id: 'pq-4', question: 'When should I consider surgical options?', appointmentType: 'gynecologist', category: 'Treatment options' },
  { id: 'pq-5', question: 'How do my current hormone levels affect fertility planning?', appointmentType: 'gynecologist', category: 'Fertility' },
  { id: 'pq-6', question: 'Is my TSH within normal range?', appointmentType: 'endocrinologist', category: 'Thyroid' },
  { id: 'pq-7', question: 'Could thyroid function be affecting my energy levels?', appointmentType: 'endocrinologist', category: 'Symptoms' },
  { id: 'pq-8', question: 'Do I need to adjust my thyroid medication dosage?', appointmentType: 'endocrinologist', category: 'Medication' },
];

const DEMO_USERS: DemoUser[] = [
  { id: 'patient-1', email: 'elena@demo.herwell', name: 'Elena Papadaki', role: 'patient' },
  { id: 'patient-2', email: 'maria@demo.herwell', name: 'Maria Nikolaou', role: 'patient' },
];

interface DemoState {
  user: DemoUser | null;
  records: MedicalRecord[];
  symptoms: SymptomEntry[];
  appointments: Appointment[];
  articles: Article[];
  glossaryTerms: GlossaryTerm[];
  prepQuestions: PrepQuestion[];
  selectedPlan: 'free' | 'premium' | 'doctor';
  signIn: (email: string) => void;
  signOut: () => void;
  addRecord: (rec: Omit<MedicalRecord, 'id'>) => void;
  addSymptom: (entry: Omit<SymptomEntry, 'id'>) => void;
  setPlan: (plan: 'free' | 'premium' | 'doctor') => void;
}

const DemoContext = createContext<DemoState | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [records, setRecords] = useState(SEED_RECORDS);
  const [symptoms, setSymptoms] = useState(SEED_SYMPTOMS);
  const [appointments] = useState(SEED_APPOINTMENTS);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'doctor'>('free');

  const signIn = useCallback((email: string) => {
    const found = DEMO_USERS.find(u => u.email === email);
    setUser(found ?? { id: 'guest-1', email, name: email.split('@')[0], role: 'patient' });
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const addRecord = useCallback((rec: Omit<MedicalRecord, 'id'>) => {
    setRecords(prev => [...prev, { ...rec, id: `rec-${Date.now()}` }]);
  }, []);

  const addSymptom = useCallback((entry: Omit<SymptomEntry, 'id'>) => {
    setSymptoms(prev => [...prev, { ...entry, id: `sym-${Date.now()}` }]);
  }, []);

  const setPlan = useCallback((plan: 'free' | 'premium' | 'doctor') => {
    setSelectedPlan(plan);
  }, []);

  const filtered = user
    ? {
        records: records.filter(r => r.patientId === user.id),
        symptoms: symptoms.filter(s => s.patientId === user.id),
        appointments: appointments.filter(a => a.patientId === user.id),
      }
    : { records, symptoms, appointments };

  return (
    <DemoContext.Provider value={{
      user,
      ...filtered,
      articles: SEED_ARTICLES,
      glossaryTerms: SEED_GLOSSARY,
      prepQuestions: SEED_PREP_QUESTIONS,
      selectedPlan,
      signIn,
      signOut,
      addRecord,
      addSymptom,
      setPlan,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
