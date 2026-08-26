import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { createAppError } from "../utils/AppError";
import { Prisma } from "../generated/prisma/client";

const handleZodError = (err: ZodError) => {
  const issues = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  return createAppError(400, `Validation failed — ${issues.join("; ")}`);
};

const handlePrismaUniqueError = (err: any) => {
  const field = err.meta?.target?.[0] || "field";
  return createAppError(
    409,
    `Duplicate value for ${field}. Please use another.`,
  );
};

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status || "error",
    statusCode: err.statusCode || 500,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  // TODO: (need add Pino, Sentry Logger here)

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

  let error = err;

  if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      error = createAppError(400, "Requested resource not found");
    } else if (err.code === "P2002") {
      error = handlePrismaUniqueError(err); // Prisma unique constraint
    } else if (err.code === "P2003") {
      error = createAppError(409, "Foreign key constraint failed");
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    error = createAppError(500, "Error occured during query execution");
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      createAppError(
        401,
        "Authentication failed. Please check your credentials.",
      );
    } else if (err.errorCode === "P1001") {
      createAppError(400, "Cannot reach database server.");
    }
  } else if (err instanceof SyntaxError && "body" in err)
    error = createAppError(400, "Invalid JSON in request body");

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
    return;
  }

  sendErrorProd(error, res);
};

export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
