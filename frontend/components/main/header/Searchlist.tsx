import { Product } from "@/types/types";
import SearchlistItem from "./SearchlistItem";

function Searchlist({ products }: { products: Product[] }) {
  return (
    <ul className="bg-white overflow-x-clip overflow-y-scroll w-full max-h-100 rounded-b-lg border border-foreground text-black absolute top-full left-0">
      {products?.map((product) => (
        <SearchlistItem product={product} key={product.id} />
      ))}
      {products.length === 0 && (
        <li className="w-full bg-foreground h-[10vh] flex justify-center items-center text-white">
          <p>No Products Found...</p>
        </li>
      )}
    </ul>
  );
}

export default Searchlist;
