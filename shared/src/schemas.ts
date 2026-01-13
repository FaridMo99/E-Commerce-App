import z from "zod";
import { DEFAULT_NICE_PRICE, STRIPE_ORDER_PRICE_LIMIT } from "./constants.js";

const allowedCountries = ["US", "GB", "DE"];
const countryCodeSchema = z.enum(
  allowedCountries,
  "Country code must be one of US, GB, or DE"
);

//here as float, in controller turn to cents
export const priceSchema = z
  .preprocess(
    (val: string | number) => {
      if (typeof val === "string") val = val.replace(",", ".");
      const number = typeof val === "number" ? val : parseFloat(val);
      return number;
    },
    z
      .number("Price is required")
      .max(STRIPE_ORDER_PRICE_LIMIT, "Price cannot exceed 999,999.99")
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


export const currencySchema = z.enum(
  ["USD", "EUR", "GBP"],
  "Must be USD EUR or GBP"
);


export const passwordSchema = z
  .string()
  .min(5, "Password must be at least 5 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number");


export const emailShape = z.email("Invalid email address");

export const emailSchema = z.object({ email: emailShape });


export const loginSchema = emailSchema.extend({
  password: passwordSchema,
});


export const signupSchema = loginSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  birthdate: z
    .preprocess((val) => {
      if (!val || val === "") return undefined;
      return typeof val === "string" ? new Date(val) : val;
    }, z.date().optional())
    .refine(
      (val) => {
        if (val === undefined) return true;
        return !isNaN(val.getTime());
      },
      {
        message: "Birthdate must be a valid date",
      }
    ),
});


export const updateUserSchema = signupSchema
  .omit({ password: true, email: true })
  .partial()
  .extend({
    name: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().min(3).optional()
    ),
    street: z.string().optional(),
    houseNumber: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    
    countryCode: z.union([countryCodeSchema, z.literal("")]).optional(),
    currency: currencySchema.optional(),
  })
  .superRefine((data, ctx) => {
    const addressFields: Array<keyof typeof data> = [
      "street",
      "houseNumber",
      "city",
      "postalCode",
      "countryCode",
      "state",
    ];

    const filledFields = addressFields.filter(
      (field) =>
        data[field] !== undefined && data[field] !== null && data[field] !== ""
    );

    const isPartiallyFilled =
      filledFields.length > 0 && filledFields.length < addressFields.length;

    if (isPartiallyFilled) {
      addressFields.forEach((field) => {
        if (!data[field] || data[field] === "") {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: `${field} is required to complete the address`,
          });
        }
      });
    }
  });


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


export const productsQuerySchema = productsMetaInfosQuerySchema.extend({
  sortBy: z.enum(["name", "price", "created_at"]).optional(),
  sortOrder: sortOrderSchema,
});


export const reviewsQuerySchema = paginationSchema.extend({
  rating: z.preprocess(
    (val) => Number(val),
    z.number().min(0).max(5).optional()
  ),
  created_at: z
    .preprocess(
      (val) => (typeof val === "string" ? new Date(val) : undefined),
      z.date().optional()
    )
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid created_at date",
    }),
  sortBy: z.enum(["rating", "created_at"]).optional(),
  sortOrder: sortOrderSchema,
});


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
  sale_price: z
    .union([
      z.literal(""),
      priceSchema,
    ])
    .optional(),
});

export const updateProductSchema = productSchema.partial();


export const timeframeQuerySchema = z.object({
  from: z
    .preprocess(
      (val) => (typeof val === "string" ? new Date(val) : undefined),
      z.date().optional()
    )
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid 'from' date",
    }),
  to: z
    .preprocess(
      (val) => (typeof val === "string" ? new Date(val) : undefined),
      z.date().optional()
    )
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid 'to' date",
    }),
});


export const reviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  rating: z.preprocess((val) => Number(val), z.number().min(0).max(5)),
  isPublic: z.boolean().optional(),
});


const itemQuantity = z.preprocess(
  (val) => Number(val),
  z.number().int().min(1, "Quantity must be at least 1")
);

export const itemQuantitySchema = z.object({
  quantity: itemQuantity,
});

export const productIdSchema = z.object({
  productId: z.string(),
});

export const addCartItemSchema = productIdSchema.extend({
  quantity: itemQuantity,
});


export const settingsSchema = z.object({
  key: z.string().nonempty("Key cannot be empty"),
  value: z.string().nonempty("Value cannot be empty"),
});
