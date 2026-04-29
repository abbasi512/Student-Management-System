import { Request, Response } from "express";

import { prisma } from "../config/prisma";

export const getNotifications = async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });

  res.json(notifications);
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const notification = await prisma.notification.findFirstOrThrow({
    where: {
      id: String(req.params.id),
      userId: req.user!.id,
    },
  });

  const updatedNotification = await prisma.notification.update({
    where: { id: notification.id },
    data: { read: true },
  });

  res.json(updatedNotification);
};
