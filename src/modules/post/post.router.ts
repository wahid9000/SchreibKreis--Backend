import express from "express";
import { postController } from "./post.controller";
import { catchAsync } from "../../middleware/errorHandler";
import { authPermission } from "../../middleware/authPermission";
import { validatePost, validatePostQuery } from "./post.validator";

const router = express.Router();

router.post(
  "/",
  authPermission("ADMIN", "USER"),
  validatePost,
  catchAsync(postController.createPost),
);
router.get(
  "/",
  authPermission("ADMIN", "USER"),
  validatePostQuery,
  catchAsync(postController.getPosts),
);

export const postRouter: express.Router = router;
