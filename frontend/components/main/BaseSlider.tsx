"use client";
import { ReactNode } from "react";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const settings: Settings = {
  slidesToShow: 5,
  slidesToScroll: 1,
  swipe: true,
  swipeToSlide: true,
  arrows: true,
  infinite:false,
  responsive: [
    { breakpoint: 1270, settings: { slidesToShow: 4 } },
    { breakpoint: 1020, settings: { slidesToShow: 3 } },
    { breakpoint: 790, settings: { slidesToShow: 2 } },
    { breakpoint: 540, settings: { slidesToShow: 1 } },
  ],
};

function BaseSlider({ children }: { children: ReactNode }) {  
  return <Slider {...settings}>{children}</Slider>;
}

export default BaseSlider;
