import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE, passwordSchema, signupSchema } from "@monorepo/shared";
import { emailSchema as emailShape } from "@monorepo/shared";
import z from "zod";

export const clientSignupSchema = signupSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const emailSchema = z.object({ email: emailShape });

export const changePasswordSchema = z
  .object({
    password: signupSchema.shape.password,
    confirmPassword: clientSignupSchema.shape.confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });


export const clientImageSchema = z
  .instanceof(File, {
    message: "Only JPEG, JPG, PNG, and WebP images are allowed",
  })
  .refine((file) => file.size <= IMAGE_MAX_SIZE, {
    message: "File size must be less than 5 MB",
  })
  .refine((file) => IMAGE_ALLOWED_TYPES.includes(file.type), {
    message: "Only JPEG, JPG, PNG, and WebP images are allowed",
  })
  .refine((file) => file.name.length <= 255, {
    message: "File name is too long",
  });
