import { z } from "zod";

export const commentIdSchema = z.object({
  id: z.string().uuid("Invalid comment ID"),
});

export const postIdSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
});

export const createCommentSchema = z
  .object({
    postId: z.string().uuid("Invalid post ID"),
    content: z
      .string({ message: "Content is required and must be a string" })
      .trim()
      .min(1, "Comment cannot be empty")
      .max(2000, "Comment must be 2000 characters or less"),
    parentId: z
      .string()
      .uuid("Invalid parent comment ID")
      .nullable()
      .optional(),
  })
  .strict();

export const updateCommentSchema = z
  .object({
    content: z
      .string({ message: "Comment must be a string" })
      .trim()
      .min(1, "Comment cannot be empty")
      .max(2000, "Comment must be 2000 characters or less")
      .optional(),
  })
  .strict();

export const moderateCommentSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectReason: z
      .string({ message: "Reject reason must be a string" })
      .trim()
      .min(1, "Reject reason cannot be empty")
      .max(2000, "Reject reason must be 2000 characters or less")
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === "REJECTED" && value.rejectReason === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["rejectReason"],
        message: "Reject reason is required when rejecting a comment",
      });
    }
    if (value.status === "APPROVED" && value.rejectReason !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["rejectReason"],
        message: "Reject reason must not be provided when approving a comment",
      });
    }
  });

export const commentQuerySchema = z.object({
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
