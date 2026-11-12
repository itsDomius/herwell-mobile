import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  mode?: 'general' | 'clinic';
  clinicRole?: 'doctor' | 'patient';
}

// ── IVF Clinic types ───────────────────────────────────────────────────────
export type ComplianceStatus = 'done' | 'pending' | 'late' | 'missed';

export interface ClinicProtocol {
  id: string; patientId: string; medication: string; dose: string;
  route: 'injection' | 'oral' | 'vaginal'; time: string; date: string;
  critical: boolean; version: number; videoId?: string; notes?: string;
}

export interface ClinicCompliance {
  id: string; patientId: string; protocolEntryId: string;
  date: string; time: string; medication: string;
  status: ComplianceStatus; confirmedAt?: string;
}

export interface ClinicChatMessage {
  id: string; patientId: string; fromRole: 'doctor' | 'patient';
  fromName: string; text: string; createdAt: string; read: boolean;
}

export interface ClinicVideo {
  id: string; medication: string; title: string; description: string; duration: string;
}

export interface ClinicLabFile {
  id: string; patientId: string; name: string;
  type: 'blood_test' | 'ultrasound' | 'other'; date: string;
  reviewed: boolean; doctorNote?: string;
}

export interface ClinicPatientRecord {
  id: string; name: string; dob: string; status: 'active' | 'pending'; joinedAt: string;
}

export interface PlanUpdateNotif {
  id: string; patientId: string; details: string; seenByPatient: boolean; createdAt: string;
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

// ── IVF clinic seed data ──────────────────────────────────────────────────
const IVF_TODAY = '2026-11-12';
function dOff(base: string, days: number) {
  const d = new Date(base); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0];
}

export const IVF_DOCTOR_USER: DemoUser = { id: 'ivf-doc-1', email: 'doctor@ivf.demo', name: 'Δρ. Αλ. Κωστοπούλου', role: 'doctor', mode: 'clinic', clinicRole: 'doctor' };
export const IVF_PATIENT_USER: DemoUser = { id: 'ivf-pat-1', email: 'patient@ivf.demo', name: 'Μαρία Παπαδοπούλου', role: 'patient', mode: 'clinic', clinicRole: 'patient' };

export const IVF_PATIENTS: ClinicPatientRecord[] = [
  { id: 'ivf-pat-1', name: 'Μαρία Παπαδοπούλου', dob: '1990-03-15', status: 'active', joinedAt: dOff(IVF_TODAY, -7) },
  { id: 'ivf-pat-2', name: 'Ελένη Νικολάου', dob: '1988-07-22', status: 'active', joinedAt: dOff(IVF_TODAY, -3) },
  { id: 'ivf-pat-3', name: 'Άννα Γεωργίου', dob: '1992-11-08', status: 'active', joinedAt: dOff(IVF_TODAY, -10) },
];

function makeProtos(patientId: string, startOffset: number): ClinicProtocol[] {
  const result: ClinicProtocol[] = [];
  let n = 0;
  const totalDays = Math.abs(startOffset) + 4;
  for (let d = 0; d < totalDays; d++) {
    const date = dOff(IVF_TODAY, startOffset + d);
    result.push({ id: `${patientId}-p-${++n}`, patientId, medication: 'Gonal-F', dose: '225 IU', route: 'injection', time: '20:00', date, critical: false, version: 1, videoId: 'ivf-vid-1' });
    if (d >= 4) result.push({ id: `${patientId}-p-${++n}`, patientId, medication: 'Cetrotide', dose: '0.25 mg', route: 'injection', time: '09:00', date, critical: false, version: 1 });
    result.push({ id: `${patientId}-p-${++n}`, patientId, medication: 'Progynova', dose: '2 mg', route: 'oral', time: '08:00', date, critical: false, version: 1 });
    result.push({ id: `${patientId}-p-${++n}`, patientId, medication: 'Progynova', dose: '2 mg', route: 'oral', time: '20:00', date, critical: false, version: 1 });
  }
  if (patientId === 'ivf-pat-3') {
    result.push({ id: `${patientId}-trigger`, patientId, medication: 'Ovitrelle', dose: '250 μg', route: 'injection', time: '23:00', date: IVF_TODAY, critical: true, version: 1, notes: 'Κρίσιμη ένεση — ακριβής ώρα!' });
  }
  return result;
}

