import { Router } from "express";

import * as authController from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/async-handler";
import { validate } from "../middleware/validate";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "../utils/schemas";

const router = Router();

router.post("/signup", validate(signupSchema), asyncHandler(authController.signup));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

export default router;
