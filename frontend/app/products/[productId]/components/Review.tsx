import RatingPreview from '@/components/main/Rating'
import { ProductReview } from '@/types/types'

type ReviewProps = {
    review:ProductReview
}

function Review({review}:ReviewProps) {
  return (
      <div>
          <h3>{review.title}</h3>
          <p>{review.user.name}</p>
          <p>{review.content}</p>
          <p>{review.created_at.getDate()}</p>
         <RatingPreview rating={review.rating} />
    </div>
  )
}

export default Review