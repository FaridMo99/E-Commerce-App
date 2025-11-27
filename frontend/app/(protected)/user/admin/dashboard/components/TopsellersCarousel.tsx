import { AdminTopseller } from '@/types/types';
import { UseQueryResult } from '@tanstack/react-query';
import { Settings } from 'http2';
import { Loader2 } from 'lucide-react';
import Slider from 'react-slick';
import TopsellerCard from './TopsellerCard';

type TopsellerCarouselProps = {
  fetchResult: UseQueryResult<AdminTopseller[], Error>;
};

function TopsellersCarousel({ fetchResult }: TopsellerCarouselProps) {
  
  if (fetchResult.isLoading) return <Loader2 className="animate-spin" size={80} />;
  if (fetchResult.isError || !fetchResult.data) return <p>Something went wrong...</p>;
  
  
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


  return (
    <section className="my-8 self-start">
      <h2 className="text-3xl font-extrabold mb-2">Topseller</h2>
      {fetchResult.data.length === 0 && <p>No Orders yet...</p>}
      <Slider {...settings}>
        {fetchResult.data.map((product) => (
          <TopsellerCard key={product.product.id} topseller={product} />
        ))}
      </Slider>
    </section>
  );
}

export default TopsellersCarousel