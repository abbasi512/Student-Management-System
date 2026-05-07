export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export type StudentProfile = {
  studentId?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality?: string | null;
  emergencyContact?: string | null;
  bio?: string | null;
};

export type TeacherProfile = {
  employeeId?: string | null;
  phone?: string | null;
  department?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  officeHours?: string | null;
  bio?: string | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  createdAt: string;
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  credits: number;
  capacity: number;
  teacher?: { id?: string; name: string; email: string } | null;
  _count?: { enrollments: number; assignments: number };
  isEnrolled?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  createdAt: string;
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
};

export type Submission = {
  id: string;
  content?: string | null;
  submittedAt: string;
  grade?: number | null;
  score?: number | null;
  feedback?: string | null;
  status: "SUBMITTED" | "GRADED" | "LATE";
};

export type Assignment = {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  maxScore: number;
  isPublished: boolean;
  course?: { id: string; code: string; name: string };
  submission?: Submission | null;
  submissions?: Submission[];
};

export type Notification = {
  id: string;
  title?: string | null;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ASSIGNMENT" | "GRADE" | "ENROLLMENT" | "ATTENDANCE";
  read: boolean;
  createdAt: string;
};

export type DashboardStats = Record<string, number | undefined>;

export type AttendanceRecord = {
  studentId: string;
  studentName: string;
  present: boolean;
};
