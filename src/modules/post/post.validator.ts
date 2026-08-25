import { z } from "zod";

export const postSchema = z.object({
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
  thumbnail: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  isFeatured: z.boolean().optional().default(false),
  status: z
    .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
    .optional()
    .default("PUBLISHED"),
  tags: z
    .array(z.string().trim().min(1, "Each tag must be a non-empty string"), {
      message: "Tags must be an array of strings",
    })
    .optional()
    .default([]),
});

export const postQuerySchema = z.object({
  search: z.string().trim().optional(),
  tags: z.string().optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  cursor: z.string().trim().min(1).optional(),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform(Number)
    .pipe(z.number().int().min(1, "Page must be at least 1"))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform(Number)
    .pipe(z.number().int().min(1).max(50, "Limit cannot exceed 50"))
    .optional(),
  sortBy: z.enum(["createdAt", "title", "views"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const ownPostQuerySchema = z.object({
  search: z.string().trim().optional(),
  cursor: z.string().trim().min(1).optional(),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform(Number)
    .pipe(z.number().int().min(1, "Page must be at least 1"))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform(Number)
    .pipe(z.number().int().min(1).max(50, "Limit cannot exceed 50"))
    .optional(),
});

export const postIdSchema = z.object({
  id: z.string().uuid("Invalid post ID"),
});

export const updatePostSchema = z
  .object({
    title: z
      .string({ message: "Title must be a string" })
      .trim()
      .min(1, "Title cannot be empty")
      .max(255, "Title must be 255 characters or less")
      .optional(),
    content: z
      .string({ message: "Content must be a string" })
      .trim()
      .min(1, "Content cannot be empty")
      .max(10000, "Content must be 10000 characters or less")
      .optional(),
    thumbnail: z.string().trim().min(1).nullable().optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    tags: z
      .array(z.string().trim().min(1, "Each tag must be a non-empty string"), {
        message: "Tags must be an array of strings",
      })
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one post field is required",
  });
