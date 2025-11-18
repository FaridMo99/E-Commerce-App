import CurrencySymbol from "@/components/main/CurrencySymbol";
import { getProductByProductId } from "@/lib/queries/productQueries";
import { addProductToRecentlyViewedProductsByProductId } from "@/lib/queries/usersQueries";
import useAuth from "@/stores/authStore";
import { Product } from "@/types/types";
import { notFound } from "next/navigation";
import "server-only";

//nextjs complaint is wrong for await
//placeholder when theres no image, do that for all components that expect images
//post requst to recently viewed
async function page({ params }: { params: { productId: string } }) {
  const { productId } = await params;
  const accessToken = useAuth.getState().accessToken
  let product:Product
  
  try {
    
    if (accessToken) {
      const [_, productReturn] = await Promise.all([getProductByProductId(productId),
        addProductToRecentlyViewedProductsByProductId(productId, accessToken)]);
      
      if (!productReturn) {
        return notFound()
      }
      product = productReturn
    }
    else {
          product = await getProductByProductId(productId);
          if (!product) return notFound();
    }
  } catch (err) {
    console.log(err)
    notFound()

  }

  return (
    <main>
      <section className="flex">
        <img className="w-100 h-100" src={product.imageUrls[0]} />
        <section className="flex flex-col">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p className="flex items-center">
            {product.price}
            <CurrencySymbol currency={product.currency} />
          </p>
          {/*make proper image carousel*/}
          {product.imageUrls.map((imageUrl) => (
            <img key={imageUrl} src={imageUrl} className="w-10 h-10" />
          ))}
        </section>
      </section>
      <section></section>
    </main>
  );
}

export default page;
