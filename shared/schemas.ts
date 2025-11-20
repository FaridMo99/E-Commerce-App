import z from "zod";

/** --- Price Schema --- */
export const priceSchema = z
  .preprocess((val) => {
    // allow strings that can be converted to number
    const n = typeof val === "string" ? Number(val) : val;
    return n;
  }, z.number().int().nonnegative("Price must be 0 or greater"))
  .refine((val) => {
    const cents = Math.round((val % 1) * 100);
    return cents === 95 || cents === 99;
  }, "Price must end with .95 or .99");

/** --- Currency Schema --- */
export const currencySchema = z.enum(["USD", "EUR", "GBP"],"Must be USD EUR or GBP");

/** --- Password Schema --- */
export const passwordSchema = z
  .string()
  .min(5, "Password must be at least 5 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number");

/** --- Email Schema --- */
export const emailShape = z.email("Invalid email address");

export const emailSchema = z.object({ email: emailShape });

/** --- Login Schema --- */
export const loginSchema = emailSchema.extend({
  password: passwordSchema,
});

/** --- Signup Schema --- */
export const signupSchema = loginSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  birthdate: z
    .preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date().optional()
    )
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Birthdate must be a valid date",
    }),
});

/** --- Update User Schema --- */
    //make this proper, this rn just momentarily
export const updateUserSchema = signupSchema.partial().extend({
  address: z.string().optional(),
  countryCode: z.string(),
  currency:currencySchema
});

/** --- Orders Query Schema --- */
export const ordersQuerySchema = z.object({
  sort: z.enum(["status", "ordered_at"]).optional().default("ordered_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number()
    )
    .refine((val) => val > 0 && val % 5 === 0, {
      message: "Limit must be a positive number divisible by 5",
    })
    .optional()
    .default(10),
  page: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number()
    )
    .refine((val) => val > 0, { message: "Page must be a positive number" })
    .optional()
    .default(1),
  status: z
    .enum(["ORDERED", "DELIVERING", "DELIVERED", "PENDING", "CANCELLED"])
    .optional(),
});

/** --- Sort / Pagination Reusable Schemas --- */
export const sortOrderSchema = z.enum(["asc", "desc"]).optional();
export const paginationSchema = z.object({
  page: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number()
    )
    .optional(),
  limit: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number()
    )
    .optional(),
});

/** --- Products Query Schema --- */
export const productsQuerySchema = paginationSchema.extend({
  search: z
    .string()
    .max(255, "Search is too long, max 255 Characters")
    .optional(),
  category: z.string().optional(),
  minPrice: z.preprocess(
    (val) => Number(val),
    z.number().nonnegative().optional()
  ),
  maxPrice: z.preprocess(
    (val) => Number(val),
    z.number().nonnegative().optional()
  ),
  sale: z
    .preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.boolean()
    )
    .optional(),
  sortBy: z.enum(["name", "price", "created_at"]).optional(),
  sortOrder: sortOrderSchema,
});

/** --- Reviews Query Schema --- */
export const reviewsQuerySchema = paginationSchema.extend({
  rating: z.preprocess(
    (val) => Number(val),
    z.number().min(0).max(5).optional()
  ),
  created_at: z
    .preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date().optional()
    )
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid created_at date",
    }),
  sortBy: z.enum(["rating", "created_at"]).optional(),
  sortOrder: sortOrderSchema,
});

/** --- Product Schema --- */
export const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: priceSchema,
  stock_quantity: z.preprocess((val) => Number(val), z.number().int()),
  is_public: z.boolean().default(false),
  category: z.string(),
  sale_price: priceSchema,
});

export const updateProductSchema = productSchema.partial();

/** --- Timeframe Query Schema --- */
export const timeframeQuerySchema = z.object({
  from: z
    .preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date().optional()
    )
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid 'from' date",
    }),
  to: z
    .preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date().optional()
    )
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid 'to' date",
    }),
});

/** --- Review Schema --- */
export const reviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  rating: z.preprocess((val) => Number(val), z.number().min(0).max(5)),
  isPublic: z.boolean().optional(),
});

/** --- Item / Cart Schemas --- */
const itemQuantity = z.preprocess(
  (val) => Number(val),
  z.number().int().min(1, "Quantity must be at least 1")
);

export const itemQuantitySchema = z.object({
  quantity: itemQuantity,
});

export const productIdSchema = z.object({
  productId: z.string(),
})

export const addCartItemSchema = productIdSchema.extend({
  quantity: itemQuantity,
});

/** --- Settings Schema --- */
export const settingsSchema = z.object({
  key: z.string().nonempty("Key cannot be empty"),
  value: z.string().nonempty("Value cannot be empty"),
});
