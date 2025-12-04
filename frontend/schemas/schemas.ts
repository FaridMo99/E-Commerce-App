import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE, passwordSchema, productSchema, signupSchema } from "@monorepo/shared";
import z from "zod";

export const clientSignupSchema = signupSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    password: signupSchema.shape.password,
    confirmPassword: clientSignupSchema.shape.confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const changePasswordAuthenticatedSchema = changePasswordSchema.safeExtend({
  oldPassword: passwordSchema,
});


export const clientImageSchema = z
  .instanceof(File, {
    message: "Only JPEG, JPG, PNG, and WebP images are allowed",
  })
  .refine((file) => file.size <= IMAGE_MAX_SIZE, {
    message: "File size must be less than 10 MB",
  })
  .refine((file) => IMAGE_ALLOWED_TYPES.includes(file.type), {
    message: "Only JPEG, JPG, PNG, and WebP images are allowed",
  })
  .refine((file) => file.name.length <= 255, {
    message: "File name is too long",
  });

  export const clientImagesObjectSchema = z.object({
    images: z
      .array(clientImageSchema, "Atleast 1, max. 5 Images")
      .min(1, "At least one image is required")
      .max(5, "Maximum 5 images allowed"),
  });

export type ClientProductSchema = z.infer<typeof fullClientProductSchema>

  export const fullClientProductSchema = productSchema.extend({
    ...clientImagesObjectSchema.shape,
  });