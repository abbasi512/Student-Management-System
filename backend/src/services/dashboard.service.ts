import { prisma } from "../config/prisma";

export const getAdminDashboard = async () => {
  const [users, courses, enrollments, assignments, submissions, attendance, grades] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.assignment.count(),
      prisma.submission.count(),
      prisma.attendance.count(),
      prisma.grade.count(),
    ]);

  return {
    users,
    courses,
    enrollments,
    assignments,
    submissions,
    attendanceRecords: attendance,
    gradedSubmissions: grades,
  };
};

export const getTeacherDashboard = async (teacherId: string) => {
  const [courses, assignments, submissions, attendance] = await Promise.all([
    prisma.course.count({ where: { teacherId } }),
    prisma.assignment.count({ where: { teacherId } }),
    prisma.submission.count({
      where: {
        assignment: {
          teacherId,
        },
      },
    }),
    prisma.attendance.count({
      where: {
        course: {
          teacherId,
        },
      },
    }),
  ]);

  return {
    courses,
    assignments,
    submissions,
    attendanceRecords: attendance,
  };
};

export const getStudentDashboard = async (studentId: string) => {
  const [courses, attendance, grades, assignments, notifications] = await Promise.all([
    prisma.enrollment.count({ where: { studentId } }),
    prisma.attendance.count({ where: { studentId } }),
    prisma.grade.count({ where: { studentId } }),
    prisma.submission.count({ where: { studentId } }),
    prisma.notification.count({ where: { userId: studentId, read: false } }),
  ]);

  return {
    enrolledCourses: courses,
    attendanceRecords: attendance,
    grades,
    submissions: assignments,
    unreadNotifications: notifications,
  };
};
