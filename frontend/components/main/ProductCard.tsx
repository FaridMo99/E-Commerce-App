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
import { CameraIcon } from "lucide-react";
import ProductCardTags from "./ProductCardTags";
import RatingPreview from "./Rating";

type ProductCardProps = { product: Product };


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
        className={`bg-foreground relative pt-0 overflow-clip mr-4 hover:border-black transition-all duration-200 hover:cursor-pointer ${product.stock_quantity === 0 ? "bg-muted opacity-35 " : ""}`}
      >
        <ProductCardTags stock_quantity={product.stock_quantity} sale_price={product.sale_price} published_at={product.published_at} />
        <CardContent className="w-full h-35 flex justify-center items-center bg-white">
          {!showSecondImage &&
            (firstImage ? <img src={firstImage} /> : <CameraIcon />)}
          {showSecondImage &&
            (secondImage ? <img src={secondImage} /> : <CameraIcon />)}
        </CardContent>
        <CardHeader className="h-10">
          <div className="flex items-center justify-between">
            <CardTitle >{product.name}</CardTitle>
          </div>
          <CardDescription className="break-after-all wrap-break-word truncate">
            {product.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="h-10">
          Price:{product.sale_price ? product.sale_price : product.price}
          <CurrencySymbol currency={product.currency} />
        </CardFooter>
      </Card>
    </Link>
  );
}

export default ProductCard;
