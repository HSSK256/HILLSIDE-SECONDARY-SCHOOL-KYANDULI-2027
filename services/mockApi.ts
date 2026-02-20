
import { Student, Mark, User, UserRole, AttendanceRecord, Teacher, Parent, Subject, UNEBCandidate, FinancialRecord, FeeSummary, FeeStructure, ExamSchedule, Announcement, RegisteredUser, ReportCardAccess, WeeklyReport } from '../types';
import { firestoreService } from './firestoreService';

const DB_NAME = 'HillsideSchoolDB';
const DB_VERSION = 1;

// Object Store Names
const STORES = {
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

// Initial Data
const defaultStudents: Student[] = [
  { id: 1, name: 'John Doe', class_id: 'S.4A', stream: 'North', gender: 'Male', admission_number: 'HSS-2024-001', active: true, parentId: 101, createdAt: new Date().toISOString() },
  { id: 2, name: 'Jane Smith', class_id: 'S.3A', stream: 'South', gender: 'Female', admission_number: 'HSS-2024-002', active: true, parentId: 101, createdAt: new Date().toISOString() },
  { id: 3, name: 'Alice Wong', class_id: 'S.4B', stream: 'East', gender: 'Female', admission_number: 'HSS-2024-003', active: true, parentId: 102, createdAt: new Date().toISOString() },
];

const defaultUsers: RegisteredUser[] = [
  { id: 1, username: 'admin', password: 'password', role: UserRole.ADMIN, name: 'System Administrator', schoolId: 'ADM-001', createdAt: new Date().toISOString() },
  { id: 2, username: 'teacher', password: 'password', role: UserRole.TEACHER, name: 'Senior Teacher', schoolId: 'TR-001', createdAt: new Date().toISOString() },
  { id: 3, username: 'parent', password: 'password', role: UserRole.PARENT, name: 'Parent Representative', schoolId: 'PR-001', createdAt: new Date().toISOString() }
];

const defaultTeachers: Teacher[] = [
  { 
    id: 1, 
    name: 'Mr. David Mutua', 
    staff_id: 'TSC-101', 
    subjects: ['Mathematics', 'Physics'], 
    classes: ['S.4A', 'S.3B'], 
    assignments: [
      { id: 1, subject: 'Mathematics', classId: 'S.4A', day: 'Monday', time: '08:00 - 09:20', room: 'Room 12' },
      { id: 2, subject: 'Physics', classId: 'S.3B', day: 'Monday', time: '09:20 - 10:40', room: 'Lab 2' },
      { id: 3, subject: 'Mathematics', classId: 'S.4A', day: 'Tuesday', time: '14:00 - 15:20', room: 'Room 12' },
      { id: 4, subject: 'Physics', classId: 'S.3B', day: 'Wednesday', time: '11:00 - 12:20', room: 'Lab 2' }
    ],
    department: 'Science', 
    email: 'd.mutua@hillside.ac.ke',
    createdAt: new Date().toISOString()
  },
  { 
    id: 2, 
    name: 'Ms. Sarah Kamau', 
    staff_id: 'TSC-102', 
    subjects: ['English', 'History'], 
    classes: ['S.1A', 'S.2B'], 
    assignments: [
      { id: 1, subject: 'English', classId: 'S.1A', day: 'Monday', time: '10:00 - 11:20', room: 'Room 4' },
      { id: 2, subject: 'History', classId: 'S.2B', day: 'Tuesday', time: '08:00 - 09:20', room: 'Room 6' }
    ],
    department: 'Humanities', 
    email: 's.kamau@hillside.ac.ke',
    createdAt: new Date().toISOString()
  },
];

const defaultParents: Parent[] = [
  { id: 101, name: 'Mr. Peter Doe', username: 'parent', childrenIds: [1, 2], phone: '+256780151137' },
  { id: 102, name: 'Mrs. Mary Wong', username: 'mary.wong', childrenIds: [3], phone: '+254722334455' },
];

const defaultSubjects: Subject[] = [
  { id: 'math', name: 'Mathematics', code: 'MAT-101', department: 'Science', createdAt: new Date().toISOString() },
  { id: 'eng', name: 'English', code: 'ENG-101', department: 'Languages', createdAt: new Date().toISOString() },
  { id: 'phy', name: 'Physics', code: 'PHY-101', department: 'Science', createdAt: new Date().toISOString() },
  { id: 'his', name: 'History', code: 'HIS-101', department: 'Humanities', createdAt: new Date().toISOString() },
];

const defaultMarks: Mark[] = [
  { id: 1, student_id: 1, subject_id: 'Mathematics', marks: 85, term: 'Term 1', date: new Date().toISOString() },
  { id: 2, student_id: 1, subject_id: 'English', marks: 78, term: 'Term 1', date: new Date().toISOString() },
  { id: 3, student_id: 2, subject_id: 'Mathematics', marks: 92, term: 'Term 1', date: new Date().toISOString() },
];

const defaultAttendance: AttendanceRecord[] = [
  { id: 1, student_id: 1, date: '2024-05-20', status: 'present', recordedAt: new Date().toISOString() },
];

const defaultUnebCandidates: UNEBCandidate[] = [
  {
    id: 1,
    studentId: 1,
    indexNumber: 'U0001/001',
    centerNumber: 'U0001',
    level: 'UCE',
    year: 2024,
    registrationFee: 250000,
    amountPaid: 250000,
    subjects: ['Math', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'CRE'],
    status: 'Registered',
    registeredAt: new Date().toISOString()
  }
];

const defaultFinancialRecords: FinancialRecord[] = [
  { id: 1, student_id: 1, amount: 800000, type: 'debit', description: 'Tuition Fee - Term 1', date: new Date().toISOString(), category: 'Tuition' },
  { id: 2, student_id: 1, amount: 500000, type: 'credit', description: 'Fee Payment - Ref: BANK_001', date: new Date().toISOString(), category: 'Tuition' },
  { id: 3, student_id: 2, amount: 800000, type: 'debit', description: 'Tuition Fee - Term 1', date: new Date().toISOString(), category: 'Tuition' },
  { id: 4, student_id: 2, amount: 800000, type: 'credit', description: 'Fee Payment - Full', date: new Date().toISOString(), category: 'Tuition' },
];

const defaultFeeStructures: FeeStructure[] = [
  { id: 1, year: 2024, term: 'Term 1', class_level: 'S.1A', tuition: 600000, uniform: 150000, boarding: 0, development: 50000, other: 20000, createdAt: new Date().toISOString() },
  { id: 2, year: 2024, term: 'Term 1', class_level: 'S.4A', tuition: 750000, uniform: 0, boarding: 400000, development: 50000, other: 100000, createdAt: new Date().toISOString() }
];

const defaultExamSchedules: ExamSchedule[] = [
  { id: 1, subject: 'Mathematics', classId: 'S.4A', date: '2024-11-01', startTime: '09:00', endTime: '11:30', room: 'Main Hall', invigilator: 'Mr. David Mutua', createdAt: new Date().toISOString() },
  { id: 2, subject: 'English', classId: 'S.4A', date: '2024-11-02', startTime: '09:00', endTime: '11:00', room: 'Main Hall', invigilator: 'Ms. Sarah Kamau', createdAt: new Date().toISOString() }
];

const defaultAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "End of Term Exams",
    date: "2024-10-20",
    content: "The final examinations for all forms will begin on the 1st of November. Please review your schedules in the departmental offices.",
    tag: "Exam",
    color: "bg-blue-100 text-blue-700",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Parent-Teacher Association Meeting",
    date: "2024-10-22",
    content: "Join us this Friday at 4 PM in the Main Hall for our monthly briefing on student welfare, infrastructure projects, and academic progress.",
    tag: "Event",
    color: "bg-emerald-100 text-emerald-700",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Sports Day Rescheduled",
    date: "2024-10-25",
    content: "Due to unexpected weather conditions, the inter-school sports gala is moved to next Wednesday. All participants should check with the sports master.",
    tag: "Sports",
    color: "bg-amber-100 text-amber-700",
    createdAt: new Date().toISOString()
  }
];

