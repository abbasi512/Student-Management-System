import { NotificationType, Role } from "@prisma/client";

export const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  createdAt: true,
  studentProfile: true,
  teacherProfile: true,
} as const;

export const courseSelect = {
  id: true,
  code: true,
  title: true,
  description: true,
  credits: true,
  capacity: true,
  createdAt: true,
  updatedAt: true,
  teacher: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  _count: {
    select: {
      enrollments: true,
      assignments: true,
    },
  },
} as const;

export const createNotificationData = (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = NotificationType.INFO,
) => ({
  userId,
  title,
  message,
  type,
});

export const isStudentRole = (role: Role) => role === Role.STUDENT;
export const isTeacherRole = (role: Role) => role === Role.TEACHER;
