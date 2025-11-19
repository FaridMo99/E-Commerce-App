import CurrencySymbol from "@/components/main/CurrencySymbol";
import FavoriteProduct from "@/components/main/FavoriteProduct";
import { getProductByProductId } from "@/lib/queries/server/productQueries";
import { Product } from "@/types/types";
import { notFound } from "next/navigation";
import "server-only";

//nextjs complaint is wrong for await
//placeholder when theres no image, do that for all components that expect images
//post requst to recently viewed
async function page({ params }: { params: { productId: string } }) {
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
          <FavoriteProduct productId={productId} />
        </section>
      </section>
      <section></section>
    </main>
  );
}

export default page;
