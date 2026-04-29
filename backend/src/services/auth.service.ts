import crypto from "crypto";
import { Role } from "@prisma/client";

import { prisma } from "../config/prisma";
import { comparePassword, hashPassword, signToken } from "../utils/auth";
import { AppError } from "../utils/app-error";
import { createNotificationData, userSelect } from "../utils/serializers";

type AuthPayload = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

const createRoleProfile = async (userId: string, role: Role) => {
  if (role === Role.STUDENT) {
    await prisma.studentProfile.create({
      data: {
        userId,
        studentId: `STU-${Date.now()}`,
      },
    });
  }

  if (role === Role.TEACHER) {
    await prisma.teacherProfile.create({
      data: {
        userId,
        employeeId: `EMP-${Date.now()}`,
      },
    });
  }
};

export const signup = async ({ name, email, password, role }: AuthPayload) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: userSelect,
  });

  await createRoleProfile(user.id, role);

  await prisma.notification.create({
    data: createNotificationData(
      user.id,
      "Welcome aboard",
      "Your account has been created successfully.",
    ),
  });

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return { user: await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: userSelect }), token };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: true,
      teacherProfile: true,
    },
  });

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      studentProfile: user.studentProfile,
      teacherProfile: user.teacherProfile,
    },
  };
};

export const createPasswordResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return {
      message: "If the account exists, a reset token has been generated.",
    };
  }

  const token = crypto.randomBytes(24).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExp: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  return {
    message: "Password reset token generated. Use this token in the reset form.",
    token,
  };
};

export const resetPassword = async (token: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError("Reset token is invalid or expired", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      resetToken: null,
      resetTokenExp: null,
    },
  });

  return { message: "Password has been reset successfully." };
};
