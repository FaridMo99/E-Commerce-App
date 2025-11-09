import z from "zod"

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
  birthdate: z.date().transform((dateStr) => new Date(dateStr)),
  address: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s,.-]{10,100}$/,
      "Address must be valid (street, house number, postal code, country)"
    ),
});

export const updateUserSchema = signupSchema.partial()

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


export const sortOrderSchema = z.enum(["asc", "desc"]).optional();
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

//should have sorting(also through categories), filtering, pagination, search functionality, 
export const productsQuerySchema = paginationSchema.extend({
  search: z.string().max(255).optional(),
  // Filtering
  category: z.string().optional(),
  minPrice:z.union([
    z.number(),
    z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").optional(),
  ]),
  maxPrice: z.union([
    z.number(),
    z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format"),
  ]).optional(),
  // Sorting
  sortBy: z.enum(["name", "price", "created_at"]).optional(),
  sortOrder: sortOrderSchema,
});

export const reviewsQuerySchema = paginationSchema.extend({
  //filter
  rating: z.number().min(0).max(5).optional(),
  created_at: z.date().optional(),
  //sort
  sortBy: z.enum(["rating", "created_at"]).optional(),
  sortOrder: sortOrderSchema,
  // Pagination
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});



export const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.union([
    z.number(),
    z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format"),
  ]),
  stock_quantity: z.number().int(),
  is_public: z.boolean().default(false),
  category: z.string(),
});

export const updateProductSchema = productSchema.partial()

export const timeframeQuerySchema = z.object({
  from: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid 'from' date",
    }),
  to: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid 'to' date",
    }),
});

export const reviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  rating: z.number().min(0).max(5),
  isPublic: z.boolean().optional(),
});