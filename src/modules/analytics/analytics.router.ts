import express from "express";
import { authPermission } from "../../middleware/authPermission";
import { catchAsync } from "../../middleware/errorHandler";
import { analyticsController } from "./analytics.controller";

const router = express.Router();

router.get(
  "/",
  authPermission("ADMIN"),
  catchAsync(analyticsController.getAnalytics),
);

export const analyticsRouter: express.Router = router;
