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

const router = express.Router();

router.post(
  "/",
  authPermission("ADMIN", "USER"),
  zodValidate(createCommentSchema),
  catchAsync(commentController.createComment),
);
router.get(
  "/post/:postId",
  authPermission("ADMIN", "USER"),
  zodValidate(postIdSchema, "params"),
  zodValidate(commentQuerySchema, "query"),
  catchAsync(commentController.getCommentsByPost),
);
router.get(
  "/:id",
  authPermission("ADMIN", "USER"),
  zodValidate(commentIdSchema, "params"),
  catchAsync(commentController.getCommentById),
);
router.patch(
  "/:id",
  authPermission("ADMIN", "USER"),
  zodValidate(commentIdSchema),
  zodValidate(updateCommentSchema),
  catchAsync(commentController.updateComment),
);
router.patch(
  "/moderate/:id",
  authPermission("ADMIN"),
  zodValidate(commentIdSchema, "params"),
  zodValidate(moderateCommentSchema),
  catchAsync(commentController.moderateComment),
);
router.delete(
  "/:id",
  authPermission("ADMIN", "USER"),
  zodValidate(commentIdSchema, "params"),
  catchAsync(commentController.deleteComment),
);

export const commentRouter: express.Router = router;
