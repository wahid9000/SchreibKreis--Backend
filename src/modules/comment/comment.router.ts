import express from "express";
import { commentController } from "./comment.controller";
import { catchAsync } from "../../middleware/errorHandler";
import { authPermission } from "../../middleware/authPermission";
import {
  postIdSchema,
  commentIdSchema,
  createCommentSchema,
  commentQuerySchema,
  updateCommentSchema,
  moderateCommentSchema,
} from "./comment.validator";
import { zodValidate } from "../../middleware/zodValidate";
import { publicLimiter, writeLimiter } from "../../middleware/rateLimiter";

const router = express.Router();

router.post(
  "/",
  writeLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(createCommentSchema),
  catchAsync(commentController.createComment),
);
router.get(
  "/post/:postId",
  publicLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(postIdSchema, "params"),
  zodValidate(commentQuerySchema, "query"),
  catchAsync(commentController.getCommentsByPost),
);
router.get(
  "/:id",
  publicLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(commentIdSchema, "params"),
  catchAsync(commentController.getCommentById),
);
router.patch(
  "/:id",
  writeLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(commentIdSchema),
  zodValidate(updateCommentSchema),
  catchAsync(commentController.updateComment),
);
router.patch(
  "/moderate/:id",
  writeLimiter,
  authPermission("ADMIN"),
  zodValidate(commentIdSchema, "params"),
  zodValidate(moderateCommentSchema),
  catchAsync(commentController.moderateComment),
);
router.delete(
  "/:id",
  writeLimiter,
  authPermission("ADMIN", "USER"),
  zodValidate(commentIdSchema, "params"),
  catchAsync(commentController.deleteComment),
);

export const commentRouter: express.Router = router;
