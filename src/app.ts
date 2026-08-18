import express from "express";
import { postRouter } from "./modules/post/post.router";
import { globalErrorHandler } from "./middleware/errorHandler";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";

const app: express.Application = express();
app.use(express.json({ limit: "10kb" }));

app.use(cors({
  origin: process.env.APP_URL || "http://localhost:5000",
  credentials: true,
}));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/posts", postRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: "fail",
    statusCode: 404,
    message: "Route not found",
  });
});

app.use(globalErrorHandler);

export default app;
