import "server-only";
import ProductView from "./components/ProductView";
import { getProducts } from "@/lib/queries/server/productQueries";
import { SearchParamsProps } from "@/types/types";
import { getProtectedHeaders } from "@/lib/queries/utils";
import { headers } from "next/headers";

async function page({ searchParams }: SearchParamsProps) {
  const params = await searchParams;
  const {accessToken} = await getProtectedHeaders(headers)
  

  const products = await getProducts(params, accessToken);

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
