"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bookmark, CameraIcon } from "lucide-react";
import { useState } from "react";
import CurrencySymbol from "./CurrencySymbol";
import Link from "next/link";
import { Product } from "@/types/types";

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
      <Card className="bg-foreground pt-0 overflow-clip mr-4 hover:border-black transition-all duration-200 hover:cursor-pointer">
        <CardContent
          onMouseEnter={() => {
            setShowSecondImage(true);
          }}
          onMouseLeave={() => {
            setShowSecondImage(false);
          }}
          className="w-full h-35 flex justify-center items-center bg-white"
        >
          {!showSecondImage &&
            (firstImage ? <img src={firstImage} /> : <CameraIcon />)}
          {showSecondImage && (secondImage ? <img src={secondImage} /> : null)}
        </CardContent>
        <CardHeader className="h-10">
          <CardTitle>{product.name}</CardTitle>
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
