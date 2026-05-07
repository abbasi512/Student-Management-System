"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Users,
  CreditCard,
  GraduationCap,
  ClipboardList,
  Clock,
  UserCircle,
} from "lucide-react";

import { LoadingState } from "@/components/ui/loading-state";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Assignment, Course } from "@/lib/types";

type CourseDetails = Course & {
  enrollments: Array<{
    id: string;
    student: { id: string; name: string; email: string };
  }>;
  assignments: Assignment[];
};

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get<CourseDetails>(`/courses/${params.id}`);
        setCourse(response.data);
      } catch {
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingState label="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <BookOpen className="h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-lg font-semibold text-slate-700">Course not found</h2>
        <Link
          href="/dashboard?section=courses"
          className="mt-4 text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          ← Back to courses
        </Link>
      </div>
    );
  }

  const enrolled = course.enrollments.length;
  const spotsLeft = course.capacity - enrolled;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link
            href="/dashboard?section=courses"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-slate-700 font-medium truncate">{course.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Hero card */}
        <div className="rounded-2xl bg-linear-to-br from-sky-600 to-indigo-700 p-8 text-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                {course.code}
              </span>
              <h1 className="mt-3 text-3xl font-bold">{course.title}</h1>
              <p className="mt-2 max-w-2xl text-sky-100 leading-relaxed">{course.description}</p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <GraduationCap className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: CreditCard, label: "Credits", value: `${course.credits}` },
              { icon: Users, label: "Enrolled", value: `${enrolled} / ${course.capacity}` },
              { icon: ClipboardList, label: "Assignments", value: `${course.assignments.length}` },
              { icon: Clock, label: "Spots left", value: spotsLeft > 0 ? `${spotsLeft}` : "Full" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 p-4">
                <Icon className="h-4 w-4 text-sky-200" />
                <p className="mt-2 text-xl font-bold">{value}</p>
                <p className="text-xs text-sky-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main — assignments */}
          <div className="space-y-6 lg:col-span-2">
            {/* Teacher */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Assigned Teacher</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
                  <UserCircle className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {course.teacher?.name ?? "Not assigned"}
                  </p>
                  {course.teacher?.email && (
                    <p className="text-sm text-slate-400">{course.teacher.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Assignments */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Assignments
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {course.assignments.length}
                </span>
              </h2>
              {course.assignments.length === 0 ? (
                <div className="mt-6 flex flex-col items-center py-8 text-center">
                  <ClipboardList className="h-10 w-10 text-slate-200" />
                  <p className="mt-3 text-sm text-slate-400">No assignments posted yet.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {course.assignments.map((assignment) => {
                    const overdue = new Date(assignment.dueDate) < new Date();
                    return (
                      <div
                        key={assignment.id}
                        className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{assignment.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{assignment.description}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              overdue
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {overdue ? "Overdue" : "Active"}
                          </span>
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          Due {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — student list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Enrolled Students
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {enrolled}
              </span>
            </h2>
            {enrolled === 0 ? (
              <div className="mt-6 flex flex-col items-center py-8 text-center">
                <Users className="h-10 w-10 text-slate-200" />
                <p className="mt-3 text-sm text-slate-400">No students enrolled yet.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {course.enrollments.map(({ id, student }) => {
                  const initials = student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div key={id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-400 to-indigo-500 text-xs font-bold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{student.name}</p>
                        <p className="truncate text-xs text-slate-400">{student.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
