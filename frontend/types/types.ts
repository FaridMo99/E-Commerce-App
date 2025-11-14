import { changePasswordSchema, emailSchema } from "@/schemas/schemas";
import z from "zod"
export type AccessToken = string;

export type SeachParams = { [key: string]: string };

//placeholder types
export type User = { name: string };
export type AuthResponse = { accessToken: AccessToken; user: User };
export type EmailSchema = z.infer<typeof emailSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>