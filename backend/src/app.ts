import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import coursesRoutes from "./routes/courses.routes";
import attendanceRoutes from "./routes/attendance.routes";
import assignmentsRoutes from "./routes/assignments.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import notificationsRoutes from "./routes/notifications.routes";

export const app = express();

const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      // Allow exact match or any *.vercel.app preview URL
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
