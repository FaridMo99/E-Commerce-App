import { passwordSchema, signupSchema } from "@monorepo/shared";
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