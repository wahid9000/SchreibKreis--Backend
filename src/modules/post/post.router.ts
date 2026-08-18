import express from "express";
import { postController } from "./post.controller";
import { catchAsync } from "../../middleware/errorHandler";
import validatePost from "../../middleware/validatePost";

const router = express.Router();

router.post("/", validatePost, catchAsync(postController.createPost));
router.get("/", catchAsync(postController.getPosts));

export const postRouter: express.Router = router;
