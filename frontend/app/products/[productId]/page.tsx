import { getProductByProductId } from "@/lib/queries/server/productQueries";
import { Product } from "@/types/types";
import { notFound } from "next/navigation";
import "server-only";
import FirstSection from "./components/firstSection/FirstSection";
import SimilarProductsSection from "./components/fourthSection/SimilarProductsSection";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ReviewsSection from "./components/thirdSection/ReviewsSection";


async function page({ params }: { params: { productId: string } }) {
  const { productId } = await params;
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

  return (
    <main className="flex flex-col w-screen justify-center px-4">
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
