import z from "zod";
import { DEFAULT_NICE_PRICE } from "./constants.ts";

/** --- Price Schema --- */
//here as float, in controller turn to cents
export const priceSchema = z
  .preprocess(
    (val) => {
      if (typeof val === "string") val = val.replace(",", ".");
      const number = typeof val === "number" ? val : parseFloat(val);
      return number;
    },
    z.number("Price is required")
  )
  .refine(
    (val) => {
      if (isNaN(val)) return false;
      const rounded = Math.round(val * 100) / 100;
      const fraction = +rounded.toFixed(2) % 1;

      return Math.abs(fraction - DEFAULT_NICE_PRICE / 100) < 0.001;
    },
    { message: `Price must end with .${DEFAULT_NICE_PRICE}` }
  );

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
export const updateUserSchema = signupSchema
  .omit({ password: true,email:true })
  .partial()
  .extend({
    street: z.string().optional(),
    houseNumber: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    countryCode: z.string().optional(),
    currency: currencySchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasAny =
      data.street ||
      data.houseNumber ||
      data.city ||
      data.state ||
      data.postalCode ||
      data.countryCode;

    const requiredFields: Array<keyof typeof data> = [
      "street",
      "houseNumber",
      "city",
      "postalCode",
      "countryCode",
    ];

    if (hasAny) {
      for (const field of requiredFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: `${field} is required when providing an address`,
          });
        }
      }
    }
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
    .optional(),
  page: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z.number()
    )
    .refine((val) => val > 0, { message: "Page must be a positive number" })
    .optional(),
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

//products meta query schema
export const productsMetaInfosQuerySchema = paginationSchema.extend({
  search: z
    .string()
    .max(255, "Search is too long, max 255 Characters")
    .optional(),
  category: z.string().optional(),
  minPrice: z.preprocess((val) => {
    if (val === undefined || val === "") return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : n;
  }, z.number().nonnegative().optional()),
  maxPrice: z.preprocess((val) => {
    if (val === undefined || val === "") return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : n;
  }, z.number().nonnegative().optional()),
  sale: z
    .preprocess(
      (val) => (val === "true" ? true : val === "false" ? false : val),
      z.boolean()
    )
    .optional(),
});

/** --- Products Query Schema --- */
export const productsQuerySchema = productsMetaInfosQuerySchema.extend({
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
  name: z.string().nonempty("Field is required"),
  description: z.string().nonempty("Field is required"),
  price: priceSchema,
  stock_quantity: z
    .preprocess(
      (val) =>
        val === "" || val === null || val === undefined ? NaN : Number(val),
      z.number().int()
    )
    .refine((val) => !isNaN(val), { message: "Quantity is required" })
    .refine((val) => val >= 0, { message: "Quantity must be 0 or more" }),
  is_public: z.boolean().default(false),
  category: z.string("Field is required").nonempty("Field is required"),
  sale_price: priceSchema.optional().or(z.literal("")),
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
