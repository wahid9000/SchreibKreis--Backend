import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z
      .string({ message: "Name must be a string" })
      .trim()
      .min(1, "Name cannot be empty")
      .max(255, "Name must be 255 characters or less")
      .optional(),
    phone: z
      .string({ message: "Phone must be a string" })
      .trim()
      .max(30, "Phone must be 30 characters or less")
      .nullable()
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one user field is required",
  });
