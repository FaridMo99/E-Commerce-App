import "server-only";
import ProductView from "./components/ProductView";
import { getProducts } from "@/lib/queries/server/productQueries";
import { AccessToken, SearchParamsProps } from "@/types/types";
import { getNewRefreshToken } from "@/lib/queries/server/authQueries";

async function page({ searchParams }: SearchParamsProps) {
  const params = await searchParams;
  let accessToken: AccessToken | undefined;
  
    try {
      const res = await getNewRefreshToken();
      accessToken = res.accessToken;
    } catch (err) {
      console.log(err)
    }

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
