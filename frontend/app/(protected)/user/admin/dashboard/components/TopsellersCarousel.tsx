import { AdminTopseller } from '@/types/types';
import { UseQueryResult } from '@tanstack/react-query';
import TopsellerCard from './TopsellerCard';
import CarouselLoadingSkeleton from '@/components/main/CarouselLoadingSkeleton';
import BaseSlider from '@/components/main/BaseSlider';
import SectionWrapper from '@/components/main/SectionWrapper';


type TopsellerCarouselProps = {
  fetchResult: UseQueryResult<AdminTopseller[], Error>;
};

function TopsellersCarousel({ fetchResult }: TopsellerCarouselProps) {
  

  if (!fetchResult.isLoading && !fetchResult.data) return <p>Something went wrong...</p>;
  
  return (
    <SectionWrapper as="section" styles="my-8 w-full" header="Topseller">
      {fetchResult?.data?.length === 0 && <p>No Orders yet...</p>}
      {fetchResult.isLoading && <CarouselLoadingSkeleton cardWidth="40" cardHeight="40" />}
      {!fetchResult.isLoading && fetchResult.data && (
        <BaseSlider>
          {fetchResult.data.map((product) => (
            <TopsellerCard key={product.product.id} topseller={product} />
          ))}
        </BaseSlider>
      )}
    </SectionWrapper>
  );
}

export default TopsellersCarousel