const defaultReportAccess: ReportCardAccess[] = [];


// IndexedDB Helper
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      Object.values(STORES).forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const transaction = async <T>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = callback(store) as IDBRequest<T>;

    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      tx.oncomplete = () => resolve(undefined as unknown as T);
      tx.onerror = () => reject(tx.error);
    }
  });
};

const getAll = <T>(storeName: string): Promise<T[]> => {
  return transaction(storeName, 'readonly', store => store.getAll());
};

const add = <T>(storeName: string, item: T): Promise<IDBValidKey> => {
  return transaction(storeName, 'readwrite', store => store.put(item));
};

const remove = (storeName: string, id: number | string): Promise<void> => {
  return transaction(storeName, 'readwrite', store => store.delete(id));
};

// Seed Defaults if Empty
const seedDefaults = async () => {
  const db = await openDB();
  const checkAndSeed = async (storeName: string, defaults: any[]) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        const writeTx = db.transaction(storeName, 'readwrite');
        const writeStore = writeTx.objectStore(storeName);
        defaults.forEach(item => writeStore.put(item));
      }
    };
  };

  await checkAndSeed(STORES.STUDENTS, defaultStudents);
  await checkAndSeed(STORES.TEACHERS, defaultTeachers);
  await checkAndSeed(STORES.PARENTS, defaultParents);
  await checkAndSeed(STORES.SUBJECTS, defaultSubjects);
  await checkAndSeed(STORES.MARKS, defaultMarks);
  await checkAndSeed(STORES.ATTENDANCE, defaultAttendance);
  await checkAndSeed(STORES.UNEB, defaultUnebCandidates);
  await checkAndSeed(STORES.FINANCE, defaultFinancialRecords);
  await checkAndSeed(STORES.FEES, defaultFeeStructures);
  await checkAndSeed(STORES.EXAMS, defaultExamSchedules);
  await checkAndSeed(STORES.ANNOUNCEMENTS, defaultAnnouncements);
  await checkAndSeed(STORES.USERS, defaultUsers);
  await checkAndSeed(STORES.REPORT_ACCESS, defaultReportAccess);
};

