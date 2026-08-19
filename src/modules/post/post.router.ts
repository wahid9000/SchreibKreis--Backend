import express from "express";
import { postController } from "./post.controller";
import { catchAsync } from "../../middleware/errorHandler";
import validatePost from "../../middleware/validatePost";
import { authPermission } from "../../middleware/authPermission";

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
  catchAsync(postController.getPosts),
);

export const postRouter: express.Router = router;
