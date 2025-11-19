"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import CurrencySymbol from "./CurrencySymbol";
import Link from "next/link";
import { Product } from "@/types/types";
import ProductTag from "./ProductTag";
import { CameraIcon } from "lucide-react";

type ProductCardProps = { product: Product };


//have to be logged in to bookmark, unauthed bookmarking redirects to login page
//also needs the data of if already bookmarked by user, not available rn
//have to use server actions and optimistically update then manually


function ProductCard({ product }: ProductCardProps) {
  //can do with hover stacking on top and tggling opacity
  const [showSecondImage, setShowSecondImage] = useState<boolean>(false);
  const firstImage = product.imageUrls[0];
  const secondImage = product.imageUrls[1];

  
  return (
    <Link href={`/products/${product.id}`}>
      <Card
        onMouseEnter={() => {
          setShowSecondImage(true);
        }}
        onMouseLeave={() => {
          setShowSecondImage(false);
        }}
        className="bg-foreground relative pt-0 overflow-clip mr-4 hover:border-black transition-all duration-200 hover:cursor-pointer"
      >
        {product.sale_price && (
          <ProductTag
            type="Sale"
            styles="absolute top-4 right-0 w-10 rounded-l-lg"
          />
        )}
        {product.published_at &&
          new Date(product.published_at) >=
            new Date(new Date().setDate(new Date().getDate() - 7)) && (
            <ProductTag
              type="New"
              styles="absolute top-12 right-0 w-10 rounded-l-lg"
            />
          )}
        <CardContent className="w-full h-35 flex justify-center items-center bg-white">
          {!showSecondImage &&
            (firstImage ? <img src={firstImage} /> : <CameraIcon />)}
          {showSecondImage &&
            (secondImage ? <img src={secondImage} /> : <CameraIcon />)}
        </CardContent>
        <CardHeader className="h-10">
          <div className="flex items-center justify-between">
            <CardTitle>{product.name}</CardTitle>
          </div>
          <CardDescription className="break-after-all wrap-break-word truncate">
            {product.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="h-10">
          Price:{product.price}
          <CurrencySymbol currency={product.currency} />
        </CardFooter>
      </Card>
    </Link>
  );
}

export default ProductCard;
