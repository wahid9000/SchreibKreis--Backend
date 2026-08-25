import { NextFunction, Request, Response } from "express";
import { createAppError } from "../../utils/AppError";
import { emailDigestService } from "./emailDigest.service";

const sendWeeklyDigestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-internal-api-key"];
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return next(createAppError(401, "Unauthorized"));
  }

  const result = await emailDigestService.sendWeeklyDigestService();

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    data: result,
  });
};

export const emailDigestController = {
  sendWeeklyDigestController,
};
