import { getProducts } from "@/lib/queries/productQueries";
import "server-only";
import ProductView from "./components/ProductView";
import { SeachParams } from "@/types/types";

//page and limit should be default values
//give good loading state that only overrides this page but not sidebar
//implement abort controller when user too fast using sidebar and searchbar
//maybe sends wrong data types
//give breadcrumbs for pagination
async function page({ searchParams }: { searchParams: SeachParams }) {
  const params = await searchParams;
  const products = await getProducts(params);

  return (
    <main className="ml-[10vw]">
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
