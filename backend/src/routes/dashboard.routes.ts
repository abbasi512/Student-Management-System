import { Router } from "express";

import * as dashboardController from "../controllers/dashboard.controller";
import { asyncHandler } from "../middleware/async-handler";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, asyncHandler(dashboardController.getDashboard));

export default router;
