import express, { NextFunction } from "express";
import { postRouter } from "./modules/post/post.router";
import { commentRouter } from "./modules/comment/comment.router";
import { globalErrorHandler } from "./middleware/errorHandler";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { analyticsRouter } from "./modules/analytics/analytics.router";
import { createAppError } from "./utils/AppError";
import { authLimiter } from "./middleware/rateLimiter";
import { emailDigestRouter } from "./modules/emailDigest/emailDigest.router";

const app: express.Application = express();
app.use(express.json({ limit: "100kb" }));

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/emailDigest", emailDigestRouter);

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Blog API is running",
  });
});

app.use((req, res, next) => {
  next(createAppError(404, `Route ${req.originalUrl} not found`));
});

app.use(globalErrorHandler);

export default app;
