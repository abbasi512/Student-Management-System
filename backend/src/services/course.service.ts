import { Role } from "@prisma/client";

import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { courseSelect, createNotificationData } from "../utils/serializers";

export const getCourses = async () =>
  prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    select: courseSelect,
  });

export const getCourseById = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      assignments: true,
      attendance: true,
    },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

export const createCourse = async (
  creatorId: string,
  payload: {
    code: string;
    title: string;
    description: string;
    credits: number;
    capacity: number;
    teacherId?: string | null;
  },
) =>
  prisma.course.create({
    data: {
      ...payload,
      createdById: creatorId,
    },
    select: courseSelect,
  });

export const updateCourse = async (
  courseId: string,
  payload: {
    code?: string;
    title?: string;
    description?: string;
    credits?: number;
    capacity?: number;
    teacherId?: string | null;
  },
) => {
  await getCourseById(courseId);

  return prisma.course.update({
    where: { id: courseId },
    data: payload,
    select: courseSelect,
  });
};

export const deleteCourse = async (courseId: string) => {
  await getCourseById(courseId);

  await prisma.course.delete({ where: { id: courseId } });

  return { message: "Course deleted successfully." };
};

export const enrollInCourse = async (courseId: string, studentId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const enrolledCount = await prisma.enrollment.count({ where: { courseId } });

  if (enrolledCount >= course.capacity) {
    throw new AppError("Course is already at capacity", 400);
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      courseId,
      studentId,
    },
    include: {
      course: true,
    },
  });

  await prisma.notification.create({
    data: createNotificationData(
      studentId,
      "Enrollment successful",
      `You have been enrolled in ${enrollment.course.title}.`,
    ),
  });

  return enrollment;
};

export const getTeacherCourses = async (teacherId: string) =>
  prisma.course.findMany({
    where: {
      OR: [{ teacherId }, { createdById: teacherId }],
    },
    include: {
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      assignments: true,
    },
  });

export const getStudentCourses = async (studentId: string) =>
  prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

export const assignTeacher = async (courseId: string, teacherId: string) => {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });

  if (!teacher || teacher.role !== Role.TEACHER) {
    throw new AppError("Teacher not found", 404);
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: { teacherId },
    select: courseSelect,
  });

  await prisma.notification.create({
    data: createNotificationData(
      teacherId,
      "New course assignment",
      `You have been assigned to course ${course.title}.`,
    ),
  });

  return course;
};
