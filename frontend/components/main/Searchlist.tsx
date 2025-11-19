import Link from "next/link";
import { Camera, Loader2 } from "lucide-react";
import { Product } from "@/types/types";

type SearchlistProps = {
  products: Product[];
  isLoading: boolean;
};

//add if available or sold out etc.
function Searchlist({ products, isLoading }: SearchlistProps) {
  return (
    <ul
      tabIndex={1}
      className="rounded-b-xl bg-foreground flex flex-col overflow-x-clip overflow-y-scroll max-h-60 z-10 absolute top-[calc(36px+5.2vh)] md:w-1/3 w-1/2 border-x border-b"
    >
      {isLoading && (
        <Loader2 className="bg-foreground animate-spin text-center my-4" />
      )}
      {!isLoading && products.length === 0 && (
        <p className="text-center my-4">No Products found</p>
      )}
      {!isLoading &&
        products.length > 0 &&
        products.map((product) => (
          <Link
            key={product.id}
            className="hover:bg-muted/30 w-full h-20 md:h-30 px-4"
            href={`/products/${product.id}`}
          >
            <li
              key={product.id}
              className="w-full flex justify-around items-center"
            >
              {product.imageUrls[0] ? (
                <img src={product.imageUrls[0]} />
              ) : (
                <Camera />
              )}
              <div>
                <p>{product.name}</p>
                <p>{product.description}</p>
              </div>
            </li>
          </Link>
        ))}
    </ul>
  );
}

export default Searchlist;
