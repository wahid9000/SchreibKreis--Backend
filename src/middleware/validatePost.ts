import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { createAppError } from "../utils/AppError";

const postSchema = z.object({
  title: z
    .string({ message: "Title is required and must be a string" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(255, "Title must be 255 characters or less"),
  content: z
    .string({ message: "Content is required and must be a string" })
    .trim()
    .min(1, "Content cannot be empty")
    .max(10000, "Content must be 10000 characters or less"),
  authorId: z
    .string({ message: "authorId is required and must be a string" })
    .trim()
    .min(1, "authorId cannot be empty"),
  thumbnail: z
    .string()
    .trim()
    .min(1, "thumbnail must be a non-empty string")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
  isFeatured: z.boolean().optional().default(false),
  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .optional()
    .default("DRAFT"),
  tags: z
    .array(z.string().trim().min(1, "Each tag must be a non-empty string"), {
      message: "Tags must be an array of strings",
    })
    .optional()
    .default([]),
});

const validatePost = (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = postSchema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error: any) {
    const issue = error?.issues?.[0];

    let message = "Invalid post payload";

    if (issue?.path?.includes("tags")) {
      message = "Tags must be an array of strings";
    } else if (issue?.message) {
      message = issue.message;
    }

    return next(createAppError(400, message));
  }
};

export default validatePost;
