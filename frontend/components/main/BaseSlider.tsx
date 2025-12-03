import { ReactNode } from 'react'
import Slider, { Settings } from 'react-slick';

export   const settings: Settings = {
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

function BaseSlider({children}:{children:ReactNode}) {

  return (
    <Slider {...settings}>
        {children}
    </Slider>
  );
}

export default BaseSlider