export const IVF_PROTOCOLS: ClinicProtocol[] = [
  ...makeProtos('ivf-pat-1', -7),
  ...makeProtos('ivf-pat-2', -3),
  ...makeProtos('ivf-pat-3', -10),
];

export const IVF_COMPLIANCE: ClinicCompliance[] = IVF_PROTOCOLS
  .filter(p => p.date < IVF_TODAY)
  .map(p => ({
    id: `cl-${p.id}`, patientId: p.patientId, protocolEntryId: p.id,
    date: p.date, time: p.time, medication: p.medication,
    status: Math.random() > 0.07 ? 'done' as ComplianceStatus : 'missed' as ComplianceStatus,
    confirmedAt: Math.random() > 0.07 ? `${p.date}T${p.time}:00` : undefined,
  }));
// Mark today morning Progynova as done for pat-1
IVF_PROTOCOLS.filter(p => p.patientId === 'ivf-pat-1' && p.date === IVF_TODAY && p.time === '08:00').forEach(p => {
  IVF_COMPLIANCE.push({ id: `cl-today-${p.id}`, patientId: p.patientId, protocolEntryId: p.id, date: IVF_TODAY, time: p.time, medication: p.medication, status: 'done', confirmedAt: `${IVF_TODAY}T08:03:00` });
});

export const IVF_MESSAGES: ClinicChatMessage[] = [
  { id: 'cm-1', patientId: 'ivf-pat-1', fromRole: 'doctor', fromName: 'Δρ. Κωστοπούλου', text: 'Καλημέρα Μαρία! Όλα φαίνονται πολύ καλά. Συνεχίστε το πρωτόκολλο κανονικά.', createdAt: `${dOff(IVF_TODAY, -2)}T10:30:00`, read: true },
  { id: 'cm-2', patientId: 'ivf-pat-1', fromRole: 'patient', fromName: 'Μαρία Παπαδοπούλου', text: 'Χθες ένιωσα λίγο φούσκωμα μετά την ένεση. Είναι φυσιολογικό;', createdAt: `${dOff(IVF_TODAY, -2)}T11:15:00`, read: true },
  { id: 'cm-3', patientId: 'ivf-pat-1', fromRole: 'doctor', fromName: 'Δρ. Κωστοπούλου', text: 'Ναι, είναι απολύτως φυσιολογικό. Παρενέργεια της αγωγής.', createdAt: `${dOff(IVF_TODAY, -2)}T11:45:00`, read: true },
  { id: 'cm-4', patientId: 'ivf-pat-3', fromRole: 'doctor', fromName: 'Δρ. Κωστοπούλου', text: 'Άννα, η κρίσιμη ένεση Ovitrelle είναι ΣΗΜΕΡΑ στις 23:00. Μην την παραλείψετε!', createdAt: `${IVF_TODAY}T08:00:00`, read: false },
];

export const IVF_VIDEOS: ClinicVideo[] = [
  { id: 'ivf-vid-1', medication: 'Gonal-F', title: 'Πώς να κάνετε Gonal-F', description: 'Βήμα-βήμα οδηγίες για την υποδόρια ένεση.', duration: '4:32' },
  { id: 'ivf-vid-2', medication: 'Cetrotide', title: 'Ένεση Cetrotide', description: 'Πώς να προετοιμάσετε και να χορηγήσετε το Cetrotide.', duration: '3:48' },
  { id: 'ivf-vid-3', medication: 'Ovitrelle', title: 'Trigger Shot Ovitrelle', description: 'Κρίσιμη ένεση — ακολουθήστε τις οδηγίες με ακρίβεια.', duration: '5:10' },
];

export const IVF_LABS: ClinicLabFile[] = [
  { id: 'ivfl-1', patientId: 'ivf-pat-1', name: 'Ορμονικό Προφίλ Ημέρα 2', type: 'blood_test', date: dOff(IVF_TODAY, -6), reviewed: true, doctorNote: 'Φυσιολογικά. Ξεκινάμε πρωτόκολλο.' },
  { id: 'ivfl-2', patientId: 'ivf-pat-1', name: 'Υπερηχογράφημα Ημέρα 5', type: 'ultrasound', date: dOff(IVF_TODAY, -3), reviewed: true, doctorNote: '8 ωοθυλάκια. Συνεχίζουμε ίδια δόση.' },
  { id: 'ivfl-3', patientId: 'ivf-pat-1', name: 'Ορμονικό Ημέρα 7', type: 'blood_test', date: IVF_TODAY, reviewed: false },
];

