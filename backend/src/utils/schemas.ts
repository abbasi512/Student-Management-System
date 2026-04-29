import { Role, AttendanceStatus } from "@prisma/client";
import { z } from "zod";

const paramsWithId = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(Role),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(8),
    password: z.string().min(8),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.email().optional(),
    role: z.enum(Role).optional(),
  }),
  params: paramsWithId.shape.params,
});

export const courseSchema = z.object({
  body: z.object({
    code: z.string().min(2),
    title: z.string().min(3),
    description: z.string().min(5),
    credits: z.coerce.number().int().min(1).max(10),
    capacity: z.coerce.number().int().min(1),
    teacherId: z.string().optional().nullable(),
  }),
});

export const courseParamsSchema = paramsWithId;

export const enrollmentSchema = z.object({
  body: z.object({
    courseId: z.string().min(1),
  }),
});

export const attendanceSchema = z.object({
  body: z.object({
    courseId: z.string().min(1),
    studentId: z.string().min(1),
    date: z.iso.datetime(),
    status: z.enum(AttendanceStatus),
  }),
});

export const assignmentSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(5),
    dueDate: z.iso.datetime(),
    courseId: z.string().min(1),
  }),
});

export const submissionSchema = z.object({
  body: z.object({
    content: z.string().min(3),
  }),
  params: paramsWithId.shape.params,
});

export const gradeSchema = z.object({
  body: z.object({
    submissionId: z.string().min(1),
    score: z.coerce.number().min(0).max(100),
    feedback: z.string().optional(),
  }),
});

export const profileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.iso.datetime().optional().nullable(),
    bio: z.string().optional(),
    department: z.string().optional(),
    gender: z.string().optional(),
    nationality: z.string().optional(),
    emergencyContact: z.string().optional(),
    qualification: z.string().optional(),
    specialization: z.string().optional(),
    officeHours: z.string().optional(),
  }),
});
