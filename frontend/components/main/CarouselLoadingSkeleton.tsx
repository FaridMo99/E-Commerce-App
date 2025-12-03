import Slider from "react-slick";
import { Skeleton } from "../ui/skeleton";
import { settings } from "./BaseSlider";


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
      <Slider {...settings}>
        {array.map((item) => (
            <Skeleton
              className={`w-${cardWidth} h-${cardHeight} rounded-lg`}
              key={item}
            />
        ))}
      </Slider>
    );
}

export default CarouselLoadingSkeleton