// Initialize DB
seedDefaults().catch(console.error);

const mockImplementation = {
  // --- USER MANAGEMENT (ACCESS CONTROL) ---
  getUsers: async () => getAll<RegisteredUser>(STORES.USERS),
  addUser: async (user: RegisteredUser) => add(STORES.USERS, { ...user, id: Date.now(), createdAt: new Date().toISOString() }),
  updateUser: async (user: RegisteredUser) => add(STORES.USERS, user),
  deleteUser: async (id: number) => remove(STORES.USERS, id),
  verifyUser: async (username: string, password: string): Promise<RegisteredUser | undefined> => {
    const users = await getAll<RegisteredUser>(STORES.USERS);
    return users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  },

  // --- STUDENTS ---
  getStudents: async () => {
    const students = await getAll<Student>(STORES.STUDENTS);
    return students.sort((a, b) => a.name.localeCompare(b.name));
  },
  getStudentByAdmissionNumber: async (admissionNumber: string): Promise<Student | undefined> => {
    const students = await getAll<Student>(STORES.STUDENTS);
    return students.find(s => s.admission_number.toLowerCase() === admissionNumber.toLowerCase());
  },
  addStudent: async (student: Omit<Student, 'id' | 'active'>, initialFees?: { tuition: number, uniform: number, previousBalance: number }) => {
    const newStudent = { ...student, id: Date.now(), active: true, createdAt: new Date().toISOString() };
    await add(STORES.STUDENTS, newStudent);
    
    if (initialFees) {
      const now = new Date().toISOString();
      if (initialFees.tuition > 0) {
        await add(STORES.FINANCE, {
          id: Date.now() + 1,
          student_id: newStudent.id,
          amount: initialFees.tuition,
          type: 'debit',
          description: 'Initial Tuition Billing',
          date: now,
          category: 'Tuition'
        });
      }
      if (initialFees.uniform > 0) {
        await add(STORES.FINANCE, {
          id: Date.now() + 2,
          student_id: newStudent.id,
          amount: initialFees.uniform,
          type: 'debit',
          description: 'Initial Uniform Billing',
          date: now,
          category: 'Uniform'
        });
      }
      if (initialFees.previousBalance > 0) {
        await add(STORES.FINANCE, {
          id: Date.now() + 3,
          student_id: newStudent.id,
          amount: initialFees.previousBalance,
          type: 'debit',
          description: 'Brought-forward Balance (Transfer/Arrears)',
          date: now,
          category: 'Other'
        });
      } else if (initialFees.previousBalance < 0) {
        await add(STORES.FINANCE, {
          id: Date.now() + 4,
          student_id: newStudent.id,
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
  updateStudent: async (student: Student) => add(STORES.STUDENTS, { ...student, updatedAt: new Date().toISOString() }),
  deleteStudent: async (id: number) => remove(STORES.STUDENTS, id),

  // --- TEACHERS ---
  getTeachers: async () => getAll<Teacher>(STORES.TEACHERS),
  addTeacher: async (teacher: Omit<Teacher, 'id'>) => add(STORES.TEACHERS, { ...teacher, id: Date.now(), createdAt: new Date().toISOString() }),
  deleteTeacher: async (id: number) => remove(STORES.TEACHERS, id),

  // --- SUBJECTS ---
  getSubjects: async () => getAll<Subject>(STORES.SUBJECTS),
  addSubject: async (subject: Subject) => add(STORES.SUBJECTS, {...subject, createdAt: new Date().toISOString()}),
  deleteSubject: async (id: string) => remove(STORES.SUBJECTS, id),

  // --- PARENTS ---
  getParents: async () => getAll<Parent>(STORES.PARENTS),
  getParentByUsername: async (username: string) => {
    const parents = await getAll<Parent>(STORES.PARENTS);
    return parents.find(p => p.username === username);
  },
  getChildrenOfParent: async (parentId: number) => {
    const students = await getAll<Student>(STORES.STUDENTS);
    return students.filter(s => s.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
  },

  // --- MARKS ---
  getMarks: async () => getAll<Mark>(STORES.MARKS),
  getMarksByStudent: async (studentId: number) => {
    const marks = await getAll<Mark>(STORES.MARKS);
    return marks.filter(m => m.student_id === studentId);
  },
  addMark: async (mark: Omit<Mark, 'id' | 'date'>) => {
    return add(STORES.MARKS, { ...mark, id: Date.now(), date: new Date().toISOString() });
  },
  deleteMark: async (id: number) => remove(STORES.MARKS, id),

  // --- ATTENDANCE ---
  getAttendance: async () => getAll<AttendanceRecord>(STORES.ATTENDANCE),
  recordAttendance: async (record: Omit<AttendanceRecord, 'id'>) => add(STORES.ATTENDANCE, { ...record, id: Date.now(), recordedAt: new Date().toISOString() }),

  // --- UNEB ---
  getUNEBCandidates: async () => getAll<UNEBCandidate>(STORES.UNEB),
  registerUNEBCandidate: async (candidate: Omit<UNEBCandidate, 'id'>) => add(STORES.UNEB, { ...candidate, id: Date.now(), registeredAt: new Date().toISOString() }),
  updateUNEBPayment: async (candidateId: number, amount: number) => {
    const candidates = await getAll<UNEBCandidate>(STORES.UNEB);
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      candidate.amountPaid += amount;
      candidate.status = candidate.amountPaid >= candidate.registrationFee ? 'Registered' : 'Incomplete';
      await add(STORES.UNEB, candidate);
    }
  },
  deleteUNEBCandidate: async (id: number) => remove(STORES.UNEB, id),

  // --- FINANCE ---
  getFinancialRecords: async () => getAll<FinancialRecord>(STORES.FINANCE),
  getFinancialRecordsByStudent: async (studentId: number) => {
    const records = await getAll<FinancialRecord>(STORES.FINANCE);
    return records.filter(r => r.student_id === studentId);
  },
  addFinancialRecord: async (record: Omit<FinancialRecord, 'id' | 'date'>) => {
    return add(STORES.FINANCE, { ...record, id: Date.now(), date: new Date().toISOString() });
  },
  deleteFinancialRecord: async (id: number) => remove(STORES.FINANCE, id),
  getFeeSummary: async (studentId: number): Promise<FeeSummary> => {
    const records = await getAll<FinancialRecord>(STORES.FINANCE);
    const studentRecords = records.filter(r => r.student_id === studentId);
    const billed = studentRecords.filter(r => r.type === 'debit').reduce((sum, r) => sum + r.amount, 0);
    const paid = studentRecords.filter(r => r.type === 'credit').reduce((sum, r) => sum + r.amount, 0);
    return {
      student_id: studentId,
      total_billed: billed,
      total_paid: paid,
      balance: billed - paid
    };
  },

  // --- FEE STRUCTURES ---
  getFeeStructures: async () => getAll<FeeStructure>(STORES.FEES),
  addFeeStructure: async (fs: Omit<FeeStructure, 'id'>) => add(STORES.FEES, { ...fs, id: Date.now(), createdAt: new Date().toISOString() }),
  deleteFeeStructure: async (id: number) => remove(STORES.FEES, id),

  // --- EXAMS ---
  getExamSchedules: async () => getAll<ExamSchedule>(STORES.EXAMS),
  addExamSchedule: async (schedule: Omit<ExamSchedule, 'id'>) => add(STORES.EXAMS, { ...schedule, id: Date.now(), createdAt: new Date().toISOString() }),
  deleteExamSchedule: async (id: number) => remove(STORES.EXAMS, id),

  // --- ANNOUNCEMENTS ---
  getAnnouncements: async () => {
    const announcements = await getAll<Announcement>(STORES.ANNOUNCEMENTS);
    return announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addAnnouncement: async (ann: Omit<Announcement, 'id'>) => add(STORES.ANNOUNCEMENTS, { ...ann, id: Date.now(), createdAt: new Date().toISOString() }),
  deleteAnnouncement: async (id: number) => remove(STORES.ANNOUNCEMENTS, id),
  
  // --- REPORT CARD ACCESS ---
  getReportAccessStatus: async (studentId: number, year: number, term: string): Promise<boolean> => {
    const key = `${studentId}-${year}-${term}`;
    const record = await transaction(STORES.REPORT_ACCESS, 'readonly', store => store.get(key));
    return (record as ReportCardAccess)?.paid || false;
  },
  recordReportAccessPayment: async (studentId: number, year: number, term: string): Promise<void> => {
    const key = `${studentId}-${year}-${term}`;
    const paymentRecord: ReportCardAccess = {
      id: key,
      studentId,
      year,
      term,
      paid: true,
      paymentDate: new Date().toISOString()
    };
    await add(STORES.REPORT_ACCESS, paymentRecord);
  }
};

export const mockApi = import.meta.env.VITE_USE_FIRESTORE === 'true' ? firestoreService : mockImplementation;
