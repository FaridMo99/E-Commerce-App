import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";

type RatingPreviewProps = {
  rating: number,
  reviewsAmount?: number
  size?: number
  styles?:string
}

function RatingPreview({ rating, reviewsAmount, size, styles }: RatingPreviewProps) {
  return (
    <div className={`flex flex-col justify-center items-center ${styles}`}>
      <Rating value={rating} readOnly>
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton
            {...(size ? { size } : {})}
            className="text-yellow-500"
            key={index}
          />
        ))}
      </Rating>
      {reviewsAmount && (
        <div className="text-center">
          <p className="text-xs text-white">
            Reviews:{reviewsAmount}
          </p>
        </div>
      )}
    </div>
  );
}

export default RatingPreview