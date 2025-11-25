import { Rating, RatingButton } from "../ui/shadcn-io/rating";

type RatingPreviewProps = {
  size?: number;
  styles?: string;
  value: number; 
  onChange: (value: number) => void
};

function InteractiveRating({
  size,
  styles,
  value,
  onChange,
}: RatingPreviewProps) {
  return (
    <div className={`flex flex-col justify-center items-center ${styles}`}>
      <Rating value={value} onValueChange={onChange}>
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton
            {...(size ? { size } : {})}
            className="text-yellow-500"
            key={index}
          />
        ))}
      </Rating>
    </div>
  );
}

export default InteractiveRating;
