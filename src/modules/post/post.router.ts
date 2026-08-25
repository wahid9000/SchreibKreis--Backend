import express from "express";
import { postController } from "./post.controller";
import { catchAsync } from "../../middleware/errorHandler";
import { authPermission } from "../../middleware/authPermission";
import {
  postSchema,
  postIdSchema,
  postQuerySchema,
  ownPostQuerySchema,
  updatePostSchema,
} from "./post.validator";
import { zodValidate } from "../../middleware/zodValidate";
import { publicLimiter, writeLimiter } from "../../middleware/rateLimiter";

const router = express.Router();

router.post(
  "/",
  writeLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(postSchema),
  catchAsync(postController.createPost),
);
router.get(
  "/",
  publicLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(postQuerySchema, "query"),
  catchAsync(postController.getPosts),
);
router.get(
  "/:id",
  publicLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(postIdSchema, "params"),
  catchAsync(postController.getPostById),
);
router.get(
  "/users/me",
  publicLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(ownPostQuerySchema, "query"),
  catchAsync(postController.getOwnPosts),
);
router.patch(
  "/:id",
  writeLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(postIdSchema, "params"),
  zodValidate(updatePostSchema),
  catchAsync(postController.updatePost),
);
router.delete(
  "/:id",
  writeLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(postIdSchema, "params"),
  catchAsync(postController.deletePost),
);

export const postRouter: express.Router = router;
