import z from "zod";
import { loginSchema, ordersQuerySchema, productSchema, productsQuerySchema, signupSchema, updateProductSchema, updateUserSchema } from "./schemas.js";


export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>
export type UpdateUserSchema = z.infer<typeof updateUserSchema>
export type OrdersQuerySchema = z.infer<typeof ordersQuerySchema>;
export type ProductsQuerySchema = z.infer<typeof productsQuerySchema>;
export type ProductSchema = z.infer<typeof productSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;