export const IVF_NOTIFICATIONS: PlanUpdateNotif[] = [
  { id: 'pun-1', patientId: 'ivf-pat-3', details: 'Trigger shot Ovitrelle 250μg προστέθηκε σήμερα στις 23:00 (ΚΡΙΣΙΜΟ).', seenByPatient: false, createdAt: IVF_TODAY },
];

export { IVF_TODAY };

const DEMO_USERS: DemoUser[] = [
  { id: 'patient-1', email: 'elena@demo.herwell', name: 'Elena Papadaki', role: 'patient' },
  { id: 'patient-2', email: 'maria@demo.herwell', name: 'Maria Nikolaou', role: 'patient' },
  IVF_DOCTOR_USER,
  IVF_PATIENT_USER,
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
  // IVF clinic
  clinicProtocols: ClinicProtocol[];
  clinicCompliance: ClinicCompliance[];
  clinicMessages: ClinicChatMessage[];
  clinicLabs: ClinicLabFile[];
  clinicNotifications: PlanUpdateNotif[];
  confirmClinicDose: (protocolEntryId: string, patientId: string) => void;
  seenClinicNotif: (id: string) => void;
  sendClinicMessage: (patientId: string, text: string) => void;
  addClinicLab: (lab: Omit<ClinicLabFile, 'id' | 'reviewed'>) => void;
  reviewClinicLab: (id: string, note: string) => void;
  IVF_TODAY: string;
}

const DemoContext = createContext<DemoState | undefined>(undefined);

let _clinicNid = 100;

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [records, setRecords] = useState(SEED_RECORDS);
  const [symptoms, setSymptoms] = useState(SEED_SYMPTOMS);
  const [appointments] = useState(SEED_APPOINTMENTS);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'doctor'>('free');
  const [clinicProtocols] = useState<ClinicProtocol[]>(IVF_PROTOCOLS);
  const [clinicCompliance, setClinicCompliance] = useState<ClinicCompliance[]>(IVF_COMPLIANCE);
  const [clinicMessages, setClinicMessages] = useState<ClinicChatMessage[]>(IVF_MESSAGES);
  const [clinicLabs, setClinicLabs] = useState<ClinicLabFile[]>(IVF_LABS);
  const [clinicNotifications, setClinicNotifications] = useState<PlanUpdateNotif[]>(IVF_NOTIFICATIONS);

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

  const confirmClinicDose = useCallback((protocolEntryId: string, patientId: string) => {
    const entry = clinicProtocols.find(p => p.id === protocolEntryId);
    if (!entry) return;
    setClinicCompliance(prev => {
      const ex = prev.find(c => c.protocolEntryId === protocolEntryId);
      if (ex) return prev.map(c => c.protocolEntryId === protocolEntryId ? { ...c, status: 'done', confirmedAt: new Date().toISOString() } : c);
      return [...prev, { id: `cl-new-${++_clinicNid}`, patientId, protocolEntryId, date: entry.date, time: entry.time, medication: entry.medication, status: 'done', confirmedAt: new Date().toISOString() }];
    });
  }, [clinicProtocols]);

  const seenClinicNotif = useCallback((id: string) => {
    setClinicNotifications(prev => prev.map(n => n.id === id ? { ...n, seenByPatient: true } : n));
  }, []);

  const sendClinicMessage = useCallback((patientId: string, text: string) => {
    if (!user || !text.trim()) return;
    setClinicMessages(prev => [...prev, { id: `cm-new-${++_clinicNid}`, patientId, fromRole: user.clinicRole ?? 'patient', fromName: user.name, text: text.trim(), createdAt: new Date().toISOString(), read: false }]);
  }, [user]);

  const addClinicLab = useCallback((lab: Omit<ClinicLabFile, 'id' | 'reviewed'>) => {
    setClinicLabs(prev => [...prev, { ...lab, id: `lab-new-${++_clinicNid}`, reviewed: false }]);
  }, []);

  const reviewClinicLab = useCallback((id: string, note: string) => {
    setClinicLabs(prev => prev.map(l => l.id === id ? { ...l, reviewed: true, doctorNote: note } : l));
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
      clinicProtocols,
      clinicCompliance,
      clinicMessages,
      clinicLabs,
      clinicNotifications,
      confirmClinicDose,
      seenClinicNotif,
      sendClinicMessage,
      addClinicLab,
      reviewClinicLab,
      IVF_TODAY,
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
