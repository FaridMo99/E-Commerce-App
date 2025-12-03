import ImageWithPlaceholder from "@/components/main/product/ImageWithPlaceholder";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminTopseller } from "@/types/types";
import Link from "next/link";

type TopsellerCardProps = {
  topseller: AdminTopseller;
};

function TopsellerCard({ topseller }: TopsellerCardProps) {
  const product = topseller.product;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-foreground relative pt-0 overflow-clip mr-4 hover:border-black transition-all duration-200 hover:cursor-pointer">
        <ImageWithPlaceholder
          imageUrls={product.imageUrls}
          width="w-full"
          height="h-35"
        />

        <CardHeader className="h-10">
          <CardTitle>{product.name}</CardTitle>
          <CardDescription className="truncate">
          </CardDescription>
        </CardHeader>

        <CardFooter className="h-10 self-end">
          Total Sold: {topseller.totalSold}
        </CardFooter>
      </Card>
    </Link>
  );
}

export default TopsellerCard;
