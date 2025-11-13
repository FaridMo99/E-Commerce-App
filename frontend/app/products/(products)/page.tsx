import { getProducts } from "@/lib/queries/productQueries";
import { ProductsQuerySchema } from "@monorepo/shared";
import "server-only";
import ProductView from "./components/ProductView";

//page and limit should be default values
//give good loading state that only overrides this page but not sidebar
//implement abort controller when user too fast using sidebar
//have to await searchparams and sends wrong data types
//give breadcrumbs for pagination
async function page({ searchParams }: { searchParams: ProductsQuerySchema }) {
  const products = await getProducts(searchParams);

  return (
    <main className="ml-[10vw]">
      {products.map((product) => (
        <ProductView key={product.id} product={product} />
      ))}
    </main>
  );
}

export default page;
