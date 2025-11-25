"use client"
import ReviewButton from '@/app/products/[productId]/components/thirdSection/ReviewButton'
import { Product } from '@/types/types'

//look properly what to return etc
function OrderItem({item}:{item:Product}) {
  return (
      <div>
        <ReviewButton buttonText="Leave a Review" />
    <p>ijhbjobjoobjobjjb</p>
    </div>
  )
}

export default OrderItem