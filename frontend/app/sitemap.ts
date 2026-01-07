import { MetadataRoute } from "next";
import { DOMAIN } from "@/config/constants";
import { getProducts } from "@/lib/queries/client/productQueries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${DOMAIN}/products/${product.id}`,
    lastModified: product.updated_at,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${DOMAIN}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${DOMAIN}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  return [...staticPages, ...productEntries];
}
