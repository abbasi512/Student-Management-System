import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/app-error";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  void next;

  if (error instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed",
      errors: error.flatten(),
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);

  return res.status(500).json({
    message: "Something went wrong",
  });
};
