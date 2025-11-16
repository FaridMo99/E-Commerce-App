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


//frontend types for return of api
export type User = {};
export type Product = {};
export type Order = {};
export type Cart = {};
export type ProductReview = {};
export type ProductCategory = {};


//protected user data, move this to protected user route for settings
export type AuthUser = {};


//admin types, move them to admin pages/layout so they wont get send with these normal user types
export type AuthAdmin = {};
export type AdminSetting = {};
export type AdminRevenue = {};
export type AdminNewUser = {};
export type AdminTopseller = {};
