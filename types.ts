
export const UserRole = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number | string;
  username: string;
  role: UserRole;
  name: string;
}

export interface RegisteredUser extends User {
  password: string;
  schoolId?: string;
  details?: string;
  createdAt?: string;
  photo?: string;
}

export interface Student {
  id: number | string;
  name: string;
  class_id: string;
  stream: string;
  gender: string;
  admission_number: string;
  active: boolean;
  parentId?: number | string;
  parentName?: string;
  parentPhone?: string;
  photo?: string; // Base64 or URL
  bio?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherAssignment {
  id: number | string;
  subject: string;
  classId: string;
  day: string;
  time: string;
  room: string;
}

export interface Teacher {
  id: number | string;
  name: string;
  staff_id: string;
  subjects: string[];
  classes: string[];
  assignments: TeacherAssignment[];
  department: string;
  email: string;
  createdAt?: string;
}

export interface Parent {
  id: number | string;
  name: string;
  username: string;
  childrenIds: (number | string)[];
  phone: string;
}

export interface Mark {
  id: number | string;
  student_id: number | string;
  subject_id: string;
  marks: number;
  term: string;
  date: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: number | string;
  student_id: number | string;
  date: string;
  status: 'present' | 'absent' | 'late';
  recordedAt?: string;
}

export interface UNEBCandidate {
  id: number | string;
  studentId: number | string;
  indexNumber: string;
  centerNumber: string;
  level: 'UCE' | 'UACE';
  year: number;
  registrationFee: number;
  amountPaid: number;
  subjects: string[];
  status: 'Registered' | 'Pending' | 'Incomplete';
  registeredAt?: string;
}

export interface FinancialRecord {
  id: number | string;
  student_id: number | string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  category: 'Tuition' | 'Uniform' | 'Laboratory' | 'Transport' | 'Development' | 'Other';
}

export interface FeeSummary {
  student_id: number | string;
  total_billed: number;
  total_paid: number;
  balance: number;
}

export interface FeeStructure {
  id: number | string;
  year: number;
  term: string;
  class_level: string;
  tuition: number;
  uniform: number;
  boarding: number;
  development: number;
  other: number;
  createdAt?: string;
}

export interface ExamSchedule {
  id: number | string;
  subject: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilator?: string;
  createdAt?: string;
}

export interface Announcement {
  id: number | string;
  title: string;
  content: string;
  date: string;
  tag: 'General' | 'Exam' | 'Event' | 'Sports' | 'Finance' | 'Academic';
  color?: string;
  createdAt?: string;
}

export interface ReportCardAccess {
  id: string; // Composite key: "studentId-year-term"
  studentId: number | string;
  year: number;
  term: string;
  paid: boolean;
  paymentDate: string;
}

export interface Notification {
  id: number | string;
  message: string;
  recipientRoles: UserRole[];
  read: boolean;
  createdAt: Date;
  relatedLink?: string;
}

export interface WeeklyReport {
  id: number | string;
  title: string;
  date: string;
  weekNumber: number;
  term: string;
  summary: string;
  content: string;
  status: 'Published' | 'Draft';
  createdAt?: string;
}
