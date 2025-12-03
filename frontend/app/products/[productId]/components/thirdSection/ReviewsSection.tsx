import { getAllProductReviewsByProductId } from '@/lib/queries/server/productQueries'
import { ProductReview } from '@/types/types'
import ReviewButton from './ReviewButton'
import { Plus } from 'lucide-react'
import ReviewsCarousel from './ReviewCarousel'

async function ReviewsSection({ productId }: { productId: string }) {
    let reviews: ProductReview[]
    
    try {
        reviews = await getAllProductReviewsByProductId(productId)
    } catch (err) {
        console.log(err)
        return null
    }
    

  return (
    <section className="w-full min-h-[50vh] flex flex-col px-8" id="reviews">
      <div className='flex items-center justify-between'>
        <h2 className="text-3xl font-extrabold mb-2">
          Reviews({reviews.length})
        </h2>
        {reviews.length > 0 && <ReviewButton buttonText={<Plus size={40}/>} />}
      </div>
      {reviews.length === 0 && <ReviewButton emptyReviews buttonText="Leave Review here" />}
       <ReviewsCarousel reviews={reviews}/> 
    </section>
  );
}

export default ReviewsSection