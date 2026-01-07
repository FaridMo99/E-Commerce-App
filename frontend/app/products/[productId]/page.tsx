import { getProductByProductId } from "@/lib/queries/server/productQueries";
import { Product } from "@/types/types";
import { notFound } from "next/navigation";
import "server-only";
import FirstSection from "./components/firstSection/FirstSection";
import SimilarProductsSection from "./components/fourthSection/SimilarProductsSection";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ReviewsSection from "./components/thirdSection/ReviewsSection";
import { Metadata } from "next";
import { DOMAIN, DOMAIN_NAME } from "@/config/constants";


export async function generateMetadata({ params }: PageProps<"/products/[productId]">): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductByProductId(productId);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `/products/${productId}`,
    },
    openGraph: {
      title: `${product.name} | ${DOMAIN_NAME}`,
      description: product.description,
      url: `${DOMAIN}/products/${productId}`,
      images: [
        {
          url: product.imageUrls[0],
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}


async function page(props:PageProps<"/products/[productId]">) {
  const { productId } = await props.params;
  let product: Product;

  try {
    const productReturn = await getProductByProductId(productId);
    if (!productReturn) {
      return notFound();
    }
    product = productReturn;
  } catch (err) {
    console.log(err);
    notFound();
  }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: product.imageUrls[0],
      description: product.description,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.currency,
        availability:
          product.stock_quantity > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: `${DOMAIN}/products/${product.id}`,
      },
    };

  return (
    <main className="flex flex-col w-screen justify-center px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FirstSection product={product} />
      <Suspense fallback={<Loader2 className="animate-spin self-center" />}>
        <SimilarProductsSection category={product.category} />
      </Suspense>
      <Suspense fallback={<Loader2 className="animate-spin self-center" />}>
        <ReviewsSection productId={product.id} />
      </Suspense>
    </main>
  );
}

export default page;
