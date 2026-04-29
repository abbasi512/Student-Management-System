import { Router } from "express";
import { Role } from "@prisma/client";

import * as usersController from "../controllers/users.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadAvatar } from "../middleware/upload";
import { validate } from "../middleware/validate";
import { profileSchema, updateUserSchema } from "../utils/schemas";

const router = Router();

router.use(requireAuth);

router.get("/me", asyncHandler(usersController.getOwnProfile));
router.put("/me/profile", validate(profileSchema), asyncHandler(usersController.updateOwnProfile));
router.post(
  "/me/avatar",
  uploadAvatar.single("avatar"),
  asyncHandler(usersController.uploadUserAvatar),
);

router.get("/", requireRole(Role.ADMIN), asyncHandler(usersController.getUsers));
router.put(
  "/:id",
  requireRole(Role.ADMIN),
  validate(updateUserSchema),
  asyncHandler(usersController.updateUser),
);
router.delete("/:id", requireRole(Role.ADMIN), asyncHandler(usersController.deleteUser));

export default router;
