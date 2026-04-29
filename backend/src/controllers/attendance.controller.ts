import { Request, Response } from "express";

import * as academicService from "../services/academic.service";

export const markAttendance = async (req: Request, res: Response) => {
  const attendance = await academicService.markAttendance(req.user!.id, req.body);
  res.status(201).json(attendance);
};

export const getAttendance = async (req: Request, res: Response) => {
  const attendance = await academicService.getAttendance(req.user!.id, req.user!.role);
  res.json(attendance);
};
