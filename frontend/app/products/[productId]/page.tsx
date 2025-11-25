import { getProductByProductId } from "@/lib/queries/server/productQueries";
import { Product } from "@/types/types";
import { notFound } from "next/navigation";
import "server-only";
import FirstSection from "./components/FirstSection";
import ImageSection from "./components/ImageSection";
import SimilarProductsSection from "./components/SimilarProductsSection";
import ReviewsSection from "./components/ReviewsSection";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";


//placeholder when theres no image, do that for all components that expect images
async function page({ params }:{params:{productId:string}}) {
  const { productId } = await params;
  let product:Product
  
  try {
    const productReturn = await getProductByProductId(productId)
    if (!productReturn) {
      return notFound()
    }
    product = productReturn

  } catch (err) {
    console.log(err)
    notFound()

  }

  return (
    <main className="flex flex-col w-screen items-center justify-center">
      <FirstSection product={product} />
      {product.imageUrls.length > 0 && (
        <ImageSection imageUrls={product.imageUrls} />
      )}
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
