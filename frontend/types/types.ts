import { changePasswordSchema, emailSchema } from "@/schemas/schemas";
import z from "zod";


export type AccessToken = string;

export type SeachParams = { [key: string]: string };
export type OAuthProvider = "google" | "facebook";


export type EmailSchema = z.infer<typeof emailSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

//prisma enums
export type OrderStatus = "PENDING" | "CANCELLED" | "ORDERED" | "DELIVERING" | "DELIVERED"
export type PaymentStatus =  "PENDING" | "CANCELLED" | "COMPLETED" | "FAILED"
export type PaymentMethod = "CARD" | "PAYPAL" | "GIROPAY" | "KLARNA"
export type CurrencyISO = "EUR" | "USD" | "GBP";



//frontend types for return of api
export type UserRole = "ADMIN" | "USER";
export type User = { name: string; role: UserRole };
export type AuthResponse = { accessToken: AccessToken; user: User };

export type ProductCategory = {
    id: string,
    name:string
}
export type Product = {
    id: string,
    price: number,
    sale_price: number | null,
    name: string,
    description: string,
    curreny:CurrencyISO,
    stock_quantity: number,
    published_at: Date | null, // can be only null when user is not admin, and admin also gets is_public field with boolean value
    imageUrls: string[],
    category:ProductCategory,
    _count: {
        reviews:number
    },
};

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
  recentlyViewedProducts: Product[];
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