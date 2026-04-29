"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Assignment, Course } from "@/lib/types";

type CourseDetails = Course & {
  enrollments: Array<{
    id: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
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
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <LoadingState label="Loading course details..." />
      </main>
    );
  }

  if (!course) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Card>Course not found.</Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <Link href="/dashboard?section=courses" className="text-sm font-medium text-sky-600">
        ← Back to courses
      </Link>
      <div className="mt-4 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <SectionHeading
            title={course.title}
            description={`${course.code} • ${course.credits} credits`}
          />
          <p className="mt-5 text-sm leading-7 text-slate-600">{course.description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card className="border-slate-100">
              <p className="text-sm text-slate-500">Assigned teacher</p>
              <p className="mt-2 font-semibold text-slate-900">
                {course.teacher?.name || "Not assigned"}
              </p>
            </Card>
            <Card className="border-slate-100">
              <p className="text-sm text-slate-500">Enrollment</p>
              <p className="mt-2 font-semibold text-slate-900">
                {course.enrollments.length} / {course.capacity}
              </p>
            </Card>
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Student list"
            description="Learners currently enrolled in this course."
          />
          <div className="mt-5 space-y-3">
            {course.enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-xl border border-slate-200 p-3 text-sm"
              >
                <p className="font-semibold text-slate-900">{enrollment.student.name}</p>
                <p className="text-slate-500">{enrollment.student.email}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionHeading
          title="Assignments"
          description="Upcoming and active work for this course."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {course.assignments.map((assignment) => (
            <Card key={assignment.id} className="border-slate-100">
              <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{assignment.description}</p>
              <p className="mt-2 text-xs text-slate-400">
                Due {formatDate(assignment.dueDate)}
              </p>
            </Card>
          ))}
        </div>
      </Card>
    </main>
  );
}
