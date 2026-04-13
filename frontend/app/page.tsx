import RecentlyViewedProducts from "@/app/components/ClientCarousel";
import ProductsCarousel from "@/components/main/product/ProductsCarousel";
import { DOMAIN_NAME } from "@/config/constants";
import { getHomeProducts } from "@/lib/queries/server/productQueries";
import { getProtectedHeaders } from "@/lib/queries/utils";
import { Metadata } from "next";
import { headers } from "next/headers";
import "server-only";

export const metadata: Metadata = {
  title: "Home",
  description: `Welcome to ${DOMAIN_NAME} - Discover various Products`,
  openGraph: {
    title: `${DOMAIN_NAME} | Homepage`,
  },
};

export default async function Home() {
  const { accessToken } = await getProtectedHeaders(headers);

  const { newProducts, trendingProducts, productsOnSale, categoryProducts } =
    await getHomeProducts(accessToken);

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
      <RecentlyViewedProducts />
    </main>
  );
}
