import { changePasswordSchema } from "@/schemas/schemas";
import { ReactNode } from "react";
import z from "zod";


export type AccessToken = string;

export type SeachParams = { [key: string]: string };
export type OAuthProvider = "google" | "facebook";

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

//prisma enums
export type OrderStatus = "PENDING" | "CANCELLED" | "ORDERED" | "DELIVERING" | "DELIVERED"
export type PaymentStatus =  "PENDING" | "CANCELLED" | "COMPLETED" | "FAILED"
export type PaymentMethod = "CARD" | "PAYPAL" | "GIROPAY" | "KLARNA"
export type CurrencyISO = "EUR" | "USD" | "GBP";



//frontend types for return of api
export type UserRole = "ADMIN" | "USER";
export type User = { name: string; role: UserRole, countryCode:string, currency:CurrencyISO };
export type AuthResponse = { accessToken: AccessToken; user: User };

export type ProductCategory = {
    id: string,
    name:string
}

export type PriceTypes =
    {
      price_in_GBP: number;
      sale_price_in_GBP: number | null;
    }
  | {
      price_in_EUR: number;
      sale_price_in_EUR: number | null;
    }
  | {
      price_in_USD: number;
      sale_price_in_USD: number | null;
    }

export type Product = {
      id: string;
      name: string;
      description: string;
      currency: CurrencyISO;
      stock_quantity: number;
      published_at: Date | null; // can be only null when user is not admin, and admin also gets is_public field with boolean value
      imageUrls: string[];
      category: ProductCategory;
      _count: {
        reviews: number;
      };
    } & PriceTypes



export type Order = {
    id: string,
    ordered_at: Date,
    status: OrderStatus,
    total_amount: number,
    currency: CurrencyISO,
    shipping_address: string | null,
    items: {product: Product}[],
    payment: {
        method:PaymentMethod,
        status:PaymentStatus
    } | null
};

export type Cart = {
    id: string,
    _count: {
        items: number
    }
    items: {
            quantity: number,
            id: string,
            product:Product
    }[]
};
    
export type ProductReview = {
  id: string;
  product_id: string;
  user: {
      name: string;
  };
  title: string;
  content: string | null;
  rating: number;
  created_at: Date;
};

export type HomeProducts = {
  newProducts: Product[];
  trendingProducts: Product[];
  productsOnSale: Product[];
  categoryProducts: Product[];
};



//protected user data, move this to protected user route for settings
export type AuthUser = User & {
    birthdate: Date | null,
    created_at: Date,
    address:string | null
};

export type AuthProductReview = ProductReview & {
    is_public:boolean
}


//admin types, move them to admin pages/layout so they wont get send with these normal user types
export type AdminSetting = {
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminRevenue = {
    revenue: number
};

export type AdminNewUser = {
    count: number
};
export type AdminTopseller = {
    product: {
        id: string;
        currency: CurrencyISO;
        name: string;
        price: number;
        sale_price: number | null;
    };
    totalSold: number;
    price: number;
    sale_price: number | null;
}[];


//move all types from other files here

//somehow select on backend returns way too much even though it should limit

//utility nextjs type

export type SearchParams = Record<string, string | string[] | undefined>;
export type Params = Record<string, string | undefined>;
export type ParamsProps = { params: Params };
export type SearchParamsProps = { searchParams: SearchParams };
export type ParamsAndSearchParamsProps = ParamsProps & SearchParamsProps;
export type Children = ReactNode;
export type ChildrenProps = { children: Children };