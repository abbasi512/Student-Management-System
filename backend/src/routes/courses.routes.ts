import { Router } from "express";
import { Role } from "@prisma/client";

import * as coursesController from "../controllers/courses.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  courseParamsSchema,
  courseSchema,
  enrollmentSchema,
} from "../utils/schemas";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(coursesController.getCourses));
router.get("/teacher", requireRole(Role.TEACHER), asyncHandler(coursesController.getTeacherCourses));
router.get("/student", requireRole(Role.STUDENT), asyncHandler(coursesController.getStudentCourses));
router.get("/:id", validate(courseParamsSchema), asyncHandler(coursesController.getCourseById));
router.post(
  "/",
  requireRole(Role.ADMIN, Role.TEACHER),
  validate(courseSchema),
  asyncHandler(coursesController.createCourse),
);
router.put(
  "/:id",
  requireRole(Role.ADMIN, Role.TEACHER),
  validate(courseParamsSchema),
  asyncHandler(coursesController.updateCourse),
);
router.delete(
  "/:id",
  requireRole(Role.ADMIN),
  validate(courseParamsSchema),
  asyncHandler(coursesController.deleteCourse),
);
router.post(
  "/enroll",
  requireRole(Role.STUDENT),
  validate(enrollmentSchema),
  asyncHandler(coursesController.enroll),
);
router.put(
  "/:id/assign-teacher",
  requireRole(Role.ADMIN),
  validate(courseParamsSchema),
  asyncHandler(coursesController.assignTeacher),
);

export default router;
