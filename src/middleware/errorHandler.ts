import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status || "error",
    statusCode: err.statusCode || 500,
    message: err.message || "Something went wrong",
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      status: err.status || "error",
      statusCode: err.statusCode || 500,
      message: err.message || "Something went wrong",
    });
    return;
  }

  res.status(500).json({
    success: false,
    status: "error",
    statusCode: 500,
    message: "Something went wrong on the server",
  });
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
    return;
  }

  sendErrorProd(err, res);
};

export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
