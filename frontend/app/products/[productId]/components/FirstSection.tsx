"use client"
import CurrencySymbol from '@/components/main/CurrencySymbol';
import FavoriteProduct from '@/components/main/FavoriteProduct';
import { Product } from '@/types/types'
import AddToCartBox from './AddToCartBox';
import RatingPreview from '@/components/main/Rating';
import useAuth from '@/stores/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addProductToRecentlyViewedProductsByProductId } from '@/lib/queries/client/usersQueries';
import { useEffect } from 'react';
import Price from '@/components/main/Price';
import ImageWithPlaceholder from '@/components/main/ImageWithPlaceholder';


function FirstSection({ product }: { product: Product }) {
  const accessToken = useAuth(state => state.accessToken)
  const queryClient = useQueryClient()
  

  const {mutate} = useMutation({
    mutationKey: ["add product to recently viewed", product, accessToken],
    mutationFn: () => {
      if (accessToken) return addProductToRecentlyViewedProductsByProductId(product.id, accessToken)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["get recently viewed products ", accessToken]})
    },
    onError: (err) => {
      console.log(err)
    }
  })

  useEffect(()=>{mutate()},[mutate])

  return (
    <section className="flex justify-between px-4 w-full h-screen">
      <div className="flex">
        <div>
          <ImageWithPlaceholder src={product.imageUrls[0]} width='w-100' height='h-100' />
          <div>
            {product.imageUrls.map((url) => (
              <img key={url} src={url} />
            ))}
          </div>
        </div>
        <div className="flex flex-col ml-4">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <h2 className="font-medium text-lg text-white">
            {product.description}
          </h2>
          <Price
            price={product.price}
            sale_price={product.sale_price}
            currency={product.currency}
          />
          <RatingPreview
            rating={product.averageRating}
            reviewsAmount={product._count.reviews}
          />
        </div>
      </div>
      <div className="bg-backgroundBright rounded h-80 p-8 flex flex-col justify-evenly items-center">
        <FavoriteProduct productId={product.id} />

        <p>Available: {product.stock_quantity}</p>
        <AddToCartBox
          stockAmount={product.stock_quantity}
          productId={product.id}
        />
      </div>
    </section>
  );
}

export default FirstSection