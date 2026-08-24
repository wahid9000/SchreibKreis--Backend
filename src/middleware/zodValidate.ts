import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type Source = "body" | "query" | "params";

export const zodValidate = <T extends z.ZodTypeAny>(
  schema: T,
  source: Source = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      if (source === "query") {
        Object.keys(req.query).forEach((k) => delete (req.query as any)[k]);
        Object.assign(req.query, parsed);
      } else {
        req[source] = parsed;
      }
      next();
    } catch (error) {
      next(error); // Let globalErrorHandler normalize the ZodError
    }
  };
};
