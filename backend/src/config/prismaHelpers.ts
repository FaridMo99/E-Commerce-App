import type { Prisma } from "../generated/prisma/client.js";

// SELECT CLAUSES

export const userSelect = {
  name: true,
  role: true,
  countryCode: true,
  currency: true,
} satisfies Prisma.UserSelect;

export const userAuthenticatedSelect = {
  ...userSelect,
  created_at: true,
  birthdate: true,
  email: true,
  street: true,
  houseNumber: true,
  city: true,
  state: true,
  postalCode: true,
  createdBy: true,
} satisfies Prisma.UserSelect;

export const categorySelect = {
  name: true,
  id: true,
} satisfies Prisma.CategorySelect;

export const productSelect = {
  id: true,
  price: true,
  sale_price: true,
  name: true,
  description: true,
  stock_quantity: true,
  published_at: true,
  updated_at: true,
  imageUrls: true,
  currency: true,
  category: {
    select: {
      ...categorySelect,
    },
  },
  reviews: {
    where: {
      is_public: true,
    },
    select: {
      rating: true,
    },
  },
  _count: {
    select: {
      reviews: {
        where: {
          is_public: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

export const orderSelect = {
  id: true,
  ordered_at: true,
  status: true,
  total_amount: true,
  currency: true,
  shipping_address: true,
  user: {
    select: {
      ...userAuthenticatedSelect,
    },
  },
  items: {
    select: {
      product: {
        select: {
          ...productSelect,
        },
      },
      price_at_purchase: true,
      quantity: true,
      currency: true,
    },
  },
  payment: {
    select: {
      method: true,
      status: true,
    },
  },
} satisfies Prisma.OrderSelect;

export const cartItemSelect = {
      quantity: true,
      id: true,
      product: {
        select: { ...productSelect },
  },
} satisfies Prisma.CartItemSelect;

export const cartSelect = {
  id: true,
  items: {
    select: {
      quantity: true,
      id: true,
      product: {
        select: {...productSelect},
      },
    },
  },
} satisfies Prisma.CartSelect;

export const reviewSelect = {
  id: true,
  product_id: true,
  product: {
    select: {
      name: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  },
  user: {
    select: {
      name: true,
    },
  },
  title: true,
  content: true,
  rating: true,
  created_at: true,
} satisfies Prisma.ReviewSelect;

//selects for users that are authed and need their own ressources too, like if not public but their own
export const authenticatedReviewSelect = {
  ...reviewSelect,
  is_public: true,
} satisfies Prisma.ReviewSelect;

//for admin
export const settingsSelect = {
  key: true,
  value: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SettingsSelect;

//WHERE CLAUSES that all have to have
export const productWhere: Prisma.ProductWhereInput = {
  is_public: true,
  deleted: false,
};

export const userWhere: Prisma.UserWhereInput = {
  verified: true,
};

export const reviewWhere: Prisma.ReviewWhereInput = {
  is_public: true,
};

export type ProductWithSelectedFields = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

export type CartWithSelectedFields = Prisma.CartGetPayload<{
  select: typeof cartSelect;
}>;

export type CartItemWithSelectedFields = Prisma.CartItemGetPayload<{
  select: typeof cartItemSelect;
}>;

export type OrderWithSelectedFields = Prisma.OrderGetPayload<{
  select: typeof orderSelect;
}>;