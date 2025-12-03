import "server-only";
import ProductView from "./components/ProductView";
import { getProducts } from "@/lib/queries/server/productQueries";
import { SearchParamsProps } from "@/types/types";


async function page({ searchParams }:SearchParamsProps) {
  const params = await searchParams;


  const products = await getProducts(params);

  return (
    <main className="ml-[5vw]">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductView key={product.id} product={product} />
        ))
      ) : (
        <p>No Product found...</p>
      )}
    </main>
  );
}

export default page;
