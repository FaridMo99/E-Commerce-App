import type { Prisma } from "../generated/prisma/client.js";

// SELECT CLAUSES

export const userSelect: Prisma.UserSelect = {
  name: true,
  role: true,
  countryCode: true,
  currency: true,
};

export const userAuthenticatedSelect: Prisma.UserSelect = {
  ...userSelect,
  created_at: true,
  address: true,
  birthdate: true,
};

export const categorySelect: Prisma.CategorySelect = {
  name: true,
  id: true,
};

export const productSelect: Prisma.ProductSelect = {
  id: true,
  price: true,
  sale_price: true,
  name: true,
  description: true,
  stock_quantity: true,
  published_at: true,
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
};

export const orderSelect: Prisma.OrderSelect = {
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
    },
  },
  payment: {
    select: {
      method: true,
      status: true,
    },
  },
};

export const cartSelect: Prisma.CartSelect = {
  id: true,
  items: {
    select: {
      quantity: true,
      id: true,
      product: {
        select:productSelect
      },
    },
  },
};

export const reviewSelect: Prisma.ReviewSelect = {
  id: true,
  product_id: true,
  product: {
    select: {
      name: true,
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
};

//selects for users that are authed and need their own ressources too, like if not public but their own
export const authenticatedReviewSelect: Prisma.ReviewSelect = {
  ...reviewSelect,
  is_public: true,
};

//for admin
export const settingsSelect: Prisma.SettingsSelect = {
  key: true,
  value: true,
  createdAt: true,
  updatedAt: true,
};

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

export type OrderWithSelectedFields = Prisma.OrderGetPayload<{
  select: typeof orderSelect;
}>;