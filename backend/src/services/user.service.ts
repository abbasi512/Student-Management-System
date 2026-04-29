import { Role } from "@prisma/client";

import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { createNotificationData, userSelect } from "../utils/serializers";

export const getUsers = async () =>
  prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });

export const updateUser = async (
  userId: string,
  data: { name?: string; email?: string; role?: Role },
) => {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: userSelect,
  });

  await prisma.notification.create({
    data: createNotificationData(
      userId,
      "Profile updated",
      "Your account details were updated by an administrator.",
    ),
  });

  return updatedUser;
};

export const deleteUser = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  await prisma.user.delete({ where: { id: userId } });

  return { message: "User deleted successfully." };
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: userSelect,
  });

  await prisma.notification.create({
    data: createNotificationData(
      userId,
      "Avatar updated",
      "Your profile picture has been updated.",
      "SUCCESS",
    ),
  });

  return user;
};

export const updateOwnProfile = async (
  userId: string,
  role: Role,
  data: {
    name?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string | null;
    bio?: string;
    department?: string;
    gender?: string;
    nationality?: string;
    emergencyContact?: string;
    qualification?: string;
    specialization?: string;
    officeHours?: string;
  },
) => {
  if (data.name) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });
  }

  if (role === Role.STUDENT) {
    const updated = await prisma.studentProfile.update({
      where: { userId },
      data: {
        phone: data.phone,
        address: data.address,
        bio: data.bio,
        gender: data.gender,
        nationality: data.nationality,
        emergencyContact: data.emergencyContact,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });

    await prisma.notification.create({
      data: createNotificationData(
        userId,
        "Profile updated",
        "Your profile information has been updated successfully.",
        "SUCCESS",
      ),
    });

    return updated;
  }

  if (role === Role.TEACHER) {
    const updated = await prisma.teacherProfile.update({
      where: { userId },
      data: {
        phone: data.phone,
        bio: data.bio,
        department: data.department,
        qualification: data.qualification,
        specialization: data.specialization,
        officeHours: data.officeHours,
      },
    });

    await prisma.notification.create({
      data: createNotificationData(
        userId,
        "Profile updated",
        "Your profile information has been updated successfully.",
        "SUCCESS",
      ),
    });

    return updated;
  }

  if (role === Role.ADMIN) {
    await prisma.notification.create({
      data: createNotificationData(
        userId,
        "Profile updated",
        "Your profile information has been updated successfully.",
        "SUCCESS",
      ),
    });

    return await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  }

  throw new AppError("No editable profile exists for this role", 400);
};

export const getOwnProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...userSelect,
      enrollments: {
        include: {
          course: true,
        },
      },
      attendance: {
        include: {
          course: true,
        },
        orderBy: {
          date: "desc",
        },
      },
      gradesReceived: {
        include: {
          submission: {
            include: {
              assignment: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      notifications: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
