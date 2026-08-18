import express from "express";
import { postRouter } from "./modules/post/post.router";
import { globalErrorHandler } from "./middleware/errorHandler";

const app: express.Application = express();

app.use(express.json({ limit: "10kb" }));

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
