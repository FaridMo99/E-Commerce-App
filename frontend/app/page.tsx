import ProductsCarousel from "@/components/home/ProductsCarousel";
import { getHomeProducts } from "@/lib/queries/productQueries";
import "server-only";

export default async function Home() {
  const {
    newProducts,
    trendingProducts,
    productsOnSale,
    categoryProducts,
    recentlyViewedProducts,
  } = await getHomeProducts();

  return (
    <main>
      {newProducts.length > 0 && (
        <ProductsCarousel title="New Products" products={newProducts} />
      )}
      {trendingProducts.length > 0 && (
        <ProductsCarousel
          title="Trending Products"
          products={trendingProducts}
        />
      )}
      {productsOnSale.length > 0 && (
        <ProductsCarousel title="Sale" products={productsOnSale} />
      )}
      {categoryProducts.length > 0 && (
        <ProductsCarousel
          title={
            categoryProducts[0].name.charAt(0).toUpperCase() +
            categoryProducts[0].name.slice(1).toLowerCase()
          }
          products={categoryProducts}
        />
      )}
      {recentlyViewedProducts.length > 0 && (
        <ProductsCarousel
          title="Recently Viewed"
          products={recentlyViewedProducts}
        />
      )}
    </main>
  );
}
