import { changePasswordSchema, emailSchema } from "@/schemas/schemas";
import z from "zod";
export type AccessToken = string;

export type SeachParams = { [key: string]: string };
export type OAuthProvider = "google" | "facebook";

//placeholder types
export type UserRole = "ADMIN" | "USER";
export type User = { name: string; role: UserRole };
export type AuthResponse = { accessToken: AccessToken; user: User };
export type EmailSchema = z.infer<typeof emailSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
