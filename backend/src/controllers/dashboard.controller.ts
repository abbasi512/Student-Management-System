import { Request, Response } from "express";

import * as dashboardService from "../services/dashboard.service";

export const getDashboard = async (req: Request, res: Response) => {
  if (req.user!.role === "ADMIN") {
    return res.json(await dashboardService.getAdminDashboard());
  }

  if (req.user!.role === "TEACHER") {
    return res.json(await dashboardService.getTeacherDashboard(req.user!.id));
  }

  return res.json(await dashboardService.getStudentDashboard(req.user!.id));
};
