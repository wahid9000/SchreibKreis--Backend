import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { Request, Response } from "express";
import { redis } from "../lib/redis";

const createLimiter = (
  windowMs: number,
  max: number,
  message: string,
  prefix: string,
) =>
  rateLimit({
    store: new RedisStore({
      prefix: `rl:${prefix}:`,
      sendCommand: (...args: string[]) =>
        redis.call(...(args as [string, ...string[]])) as Promise<any>,
    }),
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    skip: (req) => process.env.NODE_ENV === "development",
    keyGenerator: (req: Request, res: Response) => {
      return (req.user?.id as string) || ipKeyGenerator(req.ip || "unknown");
    },

    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        status: "fail",
        statusCode: 429,
        message,
      });
    },
  });

export const authLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Too many authentication attempts. Please try again after 15 minutes.",
  "auth",
);

export const publicLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests. Please try again later.",
  "public",
);

export const writeLimiter = createLimiter(
  60 * 1000,
  10,
  "Too many write operations. Please slow down.",
  "write",
);
