import { Request, Response } from "express";

import * as userService from "../services/user.service";
import { AppError } from "../utils/app-error";

export const getUsers = async (_req: Request, res: Response) => {
  const users = await userService.getUsers();
  res.json(users);
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await userService.updateUser(String(req.params.id), req.body);
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const result = await userService.deleteUser(String(req.params.id));
  res.json(result);
};

export const getOwnProfile = async (req: Request, res: Response) => {
  const profile = await userService.getOwnProfile(req.user!.id);
  res.json(profile);
};

export const updateOwnProfile = async (req: Request, res: Response) => {
  const profile = await userService.updateOwnProfile(req.user!.id, req.user!.role, req.body);
  res.json(profile);
};

export const uploadUserAvatar = async (req: Request, res: Response) => {
  const file = req.file as (Express.Multer.File & { path?: string }) | undefined;

  if (!file?.path) {
    throw new AppError("No file uploaded", 400);
  }

  const user = await userService.updateAvatar(req.user!.id, file.path);
  res.json(user);
};
