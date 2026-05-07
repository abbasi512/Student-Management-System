import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  ClipboardList,
  CalendarCheck,
  Award,
  Bell,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Management",
    description: "Create, organise, and manage courses with capacity controls and teacher assignments.",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: CalendarCheck,
    title: "Attendance Tracking",
    description: "Teachers mark daily attendance per student. Students see their full history instantly.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ClipboardList,
    title: "Assignments & Grading",
    description: "Post assignments, collect submissions, review work, and return grades with feedback.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    description: "System-wide stats across users, enrollments, submissions, and attendance at a glance.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Award,
    title: "Report Cards",
    description: "Students download a full PDF grade report of all graded assignments in one click.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Real-time in-app alerts for new assignments, grades, attendance, and profile updates.",
    color: "bg-indigo-50 text-indigo-600",
  },
];

const roles = [
  {
    role: "Student",
    color: "border-sky-200 bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
    items: ["Enroll in courses", "Submit assignments", "Track attendance", "View grades & reports"],
  },
  {
    role: "Teacher",
    color: "border-violet-200 bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
    items: ["Create courses & assignments", "Mark attendance", "Grade submissions", "Send feedback"],
  },
  {
    role: "Admin",
    color: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    items: ["Manage all users", "Assign teachers to courses", "View system analytics", "Full access control"],
  },
];

const stats = [
  { label: "Role-based access", value: "3" },
  { label: "Core modules", value: "8" },
  { label: "API endpoints", value: "25+" },
  { label: "Real-time alerts", value: "∞" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-indigo-600">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">EduManage</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-sky-50 via-white to-indigo-50" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Full-stack Student Management Platform
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            One platform for{" "}
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              every role
            </span>{" "}
            in education
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500">
            Students, teachers, and admins each get a tailored workspace — courses,
            attendance, assignments, grades, and analytics all in one place.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 transition-colors"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signin"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-3xl font-extrabold text-slate-900">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to run a school</h2>
            <p className="mt-4 text-slate-500">
              All modules work together so data flows seamlessly between students, teachers, and admins.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex rounded-xl p-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Built for three roles</h2>
            <p className="mt-4 text-slate-500">
              Each role gets a tailored dashboard with only the tools they need.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {roles.map(({ role, color, badge, items }) => (
              <div key={role} className={`rounded-2xl border p-6 ${color}`}>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
                  {role}
                </span>
                <ul className="mt-5 space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 shrink-0 text-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-6 flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  Join as {role} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-linear-to-br from-sky-600 to-indigo-600 px-10 py-16 text-center shadow-2xl shadow-sky-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-sky-100">
            Create your account in seconds. No credit card required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-2xl bg-white px-7 py-3 font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/signin"
              className="rounded-2xl border border-white/30 px-7 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-linear-to-br from-sky-500 to-indigo-600">
              <GraduationCap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-600">EduManage</span>
          </div>
          <p className="text-xs text-slate-400">
            Built with Next.js, Express, Prisma & PostgreSQL
          </p>
          <div className="flex gap-4 text-sm text-slate-400">
            <Link href="/signin" className="hover:text-slate-600">Sign in</Link>
            <Link href="/signup" className="hover:text-slate-600">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
