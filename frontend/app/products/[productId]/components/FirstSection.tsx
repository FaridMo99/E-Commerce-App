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
          <img className="w-100 h-100" src={product.imageUrls[0]} />
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
          <p className="flex items-center">
            {product.sale_price ? product.sale_price : product.price}
            <CurrencySymbol currency={product.currency} />
          </p>
          {product.sale_price && (
            <p className="flex items-center text-gray-400 relative scale-75">
              {product.price}
              <CurrencySymbol currency={product.currency} />
              <span className="absolute inset-0 top-1/2 h-px bg-gray-400 w-1/4" />
            </p>
          )}
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