import z from "zod";
import { loginSchema, signupSchema } from "./schemas";


type LoginSchema = z.infer<typeof loginSchema>
type SignupSchema = z.infer<typeof signupSchema>