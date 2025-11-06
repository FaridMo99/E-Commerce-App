import z from "zod";
import { loginSchema, ordersQuerySchema, signupSchema } from "./schemas.js";


export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>
export type OrdersQuerySchema = z.infer<typeof ordersQuerySchema>;