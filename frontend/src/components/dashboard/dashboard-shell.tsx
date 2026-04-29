"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import jsPDF from "jspdf";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  Bell,
  Users,
  UserCircle,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Upload,
  Camera,
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  BookMarked,
  BarChart3,
  Eye,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type {
  Assignment,
  AttendanceRecord,
  Course,
  DashboardStats,
  Notification,
  Role,
  UserProfileResponse,
  AuthUser,
} from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().optional(),
  department: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  emergencyContact: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  officeHours: z.string().optional(),
});

const courseSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(5),
  credits: z.number().min(1).max(10),
  capacity: z.number().min(1),
  teacherId: z.string().optional(),
});

const attendanceSchema = z.object({
  courseId: z.string().min(1),
  studentId: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
});

const assignmentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  dueDate: z.string().min(1),
  courseId: z.string().min(1),
});

const gradeSchema = z.object({
  submissionId: z.string().min(1),
  score: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

const submissionSchema = z.object({
  content: z.string().min(3, "Submission content must be at least 3 characters"),
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | "overview"
  | "profile"
  | "courses"
  | "assignments"
  | "attendance"
  | "grades"
  | "notifications"
  | "users"
  | "course-management";

type DashboardData = {
  stats: DashboardStats | null;
  profile: UserProfileResponse | null;
  courses: Course[];
  assignments: Assignment[];
  attendance: AttendanceRecord[];
  notifications: Notification[];
  users: AuthUser[];
};

// ─── Helper Components ────────────────────────────────────────────────────────

function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = { sm: 32, md: 40, lg: 80, xl: 120 };
  const px = sizes[size];
  const textSize = size === "xl" ? "text-3xl" : size === "lg" ? "text-2xl" : size === "sm" ? "text-xs" : "text-sm";

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold ${textSize}`}
      style={{ width: px, height: px, minWidth: px }}
    >
      {initials}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = "sky",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: "sky" | "indigo" | "emerald" | "amber" | "rose" | "violet";
}) {
  const colors = {
    sky: "bg-sky-50 text-sky-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, hydrated, bootstrap, logout } = useAuthStore();
  const validSections: Section[] = [
    "overview", "profile", "courses", "assignments",
    "attendance", "grades", "notifications", "users", "course-management",
  ];
  const initialSection = (searchParams.get("section") ?? "overview") as Section;

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>(
    validSections.includes(initialSection) ? initialSection : "overview",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [submissionTarget, setSubmissionTarget] = useState<string | null>(null);
  const [gradeTarget, setGradeTarget] = useState<{
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    content: string;
    submittedAt: string;
    existingScore?: number;
    existingFeedback?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: "danger" | "warning";
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const openConfirm = (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: "danger" | "warning";
    onConfirm: () => void;
  }) => setConfirmModal({ open: true, ...opts });

  const closeConfirm = () =>
    setConfirmModal((prev) => ({ ...prev, open: false }));

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: null,
    profile: null,
    courses: [],
    assignments: [],
    attendance: [],
    notifications: [],
    users: [],
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema) });
  const courseForm = useForm<z.infer<typeof courseSchema>>({ resolver: zodResolver(courseSchema), defaultValues: { credits: 3, capacity: 30 } });
  const attendanceForm = useForm<z.infer<typeof attendanceSchema>>({ resolver: zodResolver(attendanceSchema) });
  const assignmentForm = useForm<z.infer<typeof assignmentSchema>>({ resolver: zodResolver(assignmentSchema) });
  const gradeForm = useForm<z.infer<typeof gradeSchema>>({ resolver: zodResolver(gradeSchema) });
  const submissionForm = useForm<z.infer<typeof submissionSchema>>({ resolver: zodResolver(submissionSchema) });

  const isAdmin = user?.role === "ADMIN";
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  const fetchData = useCallback(
    async (currentUserRole: Role) => {
      const courseEndpoint = currentUserRole === "TEACHER" ? "/courses/teacher" : "/courses";
      const [stats, profile, courses, assignments, attendance, notifications] = await Promise.all([
        api.get<DashboardStats>("/dashboard"),
        api.get<UserProfileResponse>("/users/me"),
        api.get<Course[]>(courseEndpoint),
        api.get<Assignment[]>("/assignments"),
        api.get<AttendanceRecord[]>("/attendance"),
        api.get<Notification[]>("/notifications"),
      ]);

      const users = currentUserRole === "ADMIN" ? await api.get<AuthUser[]>("/users") : null;

      setDashboardData({
        stats: stats.data,
        profile: profile.data,
        courses: courses.data,
        assignments: assignments.data,
        attendance: attendance.data,
        notifications: notifications.data,
        users: users?.data || [],
      });

      const p = profile.data;
      profileForm.reset({
        name: p.name || "",
        phone: p.studentProfile?.phone || p.teacherProfile?.phone || "",
        address: p.studentProfile?.address || "",
        dateOfBirth: p.studentProfile?.dateOfBirth ? p.studentProfile.dateOfBirth.slice(0, 10) : "",
        bio: p.studentProfile?.bio || p.teacherProfile?.bio || "",
        department: p.teacherProfile?.department || "",
        gender: p.studentProfile?.gender || "",
        nationality: p.studentProfile?.nationality || "",
        emergencyContact: p.studentProfile?.emergencyContact || "",
        qualification: p.teacherProfile?.qualification || "",
        specialization: p.teacherProfile?.specialization || "",
        officeHours: p.teacherProfile?.officeHours || "",
      });
    },
    [profileForm],
  );

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const load = async () => {
      if (!hydrated) return;
      if (!user) { router.replace("/signin"); return; }
      setLoading(true);
      try {
        await fetchData(user.role);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [fetchData, hydrated, router, user]);

  const enrolledCourses = useMemo(
    () => dashboardData.profile?.enrollments?.map((item) => item.course.id) || [],
    [dashboardData.profile?.enrollments],
  );

  const teacherStudents = useMemo(() => {
    const seen = new Set<string>();
    return dashboardData.courses
      .flatMap(
        (course) =>
          (
            (
              course as Course & {
                enrollments?: Array<{ student: { id: string; name: string; email: string } }>;
              }
            ).enrollments || []
          ).map((e) => e.student),
      )
      .filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
  }, [dashboardData.courses]);

  const unreadCount = dashboardData.notifications.filter((n) => !n.read).length;

  const handleLogout = () => { logout(); router.push("/signin"); };

  const navItems: { id: Section; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; roles?: Role[] }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: UserCircle },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "attendance", label: "Attendance", icon: CalendarCheck },
    ...(isStudent ? [{ id: "grades" as Section, label: "Grades & Reports", icon: Award }] : []),
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    ...(isTeacher || isAdmin
      ? [{ id: "course-management" as Section, label: "Course Management", icon: BookMarked, roles: ["TEACHER", "ADMIN"] as Role[] }]
      : []),
    ...(isAdmin ? [{ id: "users" as Section, label: "User Administration", icon: Users, roles: ["ADMIN"] as Role[] }] : []),
  ];

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    try {
      await api.put("/users/me/profile", {
        ...values,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
      });
      toast.success("Profile updated successfully");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Failed to update profile");
    }
  });

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await api.post("/users/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Profile picture updated");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onCreateCourse = courseForm.handleSubmit(async (values) => {
    try {
      await api.post("/courses", values);
      courseForm.reset({ code: "", title: "", description: "", credits: 3, capacity: 30, teacherId: "" });
      toast.success("Course created successfully");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Failed to create course");
    }
  });

  const onMarkAttendance = attendanceForm.handleSubmit(async (values) => {
    try {
      await api.post("/attendance", { ...values, date: new Date(values.date).toISOString() });
      attendanceForm.reset();
      toast.success("Attendance saved");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Failed to save attendance");
    }
  });

  const onCreateAssignment = assignmentForm.handleSubmit(async (values) => {
    try {
      await api.post("/assignments", { ...values, dueDate: new Date(values.dueDate).toISOString() });
      assignmentForm.reset();
      toast.success("Assignment created");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Failed to create assignment");
    }
  });

  const onGradeSubmission = gradeForm.handleSubmit(async (values) => {
    try {
      await api.post("/assignments/grade", values);
      gradeForm.reset();
      setGradeTarget(null);
      toast.success("Submission graded successfully");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Failed to grade submission");
    }
  });

  const openGradeModal = (opts: typeof gradeTarget) => {
    if (!opts) return;
    setGradeTarget(opts);
    gradeForm.reset({
      submissionId: opts.submissionId,
      score: opts.existingScore ?? (undefined as unknown as number),
      feedback: opts.existingFeedback ?? "",
    });
  };

  const onSubmitAssignment = submissionForm.handleSubmit(async (values) => {
    if (!submissionTarget) return;
    try {
      await api.post(`/assignments/${submissionTarget}/submit`, { content: values.content });
      submissionForm.reset();
      setSubmissionTarget(null);
      toast.success("Assignment submitted");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Submission failed");
    }
  });

  const enrollInCourse = async (courseId: string) => {
    try {
      await api.post("/courses/enroll", { courseId });
      toast.success("Enrolled successfully");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Enrollment failed");
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Could not mark notification as read");
    }
  };

  const assignTeacher = async (courseId: string, teacherId: string) => {
    try {
      await api.put(`/courses/${courseId}/assign-teacher`, { teacherId });
      toast.success("Teacher assigned");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Could not assign teacher");
    }
  };

  const updateUserRole = async (userId: string, role: Role) => {
    try {
      await api.put(`/users/${userId}`, { role });
      toast.success("User updated");
      if (user) await fetchData(user.role);
    } catch {
      toast.error("Could not update user");
    }
  };

  const deleteUser = (userId: string, userName: string) => {
    openConfirm({
      title: "Delete User",
      message: `Are you sure you want to permanently delete "${userName}"? This action cannot be undone and will remove all their data.`,
      confirmLabel: "Delete User",
      variant: "danger",
      onConfirm: async () => {
        closeConfirm();
        try {
          await api.delete(`/users/${userId}`);
          toast.success("User deleted");
          if (user) await fetchData(user.role);
        } catch {
          toast.error("Could not delete user");
        }
      },
    });
  };

  const downloadReportCard = () => {
    if (!dashboardData.profile?.gradesReceived) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Student Report Card", 20, 25);
    doc.setFontSize(12);
    doc.text(`Name: ${dashboardData.profile.name}`, 20, 38);
    doc.text(`Email: ${dashboardData.profile.email}`, 20, 46);
    doc.text(`Student ID: ${dashboardData.profile.studentProfile?.studentId || "N/A"}`, 20, 54);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 62);
    doc.line(20, 68, 190, 68);
    let y = 76;
    if (dashboardData.profile.gradesReceived.length === 0) {
      doc.text("No grades recorded yet.", 20, y);
    } else {
      dashboardData.profile.gradesReceived.forEach((grade, index) => {
        doc.text(
          `${index + 1}. ${grade.submission.assignment.title} — ${grade.score}%${grade.feedback ? ` (${grade.feedback})` : ""}`,
          20,
          y,
        );
        y += 10;
      });
      const avg =
        dashboardData.profile.gradesReceived.reduce((sum, g) => sum + g.score, 0) /
        dashboardData.profile.gradesReceived.length;
      y += 4;
      doc.line(20, y, 190, y);
      y += 8;
      doc.setFontSize(13);
      doc.text(`Average Score: ${avg.toFixed(1)}%`, 20, y);
    }
    doc.save("report-card.pdf");
  };

  // ─── Section Renderers ───────────────────────────────────────────────────────

  const renderOverview = () => {
    const statConfig: { key: string; label: string; icon: React.ComponentType<{ className?: string }>; color: "sky" | "indigo" | "emerald" | "amber" | "rose" | "violet" }[] = [
      { key: "totalCourses", label: "Total Courses", icon: BookOpen, color: "sky" },
      { key: "totalStudents", label: "Total Students", icon: Users, color: "indigo" },
      { key: "totalEnrollments", label: "Enrollments", icon: GraduationCap, color: "emerald" },
      { key: "totalAssignments", label: "Assignments", icon: ClipboardList, color: "amber" },
      { key: "totalSubmissions", label: "Submissions", icon: CheckCircle, color: "violet" },
      { key: "totalAttendance", label: "Attendance Records", icon: CalendarCheck, color: "rose" },
      { key: "enrolledCourses", label: "Enrolled Courses", icon: BookOpen, color: "sky" },
      { key: "assignmentsSubmitted", label: "Submitted", icon: CheckCircle, color: "emerald" },
      { key: "assignmentsPending", label: "Pending", icon: Clock, color: "amber" },
      { key: "averageGrade", label: "Avg Grade", icon: Star, color: "indigo" },
      { key: "attendanceRate", label: "Attendance %", icon: TrendingUp, color: "violet" },
      { key: "unreadNotifications", label: "Unread Alerts", icon: Bell, color: "rose" },
      { key: "totalTeachers", label: "Teachers", icon: UserCircle, color: "indigo" },
      { key: "totalGrades", label: "Grades Given", icon: Award, color: "violet" },
      { key: "myCourses", label: "My Courses", icon: BookMarked, color: "sky" },
      { key: "pendingSubmissions", label: "Pending Reviews", icon: AlertCircle, color: "amber" },
      { key: "markedAttendance", label: "Attendance Marked", icon: CalendarCheck, color: "emerald" },
    ];

    const presentStats = dashboardData.stats
      ? Object.entries(dashboardData.stats).map(([key, value]) => {
          const cfg = statConfig.find((s) => s.key === key);
          return {
            key,
            label: cfg?.label ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
            value,
            icon: cfg?.icon ?? BarChart3,
            color: cfg?.color ?? "sky",
          };
        })
      : [];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
          <p className="mt-1 text-slate-500">Your academic dashboard at a glance.</p>
        </div>

        {presentStats.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {presentStats.map(({ key, label, value, icon, color }) => (
              <StatCard key={key} label={label} value={value} icon={icon} color={color as "sky"} />
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-slate-900">Recent Notifications</h3>
            <div className="mt-4 space-y-3">
              {dashboardData.notifications.slice(0, 4).length ? (
                dashboardData.notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 rounded-lg p-3 ${n.read ? "bg-slate-50" : "bg-sky-50"}`}
                  >
                    <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-sky-500"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-500">{n.message}</p>
                    </div>
                    <Badge variant={n.type === "SUCCESS" ? "success" : n.type === "WARNING" ? "warning" : "info"}>
                      {n.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No notifications.</p>
              )}
              {dashboardData.notifications.length > 4 && (
                <button
                  type="button"
                  onClick={() => setActiveSection("notifications")}
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  View all notifications →
                </button>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-900">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveSection("profile")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-sky-200 transition-colors"
              >
                <UserCircle className="h-6 w-6 text-sky-600" />
                Update Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("courses")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-sky-200 transition-colors"
              >
                <BookOpen className="h-6 w-6 text-sky-600" />
                {isStudent ? "Browse Courses" : "View Courses"}
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("assignments")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-sky-200 transition-colors"
              >
                <ClipboardList className="h-6 w-6 text-sky-600" />
                Assignments
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("attendance")}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-sky-200 transition-colors"
              >
                <CalendarCheck className="h-6 w-6 text-sky-600" />
                Attendance
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const p = dashboardData.profile;
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
          <p className="mt-1 text-slate-500">Manage your personal information and profile picture.</p>
        </div>

        {/* Avatar Section */}
        <Card>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative flex-shrink-0">
              <Avatar src={p?.avatar} name={p?.name || user?.name || "U"} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-white shadow-md hover:bg-sky-700 disabled:opacity-50 transition-colors"
              >
                {avatarUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-slate-900">{p?.name}</h3>
              <p className="text-slate-500">{p?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge variant="info">{p?.role}</Badge>
                {p?.studentProfile && (
                  <Badge variant="default">ID: {p.studentProfile.studentId}</Badge>
                )}
                {p?.teacherProfile && (
                  <Badge variant="default">EMP: {p.teacherProfile.employeeId}</Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Member since {p?.createdAt ? formatDate(p.createdAt) : "—"}
              </p>
            </div>
            <div className="sm:ml-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                {avatarUploading ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          </div>
        </Card>

        {/* Profile Form */}
        <Card>
          <h3 className="font-semibold text-slate-900">Personal Information</h3>
          <form onSubmit={onSaveProfile} className="mt-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="mb-4 text-sm font-medium text-slate-600 uppercase tracking-wide">Basic Information</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input placeholder="Full name" {...profileForm.register("name")} />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-rose-500">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <Input placeholder="+1 (555) 000-0000" {...profileForm.register("phone")} />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    {...profileForm.register("bio")}
                  />
                </div>
              </div>
            </div>

            {/* Student-specific fields */}
            {isStudent && (
              <div>
                <h4 className="mb-4 text-sm font-medium text-slate-600 uppercase tracking-wide">Student Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                    <Input type="date" {...profileForm.register("dateOfBirth")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Gender</label>
                    <select
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      {...profileForm.register("gender")}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Nationality</label>
                    <Input placeholder="Nationality" {...profileForm.register("nationality")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Emergency Contact</label>
                    <Input placeholder="Emergency contact number" {...profileForm.register("emergencyContact")} />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Address</label>
                    <Input placeholder="Full address" {...profileForm.register("address")} />
                  </div>
                </div>
              </div>
            )}

            {/* Teacher-specific fields */}
            {isTeacher && (
              <div>
                <h4 className="mb-4 text-sm font-medium text-slate-600 uppercase tracking-wide">Academic Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Department</label>
                    <Input placeholder="e.g. Computer Science" {...profileForm.register("department")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Qualification</label>
                    <Input placeholder="e.g. PhD, MSc" {...profileForm.register("qualification")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Specialization</label>
                    <Input placeholder="e.g. Machine Learning" {...profileForm.register("specialization")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Office Hours</label>
                    <Input placeholder="e.g. Mon-Wed 2–4 PM" {...profileForm.register("officeHours")} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit">Save Changes</Button>
              <button
                type="button"
                onClick={() => profileForm.reset()}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Reset
              </button>
            </div>
          </form>
        </Card>

        {/* Account Info */}
        <Card>
          <h3 className="font-semibold text-slate-900">Account Information</h3>
          <div className="mt-4 divide-y divide-slate-100">
            {[
              { label: "Email", value: p?.email },
              { label: "Role", value: p?.role },
              ...(p?.studentProfile ? [{ label: "Student ID", value: p.studentProfile.studentId }] : []),
              ...(p?.teacherProfile ? [{ label: "Employee ID", value: p.teacherProfile.employeeId }] : []),
              { label: "Member Since", value: p?.createdAt ? formatDate(p.createdAt) : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {isStudent && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Academic Report</h3>
                <p className="mt-1 text-sm text-slate-500">Download your complete grade report as a PDF.</p>
              </div>
              <Button onClick={downloadReportCard}>Download Report Card</Button>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderCourses = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Courses</h2>
        <p className="mt-1 text-slate-500">
          {isStudent ? "Browse and enroll in available courses." : "All courses in the system."}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {dashboardData.courses.length === 0 ? (
          <p className="text-sm text-slate-500 col-span-2">No courses available.</p>
        ) : (
          dashboardData.courses.map((course) => (
            <Card key={course.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{course.code}</Badge>
                    <span className="text-xs text-slate-400">{course.credits} credits</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{course.description}</p>
                  {course.teacher && (
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar src={course.teacher.avatar} name={course.teacher.name} size="sm" />
                      <span className="text-xs text-slate-500">{course.teacher.name}</span>
                    </div>
                  )}
                </div>
                <Link href={`/courses/${course.id}`} className="flex-shrink-0 text-sm font-medium text-sky-600 hover:text-sky-700">
                  Details <ChevronRight className="inline h-3 w-3" />
                </Link>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4 text-xs text-slate-400">
                  <span>{course._count?.enrollments || 0}/{course.capacity} enrolled</span>
                  <span>{course._count?.assignments || 0} assignments</span>
                </div>
                {isStudent && (
                  <Button
                    disabled={enrolledCourses.includes(course.id)}
                    onClick={() => enrollInCourse(course.id)}
                  >
                    {enrolledCourses.includes(course.id) ? "Enrolled" : "Enroll Now"}
                  </Button>
                )}
                {isAdmin && (
                  <select
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    onChange={(e) => e.target.value ? assignTeacher(course.id, e.target.value) : undefined}
                    defaultValue=""
                  >
                    <option value="">Assign teacher</option>
                    {dashboardData.users.filter((u) => u.role === "TEACHER").map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Assignments</h2>
        <p className="mt-1 text-slate-500">
          {isStudent
            ? "View and submit your assignments."
            : "Review submissions and grade student work."}
        </p>
      </div>

      {/* Student: submit assignment modal */}
      {submissionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Submit Assignment</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Your response will be sent to the teacher for review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSubmissionTarget(null); submissionForm.reset(); }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={onSubmitAssignment} className="mt-4 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Submission Content or URL
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste your work, a GitHub repository URL, or your written response here..."
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  {...submissionForm.register("content")}
                />
                {submissionForm.formState.errors.content && (
                  <p className="text-xs text-rose-500">
                    {submissionForm.formState.errors.content.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit">Submit Assignment</Button>
                <button
                  type="button"
                  onClick={() => { setSubmissionTarget(null); submissionForm.reset(); }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher / Admin: grade submission modal */}
      {gradeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">Review Submission</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {gradeTarget.assignmentTitle} · {gradeTarget.studentName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setGradeTarget(null); gradeForm.reset(); }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Submission content */}
            <div className="px-6 py-4">
              <div className="mb-1 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Submitted work
                </span>
                <span className="ml-auto text-xs text-slate-400">
                  {formatDate(gradeTarget.submittedAt)}
                </span>
              </div>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap break-words">
                {gradeTarget.content}
              </div>
            </div>

            {/* Grade form */}
            <form onSubmit={onGradeSubmission} className="border-t border-slate-100 px-6 py-4 space-y-4">
              <input type="hidden" {...gradeForm.register("submissionId")} />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">
                    Score <span className="text-slate-400">(0 – 100)</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 85"
                    {...gradeForm.register("score", { valueAsNumber: true })}
                  />
                  {gradeForm.formState.errors.score && (
                    <p className="text-xs text-rose-500">
                      {gradeForm.formState.errors.score.message}
                    </p>
                  )}
                </div>
                <div className="flex items-end pb-0.5">
                  {/* Grade preview */}
                  {gradeForm.watch("score") >= 0 && !isNaN(gradeForm.watch("score")) && (
                    <div
                      className={`flex h-10 flex-1 items-center justify-center rounded-xl text-lg font-bold ${
                        gradeForm.watch("score") >= 80
                          ? "bg-emerald-50 text-emerald-600"
                          : gradeForm.watch("score") >= 50
                          ? "bg-amber-50 text-amber-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {gradeForm.watch("score")}%
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Feedback <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Great work! Consider improving..."
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  {...gradeForm.register("feedback")}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit">
                  {gradeTarget.existingScore !== undefined ? "Update Grade" : "Submit Grade"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setGradeTarget(null); gradeForm.reset(); }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment list */}
      <div className="space-y-4">
        {dashboardData.assignments.length === 0 ? (
          <p className="text-sm text-slate-500">No assignments found.</p>
        ) : (
          dashboardData.assignments.map((assignment) => {
            const isOverdue = new Date(assignment.dueDate) < new Date();
            const mySubmission = assignment.submissions?.find(
              (s) => isStudent && s.studentId === dashboardData.profile?.id,
            );
            const submittedCount = assignment.submissions?.length ?? 0;
            const pendingCount =
              assignment.submissions?.filter((s) => s.status !== "GRADED").length ?? 0;

            return (
              <Card key={assignment.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                      {isStudent && isOverdue && !mySubmission && (
                        <Badge variant="danger">Overdue</Badge>
                      )}
                      {isStudent && mySubmission && (
                        <Badge variant={mySubmission.status === "GRADED" ? "success" : "warning"}>
                          {mySubmission.status === "GRADED"
                            ? `Graded: ${mySubmission.grade?.score}%`
                            : "Submitted — awaiting review"}
                        </Badge>
                      )}
                      {(isTeacher || isAdmin) && pendingCount > 0 && (
                        <Badge variant="warning">{pendingCount} pending review</Badge>
                      )}
                      {(isTeacher || isAdmin) && pendingCount === 0 && submittedCount > 0 && (
                        <Badge variant="success">All graded</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{assignment.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>Course: {assignment.course?.title}</span>
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                      {(isTeacher || isAdmin) && (
                        <span>{submittedCount} submission{submittedCount !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                    {/* Student: show teacher feedback */}
                    {isStudent && mySubmission?.grade?.feedback && (
                      <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
                        <span className="font-medium">Teacher feedback:</span>{" "}
                        {mySubmission.grade.feedback}
                      </p>
                    )}
                  </div>

                  {/* Student: submit button */}
                  {isStudent && !mySubmission && (
                    <Button
                      onClick={() => {
                        setSubmissionTarget(assignment.id);
                        submissionForm.reset();
                      }}
                    >
                      Submit
                    </Button>
                  )}
                </div>

                {/* Teacher / Admin: submissions table */}
                {(isTeacher || isAdmin) && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {submittedCount === 0
                        ? "No submissions yet"
                        : `Submissions (${submittedCount})`}
                    </p>
                    {submittedCount > 0 && (
                      <div className="space-y-2">
                        {(assignment.submissions ?? []).map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar
                                src={(sub.student as { avatar?: string | null } & typeof sub.student)?.avatar}
                                name={sub.student?.name ?? "S"}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {sub.student?.name ?? "Unknown"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Submitted {formatDate(sub.submittedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {sub.status === "GRADED" && sub.grade && (
                                <span
                                  className={`text-sm font-bold ${
                                    sub.grade.score >= 80
                                      ? "text-emerald-600"
                                      : sub.grade.score >= 50
                                      ? "text-amber-600"
                                      : "text-rose-600"
                                  }`}
                                >
                                  {sub.grade.score}%
                                </span>
                              )}
                              <Badge
                                variant={sub.status === "GRADED" ? "success" : "warning"}
                              >
                                {sub.status === "GRADED" ? "Graded" : "Pending"}
                              </Badge>
                              <button
                                type="button"
                                onClick={() =>
                                  openGradeModal({
                                    submissionId: sub.id,
                                    studentName: sub.student?.name ?? "Student",
                                    assignmentTitle: assignment.title,
                                    content: sub.content,
                                    submittedAt: sub.submittedAt,
                                    existingScore: sub.grade?.score,
                                    existingFeedback: sub.grade?.feedback ?? undefined,
                                  })
                                }
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {sub.status === "GRADED" ? "Review" : "Grade"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Attendance</h2>
        <p className="mt-1 text-slate-500">
          {isTeacher ? "Mark and manage student attendance." : "View your attendance records."}
        </p>
      </div>

      {isTeacher && (
        <Card>
          <h3 className="font-semibold text-slate-900">Mark Attendance</h3>
          <form onSubmit={onMarkAttendance} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Course</label>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                {...attendanceForm.register("courseId")}
              >
                <option value="">Select course</option>
                {dashboardData.courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Student</label>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                {...attendanceForm.register("studentId")}
              >
                <option value="">Select student</option>
                {teacherStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <Input type="date" {...attendanceForm.register("date")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                {...attendanceForm.register("status")}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
            <Button type="submit" className="sm:col-span-2">Mark Attendance</Button>
          </form>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold text-slate-900">
          {isTeacher ? "All Marked Records" : "My Attendance History"}
        </h3>
        <div className="mt-4 space-y-3">
          {dashboardData.attendance.length === 0 ? (
            <p className="text-sm text-slate-500">No attendance records found.</p>
          ) : (
            dashboardData.attendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{record.course?.title}</p>
                  {isAdmin && record.student && (
                    <p className="text-xs text-slate-500">{record.student.name}</p>
                  )}
                  <p className="text-xs text-slate-400">{formatDate(record.date)}</p>
                </div>
                <Badge
                  variant={
                    record.status === "PRESENT" ? "success" : record.status === "LATE" ? "warning" : "danger"
                  }
                >
                  {record.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );

  const renderGrades = () => {
    const grades = dashboardData.profile?.gradesReceived || [];
    const avg = grades.length > 0 ? grades.reduce((s, g) => s + g.score, 0) / grades.length : null;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Grades & Reports</h2>
          <p className="mt-1 text-slate-500">Review your academic performance.</p>
        </div>

        {avg !== null && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Grades" value={grades.length} icon={Award} color="indigo" />
            <StatCard label="Average Score" value={Math.round(avg)} icon={Star} color="amber" />
            <StatCard
              label="Passing Grades"
              value={grades.filter((g) => g.score >= 50).length}
              icon={CheckCircle}
              color="emerald"
            />
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Grade Records</h3>
            <Button onClick={downloadReportCard}>Download PDF</Button>
          </div>
          <div className="mt-4 space-y-3">
            {grades.length === 0 ? (
              <p className="text-sm text-slate-500">No grades yet.</p>
            ) : (
              grades.map((g) => (
                <div key={g.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{g.submission.assignment.title}</p>
                      <p className="text-xs text-slate-400">Graded by {g.teacher.name}</p>
                      {g.feedback && (
                        <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
                          {g.feedback}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${g.score >= 80 ? "text-emerald-600" : g.score >= 50 ? "text-amber-600" : "text-rose-600"}`}
                      >
                        {g.score}%
                      </p>
                      <Badge
                        variant={g.score >= 80 ? "success" : g.score >= 50 ? "warning" : "danger"}
                      >
                        {g.score >= 80 ? "Excellent" : g.score >= 50 ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
        <p className="mt-1 text-slate-500">Stay up to date with system messages and updates.</p>
      </div>
      <Card>
        <div className="space-y-3">
          {dashboardData.notifications.length === 0 ? (
            <p className="text-sm text-slate-500">No notifications yet.</p>
          ) : (
            dashboardData.notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors hover:bg-slate-50 ${n.read ? "border-slate-100 bg-white" : "border-sky-100 bg-sky-50"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-sky-500"}`}
                    />
                    <div>
                      <p className="font-medium text-slate-900">{n.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <Badge
                      variant={n.type === "SUCCESS" ? "success" : n.type === "WARNING" ? "warning" : "info"}
                    >
                      {n.type}
                    </Badge>
                    {!n.read && <span className="text-xs text-sky-600 font-medium">Click to mark read</span>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>
    </div>
  );

  const renderCourseManagement = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Course Management</h2>
        <p className="mt-1 text-slate-500">Create courses and manage assignments.</p>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-900">Create New Course</h3>
        <form onSubmit={onCreateCourse} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Course Code</label>
            <Input placeholder="e.g. CS101" {...courseForm.register("code")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input placeholder="Introduction to Computer Science" {...courseForm.register("title")} />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={2}
              placeholder="Describe the course objectives..."
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              {...courseForm.register("description")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Credits</label>
            <Input type="number" placeholder="3" {...courseForm.register("credits", { valueAsNumber: true })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Capacity</label>
            <Input type="number" placeholder="30" {...courseForm.register("capacity", { valueAsNumber: true })} />
          </div>
          {isAdmin && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">Assign Teacher</label>
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                {...courseForm.register("teacherId")}
              >
                <option value="">Assign teacher later</option>
                {dashboardData.users.filter((u) => u.role === "TEACHER").map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <Button type="submit" className="sm:col-span-2">Create Course</Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Create Assignment</h3>
        <form onSubmit={onCreateAssignment} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input placeholder="Assignment title" {...assignmentForm.register("title")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Due Date</label>
            <Input type="datetime-local" {...assignmentForm.register("dueDate")} />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={2}
              placeholder="Assignment details and instructions..."
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              {...assignmentForm.register("description")}
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Course</label>
            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              {...assignmentForm.register("courseId")}
            >
              <option value="">Select course</option>
              {dashboardData.courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="sm:col-span-2">Create Assignment</Button>
        </form>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">User Administration</h2>
        <p className="mt-1 text-slate-500">Manage all users and their roles.</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wide">User</th>
                <th className="pb-3 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Email</th>
                <th className="pb-3 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Role</th>
                <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboardData.users.map((adminUser) => (
                <tr key={adminUser.id} className="group">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={adminUser.avatar} name={adminUser.name} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900">{adminUser.name}</p>
                        <p className="text-xs text-slate-400">
                          {adminUser.studentProfile?.studentId || adminUser.teacherProfile?.employeeId || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{adminUser.email}</td>
                  <td className="py-3 pr-4">
                    <select
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      value={adminUser.role}
                      onChange={(e) => updateUserRole(adminUser.id, e.target.value as Role)}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <Button
                      variant="danger"
                      onClick={() => deleteUser(adminUser.id, adminUser.name)}
                      disabled={adminUser.id === user?.id}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const sectionContent: Record<Section, () => React.ReactNode> = {
    overview: renderOverview,
    profile: renderProfile,
    courses: renderCourses,
    assignments: renderAssignments,
    attendance: renderAttendance,
    grades: renderGrades,
    notifications: renderNotifications,
    "course-management": renderCourseManagement,
    users: renderUsers,
  };

  // ─── Loading / Auth guard ────────────────────────────────────────────────────

  if (!hydrated || loading) {
    return <LoadingState label="Loading your dashboard..." />;
  }

  if (!user) return null;

  // ─── Layout ──────────────────────────────────────────────────────────────────

  return (
    <>
    <ConfirmModal
      open={confirmModal.open}
      title={confirmModal.title}
      message={confirmModal.message}
      confirmLabel={confirmModal.confirmLabel}
      variant={confirmModal.variant}
      onConfirm={confirmModal.onConfirm}
      onCancel={closeConfirm}
    />
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-slate-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">SMS Portal</span>
          <button type="button" onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar src={dashboardData.profile?.avatar} name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                activeSection === id
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
              {activeSection === id && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900 capitalize">
              {navItems.find((n) => n.id === activeSection)?.label ?? "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection("notifications")}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("profile")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3 hover:bg-slate-50 transition-colors"
            >
              <Avatar src={dashboardData.profile?.avatar} name={user.name} size="sm" />
              <span className="hidden text-sm font-medium text-slate-700 sm:block">{user.name}</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {sectionContent[activeSection]?.()}
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
