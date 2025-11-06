import z from "zod"

const isAdult = (date: Date) => {
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

export const signupSchema = loginSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  birthdate: z.string().refine(
    (dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && isAdult(date);
    },
    { message: "You must be at least 18 years old and provide a valid date" }
  ),
  address: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s,.-]{10,100}$/,
      "Address must be valid (street, house number, postal code, country)"
    ),
});

export const ordersQuerySchema = z.object({
  sort: z.enum(["status", "ordered_at"]).optional().default("ordered_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z
    .string()
    .refine((val) => Number(val) > 0 && Number(val) % 5 === 0, {
      message: "Limit must be a positive number divisible by 5",
    })
    .optional()
    .default("10"),
  page: z
    .string()
    .refine((val) => Number(val) > 0, {
      message: "Page must be a positive number",
    })
    .optional()
    .default("1"),
  status: z.enum(["ORDERED", "DELIVERING", "DELIVERED"]).optional(),
});