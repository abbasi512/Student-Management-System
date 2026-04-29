import { Router } from "express";

import * as notificationsController from "../controllers/notifications.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(notificationsController.getNotifications));
router.patch("/:id/read", asyncHandler(notificationsController.markNotificationRead));

export default router;
