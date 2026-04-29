import { PrismaClient, Role, AttendanceStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { Pool } from "pg";

const adapter = new PrismaPg(
  new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
);

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.course.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@sms.com",
      password,
      role: Role.ADMIN,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: "Teacher User",
      email: "teacher@sms.com",
      password,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          employeeId: "EMP-1001",
          department: "Computer Science",
          phone: "+1234567890",
          bio: "Lead faculty for application development.",
        },
      },
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Student User",
      email: "student@sms.com",
      password,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          studentId: "STU-1001",
          phone: "+1234567891",
          address: "Demo Street 100",
          bio: "Second year student interested in web engineering.",
        },
      },
    },
  });

  const course = await prisma.course.create({
    data: {
      code: "CS101",
      title: "Full Stack Development",
      description: "Learn React, Next.js, Node.js, Express and PostgreSQL.",
      credits: 4,
      capacity: 40,
      createdById: admin.id,
      teacherId: teacher.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      courseId: course.id,
      studentId: student.id,
    },
  });

  await prisma.attendance.create({
    data: {
      courseId: course.id,
      studentId: student.id,
      markedById: teacher.id,
      date: new Date(),
      status: AttendanceStatus.PRESENT,
    },
  });

  const assignment = await prisma.assignment.create({
    data: {
      title: "Build a student portal",
      description: "Create a simple dashboard with authentication and course listing.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      courseId: course.id,
      teacherId: teacher.id,
    },
  });

  const submission = await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      studentId: student.id,
      content: "https://github.com/example/student-portal",
    },
  });

  await prisma.grade.create({
    data: {
      submissionId: submission.id,
      studentId: student.id,
      teacherId: teacher.id,
      score: 92,
      feedback: "Strong implementation and clean UI.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: "Welcome",
        message: "Your demo student account is ready.",
        type: "SUCCESS",
      },
      {
        userId: teacher.id,
        title: "Course assigned",
        message: "You have been assigned to Full Stack Development.",
        type: "INFO",
      },
      {
        userId: admin.id,
        title: "Seed completed",
        message: "Demo data has been loaded into the system.",
        type: "INFO",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
