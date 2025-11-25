"use client"
import Slider, { Settings } from 'react-slick';

function ImageSection({imageUrls}:{imageUrls:string[]}) {
      const settings: Settings = {
    slidesToShow: 1,
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
      <Slider {...settings}>
        {imageUrls?.map((url) => <img key={url} src={url}/>)}
      </Slider>
  );
}

export default ImageSection