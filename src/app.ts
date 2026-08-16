import express from "express";
import { postRouter } from "./modules/post/post.router";

const app: express.Application = express();

app.use(express.json());

app.use("/posts", postRouter);

export default app;
