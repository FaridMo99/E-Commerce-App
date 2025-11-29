import { AdminTopseller } from '@/types/types';
import { UseQueryResult } from '@tanstack/react-query';
import Slider, { Settings } from 'react-slick';
import TopsellerCard from './TopsellerCard';
import CarouselLoadingSkeleton from '@/components/main/CarouselLoadingSkeleton';

type TopsellerCarouselProps = {
  fetchResult: UseQueryResult<AdminTopseller[], Error>;
};

function TopsellersCarousel({ fetchResult }: TopsellerCarouselProps) {
  
  const settings: Settings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    swipe: true,
    swipeToSlide: true,
    arrows: true,
    infinite: true,

    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 820, settings: { slidesToShow: 3 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
    ],
  };

    if (!fetchResult.isLoading && !fetchResult.data) return <p>Something went wrong...</p>;

  return (
    <section className="my-8 w-full">
      <h2 className="text-3xl font-extrabold mb-2">Topseller</h2>
      {fetchResult?.data?.length === 0 && <p>No Orders yet...</p>}
      {fetchResult.isLoading && <CarouselLoadingSkeleton cardWidth='40' cardHeight='40' settings={settings}/>}
      {!fetchResult.isLoading && <Slider {...settings}>
        {fetchResult?.data?.map((product) => (
          <TopsellerCard key={product.product.id} topseller={product} />
        ))}
      </Slider>}
    </section>
  );
}

export default TopsellersCarousel