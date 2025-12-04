import { Skeleton } from "../ui/skeleton";
import BaseSlider, { settings } from "./BaseSlider";


type CarouselLoadingSkeletonProps = {
    cardHeight: string,
    cardWidth:string
};

function CarouselLoadingSkeleton({ cardHeight, cardWidth }: CarouselLoadingSkeletonProps) {
    const length = settings.slidesToShow ?? 5

    const array: number[] = []
    
    for (let i = 1; i <= length; i++){
        array.push(i)
    }
    
    return (
      <BaseSlider>
        {array.map((item) => (
          <Skeleton
            className={`w-${cardWidth} h-${cardHeight} rounded-lg`}
            key={item}
          />
        ))}
      </BaseSlider>
    );
}

export default CarouselLoadingSkeleton