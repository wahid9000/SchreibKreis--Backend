import express from "express";
import { commentController } from "./comment.controller";
import { catchAsync } from "../../middleware/errorHandler";
import { authPermission } from "../../middleware/authPermission";
import {
  validateCommentId,
  validateCommentQuery,
  validateCreateComment,
  validatePostId,
  validateUpdateComment,
} from "./comment.validator";

const router = express.Router();

router.post(
  "/",
  authPermission("ADMIN", "USER"),
  validateCreateComment,
  catchAsync(commentController.createComment),
);
router.get(
  "/post/:postId",
  authPermission("ADMIN", "USER"),
  validatePostId,
  validateCommentQuery,
  catchAsync(commentController.getCommentsByPost),
);
router.get(
  "/:id",
  authPermission("ADMIN", "USER"),
  validateCommentId,
  catchAsync(commentController.getCommentById),
);
router.patch(
  "/:id",
  authPermission("ADMIN", "USER"),
  validateCommentId,
  validateUpdateComment,
  catchAsync(commentController.updateComment),
);
router.delete(
  "/:id",
  authPermission("ADMIN", "USER"),
  validateCommentId,
  catchAsync(commentController.deleteComment),
);

export const commentRouter: express.Router = router;