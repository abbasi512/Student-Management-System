import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";

import { verifyToken } from "../utils/auth";
import { AppError } from "../utils/app-error";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }

    return next();
  };
};
