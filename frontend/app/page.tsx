
import ClientCarousel from "@/components/main/ClientCarousel";
import ProductsCarousel from "@/components/main/ProductsCarousel";
import { getRecentlyViewedProducts } from "@/lib/queries/client/usersQueries";
import { getHomeProducts } from "@/lib/queries/server/productQueries";
import "server-only";

export default async function Home() {

  const {
    newProducts,
    trendingProducts,
    productsOnSale,
    categoryProducts,
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
            categoryProducts[0].category.name.charAt(0).toUpperCase() +
            categoryProducts[0].category.name.slice(1).toLowerCase()
          }
          products={categoryProducts}
        />
      )}
      <ClientCarousel
        title="Recently Viewed"
        mutationKey="get recently viewed products"
        mutation={getRecentlyViewedProducts}
      />
    </main>
  );
}
