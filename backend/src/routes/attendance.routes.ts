import { Router } from "express";
import { Role } from "@prisma/client";

import * as attendanceController from "../controllers/attendance.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { attendanceSchema } from "../utils/schemas";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(attendanceController.getAttendance));
router.post(
  "/",
  requireRole(Role.TEACHER),
  validate(attendanceSchema),
  asyncHandler(attendanceController.markAttendance),
);

export default router;
