import type { Prisma } from "../generated/prisma/client.js";


// SELECT CLAUSES

export const userSelect: Prisma.UserSelect = {
    name: true,
    role:true
};

export const userAuthenticatedSelect: Prisma.UserSelect = {
    name: true,
    role: true,
    created_at: true,
    address: true,
    birthdate: true,
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
    category: {
        select:
        {
            id: true,
            name: true
        }
    },
    _count: {
        select: {
            reviews: {
                where: {
                    is_public: true
                }
            }
        },
    },
    //calc avg server side
    reviews: {
        select: {
            rating:true
        }
    }
    
};

export const orderSelect: Prisma.OrderSelect = {
    id: true,
    ordered_at: true,
    status: true,
    total_amount: true,
    currency: true,
    shipping_address: true,
    items: {
        select: {
            product: {
                select: {
                    ...productSelect
                }
            }
        }
    },
    payment: {
        select: {
            method: true,
            status:true
        }
    }
};

export const cartSelect: Prisma.CartSelect = {
    id:true,
    _count: {
        select: {
            items:true
        }
    },
    items: {
        select: {
            quantity: true,
            id: true,
            product: {
                select: {
                    ...productSelect
                }
            }
        }
    }
};

export const reviewSelect: Prisma.ReviewSelect = {
    id: true,
    product_id: true,
    user: {
        select: {
            name:true
        }
    },
    title: true,
    content: true,
    rating: true,
    created_at:true
};

export const categorySelect: Prisma.CategorySelect = {
    name: true,
    id:true
};

//for admin
export const settingsSelect: Prisma.SettingsSelect = {
    key: true,
    value: true,
    createdAt: true,
    updatedAt:true
}


//WHERE CLAUSES that all have to have

export const productWhere: Prisma.ProductWhereInput = {
    is_public: true,
    deleted:false
}

export const userWhere: Prisma.UserWhereInput = {
    verified:true
}

export const reviewWhere: Prisma.ReviewWhereInput = {
  is_public: true,
};

//change typing of product query fns to resmble these selects here

//block adding products to shopping cart when theres no stock amount
//make update itemquantity and in general adding product to cart cap at the stockamount limit
    //make this frontend wise and backend wise
    
//check how to handle private and public reviews  so this doesn tget out of sync