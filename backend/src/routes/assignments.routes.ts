import { Router } from "express";
import { Role } from "@prisma/client";

import * as assignmentsController from "../controllers/assignments.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  assignmentSchema,
  gradeSchema,
  submissionSchema,
} from "../utils/schemas";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(assignmentsController.getAssignments));
router.post(
  "/",
  requireRole(Role.TEACHER),
  validate(assignmentSchema),
  asyncHandler(assignmentsController.createAssignment),
);
router.post(
  "/:id/submit",
  requireRole(Role.STUDENT),
  validate(submissionSchema),
  asyncHandler(assignmentsController.submitAssignment),
);
router.post(
  "/grade",
  requireRole(Role.TEACHER),
  validate(gradeSchema),
  asyncHandler(assignmentsController.gradeSubmission),
);

export default router;
