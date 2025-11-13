import ProductsCarousel from "@/components/home/ProductsCarousel";
import { getProducts } from "@/lib/queries/productQueries";
import "server-only";

//hand the case if array.length === 0
export default async function Home() {
  const products = await getProducts();
  console.log(products);
  return (
    <>
      <ProductsCarousel title="New" products={products} />
      <ProductsCarousel title="Trending" products={products} />
      <ProductsCarousel title="Sale" products={products} />
      <ProductsCarousel title="Clothing" products={products} />
      <ProductsCarousel title="Recently Viewed" products={products} />
    </>
  );
}
