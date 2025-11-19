import z from "zod";
import {
  addCartItemSchema,
  emailSchema,
  itemQuantitySchema,
  loginSchema,
  ordersQuerySchema,
  productSchema,
  productsQuerySchema,
  reviewSchema,
  reviewsQuerySchema,
  settingsSchema,
  signupSchema,
  timeframeQuerySchema,
  updateProductSchema,
  updateUserSchema,
} from "./schemas.js";

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type OrdersQuerySchema = z.infer<typeof ordersQuerySchema>;
export type ProductsQuerySchema = z.infer<typeof productsQuerySchema>;
export type ProductSchema = z.infer<typeof productSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type TimeframeQuerySchema = z.infer<typeof timeframeQuerySchema>;
export type ReviewSchema = z.infer<typeof reviewSchema>;
export type ReviewsQuerySchema = z.infer<typeof reviewsQuerySchema>;
export type AddCartItemSchema = z.infer<typeof addCartItemSchema>;
export type ItemQuantitySchema = z.infer<typeof itemQuantitySchema>;
export type SettingsSchema = z.infer<typeof settingsSchema>;
export type EmailSchema = z.infer<typeof emailSchema>;