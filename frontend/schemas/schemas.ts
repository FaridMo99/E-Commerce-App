import { passwordSchema, signupSchema } from "@monorepo/shared"

export const clientSignupSchema = signupSchema
  .extend({
    confirmPassword: passwordSchema, 
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });