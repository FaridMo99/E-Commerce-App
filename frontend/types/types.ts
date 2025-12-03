import { changePasswordSchema } from "@/schemas/schemas";
import { DailyRevenue } from "@monorepo/shared";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import z from "zod";

export type Route = { link: string; text: string; icon: LucideIcon };

export type AccessToken = string;

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

export type CartItem = {
  quantity: number;
  id: string;
  product: Product;
  total:number
};

export type Product = {
  id: string;
  name: string;
  description: string;
  currency: CurrencyISO;
  price: number; //float
  sale_price: number; //float
  stock_quantity: number;
  averageRating: number;
  published_at: Date | null; // can be only null when user is not admin, and admin also gets is_public field with boolean value
  imageUrls: string[];
  category: ProductCategory;
  _count: {
    reviews: number;
  };
};

export type AdminProduct = Product & { is_public: boolean };

export type ProductMetaInfos = {
  minPrice: number;
  maxPrice: number;
  totalItems: number;
  currency: CurrencyISO;
};

export type Order = {
    id: string,
    ordered_at: Date,
    status: OrderStatus,
    total_amount: number,
    currency: CurrencyISO,
    shipping_address: string | null,
    items: { product: Product }[],
    user:AuthUser,
    payment: {
        method:PaymentMethod,
        status:PaymentStatus
    } | null
};

export type Cart = {
    id: string,
  items: CartItem[]
    total:number
};
    
export type ProductReview = {
  id: string;
  product_id: string;
  product: {
    name:string
  },
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

export type AdminRevenue = DailyRevenue[] & {
  totalRevenue: number;
  currency?: CurrencyISO;
  totalOrders: number;
};

export type AdminNewUser = {
    count: number
};
export type AdminTopseller = {
    product: {
        id: string;
        name: string;
        imageUrls:string[]
    };
    totalSold: number;
}


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