import { AdminTopseller } from '@/types/types';
import { UseQueryResult } from '@tanstack/react-query';
import TopsellerCard from './TopsellerCard';
import CarouselLoadingSkeleton from '@/components/main/CarouselLoadingSkeleton';
import BaseSlider from '@/components/main/BaseSlider';

type TopsellerCarouselProps = {
  fetchResult: UseQueryResult<AdminTopseller[], Error>;
};

function TopsellersCarousel({ fetchResult }: TopsellerCarouselProps) {
  

    if (!fetchResult.isLoading && !fetchResult.data) return <p>Something went wrong...</p>;

  return (
    <section className="my-8 w-full">
      <h2 className="text-3xl font-extrabold mb-2">Topseller</h2>
      {fetchResult?.data?.length === 0 && <p>No Orders yet...</p>}
      {fetchResult.isLoading && (
        <CarouselLoadingSkeleton
          cardWidth="40"
          cardHeight="40"
        />
      )}
      {!fetchResult.isLoading && (
        <BaseSlider>
          {fetchResult?.data?.map((product) => (
            <TopsellerCard key={product.product.id} topseller={product} />
          ))}
        </BaseSlider>
      )}
    </section>
  );
}

export default TopsellersCarousel