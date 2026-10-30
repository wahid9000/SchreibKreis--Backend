import express from "express";
import { authPermission } from "../../middleware/authPermission";
import { catchAsync } from "../../middleware/errorHandler";
import { zodValidate } from "../../middleware/zodValidate";
import { userController } from "./user.controller";
import { updateUserSchema } from "./user.validator";

const router = express.Router();

router.patch(
  "/me",
  authPermission("ADMIN", "USER"),
  zodValidate(updateUserSchema),
  catchAsync(userController.updateUser),
);

export const userRouter: express.Router = router;
