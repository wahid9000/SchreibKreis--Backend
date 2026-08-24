import { Request, Response } from "express";
import { analyticsService } from "./analytics.service";

const getAnalytics = async (req: Request, res: Response) => {
  const requestedRange =
    typeof req.query.range === "string" ? req.query.range : "30d";
  const range = ["7d", "30d", "90d", "1y", "all"].includes(requestedRange)
    ? (requestedRange as "7d" | "30d" | "90d" | "1y" | "all")
    : "30d";
  const analytics = await analyticsService.getAnalytics(range);

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    data: analytics,
  });
};

export const analyticsController = {
  getAnalytics,
};
