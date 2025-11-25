import ProductsCarousel from "@/components/home/ProductsCarousel";
import { getProducts } from "@/lib/queries/server/productQueries";
import { Product, ProductCategory } from "@/types/types";

async function SimilarProductsSection({
  category,
}: {
  category: ProductCategory;
}) {
  let products:Product[] = [];

  try {
    products = await getProducts({ category: category.name });
  } catch (err) {
    console.log(err);
  }

  if (!products || products.length === 0) return null;

  return <ProductsCarousel title="Similar Products" products={products} />;
}

export default SimilarProductsSection;
