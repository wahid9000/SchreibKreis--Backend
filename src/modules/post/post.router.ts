import express from "express";
import { postController } from "./post.controller";
import { catchAsync } from "../../middleware/errorHandler";
import { authPermission } from "../../middleware/authPermission";
import {
  validatePost,
  validatePostId,
  validatePostQuery,
  validateUpdatePost,
} from "./post.validator";

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
router.get(
  "/:id",
  authPermission("ADMIN", "USER"),
  validatePostId,
  catchAsync(postController.getPostById),
);
router.patch(
  "/:id",
  authPermission("ADMIN", "USER"),
  validatePostId,
  validateUpdatePost,
  catchAsync(postController.updatePost),
);
router.delete(
  "/:id",
  authPermission("ADMIN", "USER"),
  validatePostId,
  catchAsync(postController.deletePost),
);

export const postRouter: express.Router = router;
