
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp, setDoc, getDoc } from 'firebase/firestore';
import { Student, Mark, User, UserRole, AttendanceRecord, Teacher, Parent, Subject, UNEBCandidate, FinancialRecord, FeeSummary, FeeStructure, ExamSchedule, Announcement, RegisteredUser, ReportCardAccess, WeeklyReport } from '../types';

const COLLECTIONS = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  PARENTS: 'parents',
  SUBJECTS: 'subjects',
  MARKS: 'marks',
  ATTENDANCE: 'attendance',
  UNEB: 'uneb_candidates',
  FINANCE: 'financial_records',
  FEES: 'fee_structures',
  EXAMS: 'exam_schedules',
  ANNOUNCEMENTS: 'announcements',
  USERS: 'users',
  REPORT_ACCESS: 'report_access',
  WEEKLY_REPORTS: 'weekly_reports'
};

// Helper to convert Firestore doc to object with ID
const convertDoc = <T>(doc: any): T => ({ id: doc.id, ...doc.data() });

export const firestoreService = {
  // --- USER MANAGEMENT ---
  getUsers: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return snapshot.docs.map(doc => convertDoc<RegisteredUser>(doc));
  },
  addUser: async (user: RegisteredUser) => {
    const { id, ...userData } = user; // Firestore generates ID
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), { ...userData, createdAt: new Date().toISOString() });
    return { ...user, id: docRef.id };
  },
  updateUser: async (user: RegisteredUser) => {
    const { id, ...userData } = user;
    await updateDoc(doc(db, COLLECTIONS.USERS, String(id)), userData);
  },
  deleteUser: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.USERS, id));
  },
  verifyUser: async (username: string, password: string): Promise<RegisteredUser | undefined> => {
    const q = query(collection(db, COLLECTIONS.USERS), where("username", "==", username), where("password", "==", password));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    return convertDoc<RegisteredUser>(snapshot.docs[0]);
  },

  // --- STUDENTS ---
  getStudents: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS)); // Wait, students are separate? Yes.
    const studentSnapshot = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    return studentSnapshot.docs.map(doc => convertDoc<Student>(doc)).sort((a, b) => a.name.localeCompare(b.name));
  },
  getStudentByAdmissionNumber: async (admissionNumber: string): Promise<Student | undefined> => {
    const q = query(collection(db, COLLECTIONS.STUDENTS), where("admission_number", "==", admissionNumber));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    return convertDoc<Student>(snapshot.docs[0]);
  },
  addStudent: async (student: Omit<Student, 'id' | 'active'>, initialFees?: { tuition: number, uniform: number, previousBalance: number }) => {
    const newStudentData = { ...student, active: true, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), newStudentData);
    const newStudent = { ...newStudentData, id: docRef.id }; // ID is string now

    if (initialFees) {
      const now = new Date().toISOString();
      if (initialFees.tuition > 0) {
        await addDoc(collection(db, COLLECTIONS.FINANCE), {
          student_id: docRef.id,
          amount: initialFees.tuition,
          type: 'debit',
          description: 'Initial Tuition Billing',
          date: now,
          category: 'Tuition'
        });
      }
      if (initialFees.uniform > 0) {
        await addDoc(collection(db, COLLECTIONS.FINANCE), {
          student_id: docRef.id,
          amount: initialFees.uniform,
          type: 'debit',
          description: 'Initial Uniform Billing',
          date: now,
          category: 'Uniform'
        });
      }
      if (initialFees.previousBalance > 0) {
        await addDoc(collection(db, COLLECTIONS.FINANCE), {
          student_id: docRef.id,
          amount: initialFees.previousBalance,
          type: 'debit',
          description: 'Brought-forward Balance (Transfer/Arrears)',
          date: now,
          category: 'Other'
        });
      } else if (initialFees.previousBalance < 0) {
        await addDoc(collection(db, COLLECTIONS.FINANCE), {
          student_id: docRef.id,
          amount: Math.abs(initialFees.previousBalance),
          type: 'credit',
          description: 'Initial Credit Balance (Overpayment)',
          date: now,
          category: 'Other'
        });
      }
    }
    return newStudent;
  },
  updateStudent: async (student: Student) => {
    const { id, ...data } = student;
    await updateDoc(doc(db, COLLECTIONS.STUDENTS, String(id)), { ...data, updatedAt: new Date().toISOString() });
  },
  deleteStudent: async (id: string) => deleteDoc(doc(db, COLLECTIONS.STUDENTS, id)),

  // --- TEACHERS ---
  getTeachers: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.TEACHERS));
    return snapshot.docs.map(doc => convertDoc<Teacher>(doc));
  },
  addTeacher: async (teacher: Omit<Teacher, 'id'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.TEACHERS), { ...teacher, createdAt: new Date().toISOString() });
    return { ...teacher, id: docRef.id };
  },
  deleteTeacher: async (id: string) => deleteDoc(doc(db, COLLECTIONS.TEACHERS, id)),

  // --- SUBJECTS ---
  getSubjects: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SUBJECTS));
    return snapshot.docs.map(doc => convertDoc<Subject>(doc));
  },
  addSubject: async (subject: Subject) => {
    // Use code as ID or let Firestore generate? mockApi uses code as ID sometimes.
    // Let's stick to Firestore generated IDs for consistency, or use setDoc if ID is provided.
    if (subject.id) {
        await setDoc(doc(db, COLLECTIONS.SUBJECTS, subject.id), { ...subject, createdAt: new Date().toISOString() });
        return subject;
    } else {
        const docRef = await addDoc(collection(db, COLLECTIONS.SUBJECTS), { ...subject, createdAt: new Date().toISOString() });
        return { ...subject, id: docRef.id };
    }
  },
  deleteSubject: async (id: string) => deleteDoc(doc(db, COLLECTIONS.SUBJECTS, id)),

  // --- PARENTS ---
  getParents: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.PARENTS));
    return snapshot.docs.map(doc => convertDoc<Parent>(doc));
  },
  getParentByUsername: async (username: string) => {
    const q = query(collection(db, COLLECTIONS.PARENTS), where("username", "==", username));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return undefined;
    return convertDoc<Parent>(snapshot.docs[0]);
  },
  getChildrenOfParent: async (parentId: string) => {
    // In Firestore, we might query students where parentId matches.
    // But mockApi uses `parentId` field on student.
    const q = query(collection(db, COLLECTIONS.STUDENTS), where("parentId", "==", parentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertDoc<Student>(doc)).sort((a, b) => a.name.localeCompare(b.name));
  },

  // --- MARKS ---
  getMarks: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.MARKS));
    return snapshot.docs.map(doc => convertDoc<Mark>(doc));
  },
  getMarksByStudent: async (studentId: string) => {
    const q = query(collection(db, COLLECTIONS.MARKS), where("student_id", "==", studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertDoc<Mark>(doc));
  },
  addMark: async (mark: Omit<Mark, 'id' | 'date'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.MARKS), { ...mark, date: new Date().toISOString() });
    return { ...mark, id: docRef.id, date: new Date().toISOString() };
  },
  deleteMark: async (id: string) => deleteDoc(doc(db, COLLECTIONS.MARKS, id)),

  // --- ATTENDANCE ---
  getAttendance: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    return snapshot.docs.map(doc => convertDoc<AttendanceRecord>(doc));
  },
  recordAttendance: async (record: Omit<AttendanceRecord, 'id'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.ATTENDANCE), { ...record, recordedAt: new Date().toISOString() });
    return { ...record, id: docRef.id };
  },

  // --- UNEB ---
  getUNEBCandidates: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.UNEB));
    return snapshot.docs.map(doc => convertDoc<UNEBCandidate>(doc));
  },
  registerUNEBCandidate: async (candidate: Omit<UNEBCandidate, 'id'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.UNEB), { ...candidate, registeredAt: new Date().toISOString() });
    return { ...candidate, id: docRef.id };
  },
  updateUNEBPayment: async (candidateId: string, amount: number) => {
    const docRef = doc(db, COLLECTIONS.UNEB, candidateId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        const candidate = snapshot.data() as UNEBCandidate;
        const newAmount = candidate.amountPaid + amount;
        const status = newAmount >= candidate.registrationFee ? 'Registered' : 'Incomplete';
        await updateDoc(docRef, { amountPaid: newAmount, status });
    }
  },
  deleteUNEBCandidate: async (id: string) => deleteDoc(doc(db, COLLECTIONS.UNEB, id)),

  // --- FINANCE ---
  getFinancialRecords: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.FINANCE));
    return snapshot.docs.map(doc => convertDoc<FinancialRecord>(doc));
  },
  getFinancialRecordsByStudent: async (studentId: string) => {
    const q = query(collection(db, COLLECTIONS.FINANCE), where("student_id", "==", studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertDoc<FinancialRecord>(doc));
  },
  addFinancialRecord: async (record: Omit<FinancialRecord, 'id' | 'date'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.FINANCE), { ...record, date: new Date().toISOString() });
    return { ...record, id: docRef.id };
  },
  deleteFinancialRecord: async (id: string) => deleteDoc(doc(db, COLLECTIONS.FINANCE, id)),
  getFeeSummary: async (studentId: string): Promise<FeeSummary> => {
    const q = query(collection(db, COLLECTIONS.FINANCE), where("student_id", "==", studentId));
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(doc => convertDoc<FinancialRecord>(doc));
    
    const billed = records.filter(r => r.type === 'debit').reduce((sum, r) => sum + r.amount, 0);
    const paid = records.filter(r => r.type === 'credit').reduce((sum, r) => sum + r.amount, 0);
    
    return {
      student_id: studentId,
      total_billed: billed,
      total_paid: paid,
      balance: billed - paid
    };
  },

  // --- FEE STRUCTURES ---
  getFeeStructures: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.FEES));
    return snapshot.docs.map(doc => convertDoc<FeeStructure>(doc));
  },
  addFeeStructure: async (fs: Omit<FeeStructure, 'id'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.FEES), { ...fs, createdAt: new Date().toISOString() });
    return { ...fs, id: docRef.id };
  },
  deleteFeeStructure: async (id: string) => deleteDoc(doc(db, COLLECTIONS.FEES, id)),

  // --- EXAMS ---
  getExamSchedules: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.EXAMS));
    return snapshot.docs.map(doc => convertDoc<ExamSchedule>(doc));
  },
  addExamSchedule: async (schedule: Omit<ExamSchedule, 'id'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.EXAMS), { ...schedule, createdAt: new Date().toISOString() });
    return { ...schedule, id: docRef.id };
  },
  deleteExamSchedule: async (id: string) => deleteDoc(doc(db, COLLECTIONS.EXAMS, id)),

  // --- ANNOUNCEMENTS ---
  getAnnouncements: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ANNOUNCEMENTS));
    return snapshot.docs.map(doc => convertDoc<Announcement>(doc)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addAnnouncement: async (ann: Omit<Announcement, 'id'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), { ...ann, createdAt: new Date().toISOString() });
    return { ...ann, id: docRef.id };
  },
  deleteAnnouncement: async (id: string) => deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, id)),

  // --- REPORT CARD ACCESS ---
  getReportAccessStatus: async (studentId: string, year: number, term: string): Promise<boolean> => {
    // Composite key query or ID?
    // Let's use a query
    const q = query(
        collection(db, COLLECTIONS.REPORT_ACCESS), 
        where("studentId", "==", studentId),
        where("year", "==", year),
        where("term", "==", term)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    const record = convertDoc<ReportCardAccess>(snapshot.docs[0]);
    return record.paid;
  },
  recordReportAccessPayment: async (studentId: string, year: number, term: string): Promise<void> => {
    await addDoc(collection(db, COLLECTIONS.REPORT_ACCESS), {
      studentId,
      year,
      term,
      paid: true,
      paymentDate: new Date().toISOString()
    });
  },

  // --- WEEKLY REPORTS ---
  getWeeklyReports: async () => {
    const snapshot = await getDocs(collection(db, COLLECTIONS.WEEKLY_REPORTS));
    return snapshot.docs.map(doc => convertDoc<WeeklyReport>(doc)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addWeeklyReport: async (report: Omit<WeeklyReport, 'id'>) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.WEEKLY_REPORTS), { ...report, createdAt: new Date().toISOString() });
    return { ...report, id: docRef.id };
  },
  updateWeeklyReport: async (report: WeeklyReport) => {
    const { id, ...data } = report;
    await updateDoc(doc(db, COLLECTIONS.WEEKLY_REPORTS, String(id)), data);
  },
  deleteWeeklyReport: async (id: string) => deleteDoc(doc(db, COLLECTIONS.WEEKLY_REPORTS, id))
};
