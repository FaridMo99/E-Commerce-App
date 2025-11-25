import { getAllProductReviewsByProductId } from '@/lib/queries/server/productQueries'
import { ProductReview } from '@/types/types'
import Review from './Review'

async function ReviewsSection({ productId }: { productId: string }) {
    let reviews: ProductReview[]
    
    try {
        reviews = await getAllProductReviewsByProductId(productId)
    } catch (err) {
        console.log(err)
        return null
    }
    

  

  return (
      <section className='w-full'>
          {reviews.map(review=> <Review key={review.id} review={review} />)}
    </section>
  )
}

export default ReviewsSection