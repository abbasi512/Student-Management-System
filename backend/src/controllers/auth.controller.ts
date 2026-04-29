import { Request, Response } from "express";

import * as authService from "../services/auth.service";

export const signup = async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const result = await authService.createPasswordResetToken(req.body.email);
  res.json(result);
};

export const resetPassword = async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.json(result);
};
