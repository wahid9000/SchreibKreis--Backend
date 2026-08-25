import express from "express";
import { emailDigestController } from "./emailDigest.controller";
import { catchAsync } from "../../middleware/errorHandler";
const router = express.Router();

router.post(
  "/",
  catchAsync(emailDigestController.sendWeeklyDigestController),
);

export const emailDigestRouter: express.Router = router;
