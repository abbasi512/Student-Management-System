import { NotificationType, SubmissionStatus } from "@prisma/client";

import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { createNotificationData } from "../utils/serializers";

export const markAttendance = async (
  teacherId: string,
  payload: {
    courseId: string;
    studentId: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  },
) => {
  const course = await prisma.course.findUnique({
    where: { id: payload.courseId },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.teacherId !== teacherId) {
    throw new AppError("Only the assigned teacher can mark attendance", 403);
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_courseId_date: {
        studentId: payload.studentId,
        courseId: payload.courseId,
        date: new Date(payload.date),
      },
    },
    update: {
      status: payload.status,
      markedById: teacherId,
    },
    create: {
      studentId: payload.studentId,
      courseId: payload.courseId,
      date: new Date(payload.date),
      status: payload.status,
      markedById: teacherId,
    },
  });

  await prisma.notification.create({
    data: createNotificationData(
      payload.studentId,
      "Attendance updated",
      `Your attendance status was marked as ${payload.status.toLowerCase()}.`,
    ),
  });

  return attendance;
};

export const getAttendance = async (userId: string, role: "ADMIN" | "TEACHER" | "STUDENT") => {
  if (role === "STUDENT") {
    return prisma.attendance.findMany({
      where: { studentId: userId },
      include: { course: true },
      orderBy: { date: "desc" },
    });
  }

  if (role === "TEACHER") {
    return prisma.attendance.findMany({
      where: {
        course: {
          teacherId: userId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: true,
      },
      orderBy: { date: "desc" },
    });
  }

  return prisma.attendance.findMany({
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      course: true,
    },
    orderBy: { date: "desc" },
  });
};

export const createAssignment = async (
  teacherId: string,
  payload: { title: string; description: string; dueDate: string; courseId: string },
) => {
  const course = await prisma.course.findUnique({ where: { id: payload.courseId } });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.teacherId !== teacherId) {
    throw new AppError("Only the assigned teacher can create assignments", 403);
  }

  const assignment = await prisma.assignment.create({
    data: {
      title: payload.title,
      description: payload.description,
      dueDate: new Date(payload.dueDate),
      courseId: payload.courseId,
      teacherId,
    },
    include: {
      course: true,
    },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: payload.courseId },
  });

  if (enrollments.length) {
    await prisma.notification.createMany({
      data: enrollments.map((enrollment) =>
        createNotificationData(
          enrollment.studentId,
          "New assignment posted",
          `A new assignment was added in ${assignment.course.title}.`,
          NotificationType.INFO,
        ),
      ),
    });
  }

  return assignment;
};

export const getAssignments = async (userId: string, role: "ADMIN" | "TEACHER" | "STUDENT") => {
  if (role === "STUDENT") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      select: { courseId: true },
    });

    return prisma.assignment.findMany({
      where: {
        courseId: {
          in: enrollments.map((enrollment) => enrollment.courseId),
        },
      },
      include: {
        course: true,
        submissions: {
          where: { studentId: userId },
          include: { grade: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });
  }

  if (role === "TEACHER") {
    return prisma.assignment.findMany({
      where: { teacherId: userId },
      include: {
        course: true,
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            grade: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });
  }

  return prisma.assignment.findMany({
    include: {
      course: true,
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          grade: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
};

export const submitAssignment = async (assignmentId: string, studentId: string, content: string) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });

  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  const submission = await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId,
      },
    },
    update: {
      content,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      studentId,
      content,
    },
  });

  await prisma.notification.create({
    data: createNotificationData(
      assignment.teacherId,
      "Assignment submitted",
      "A student submitted their assignment for review.",
    ),
  });

  return submission;
};

export const gradeSubmission = async (
  teacherId: string,
  payload: { submissionId: string; score: number; feedback?: string },
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: payload.submissionId },
    include: {
      assignment: true,
    },
  });

  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  if (submission.assignment.teacherId !== teacherId) {
    throw new AppError("Only the assignment owner can grade submissions", 403);
  }

  const grade = await prisma.grade.upsert({
    where: { submissionId: payload.submissionId },
    update: {
      score: payload.score,
      feedback: payload.feedback,
    },
    create: {
      submissionId: payload.submissionId,
      studentId: submission.studentId,
      teacherId,
      score: payload.score,
      feedback: payload.feedback,
    },
  });

  await prisma.submission.update({
    where: { id: payload.submissionId },
    data: {
      status: SubmissionStatus.GRADED,
    },
  });

  await prisma.notification.create({
    data: createNotificationData(
      submission.studentId,
      "Assignment graded",
      `Your submission received a score of ${payload.score}.`,
      NotificationType.SUCCESS,
    ),
  });

  return grade;
};
