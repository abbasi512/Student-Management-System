export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  createdAt: string;
  studentProfile?: {
    studentId: string;
    phone?: string | null;
    address?: string | null;
    dateOfBirth?: string | null;
    bio?: string | null;
    gender?: string | null;
    nationality?: string | null;
    emergencyContact?: string | null;
  } | null;
  teacherProfile?: {
    employeeId: string;
    department?: string | null;
    phone?: string | null;
    bio?: string | null;
    qualification?: string | null;
    specialization?: string | null;
    officeHours?: string | null;
  } | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
    role?: Role;
    avatar?: string | null;
  } | null;
  _count?: {
    enrollments: number;
    assignments: number;
  };
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING";
  read: boolean;
  createdAt: string;
};

export type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  teacherId: string;
  course: Course;
  submissions?: Submission[];
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  status: "SUBMITTED" | "GRADED";
  grade?: Grade | null;
  student?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
};

export type Grade = {
  id: string;
  submissionId: string;
  studentId: string;
  teacherId: string;
  score: number;
  feedback?: string | null;
  createdAt?: string;
};

export type AttendanceRecord = {
  id: string;
  courseId: string;
  studentId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  course: Course;
  student?: {
    id: string;
    name: string;
    email: string;
  };
};

export type Enrollment = {
  id: string;
  studentId: string;
  courseId: string;
  createdAt: string;
  course: Course;
};

export type DashboardStats = Record<string, number>;

export type UserProfileResponse = AuthUser & {
  enrollments?: Enrollment[];
  attendance?: AttendanceRecord[];
  gradesReceived?: Array<{
    id: string;
    score: number;
    feedback?: string | null;
    submission: {
      assignment: {
        title: string;
      };
    };
    teacher: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  notifications?: Notification[];
};
