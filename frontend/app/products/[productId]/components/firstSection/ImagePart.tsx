"use client";
import { useState } from "react";
import ImageCarousel from "./ImageCarousel";
import MainImage from "./MainImage";

type ImagePartProps = {
  imageUrls: string[];
};

function ImagePart({ imageUrls }: ImagePartProps) {
  const [imageToShow, setImageToShow] = useState<string>(imageUrls[0]);

  return (
    <div className="flex flex-col gap-4 items-start jusify-start w-[33vw] h-full">
      <MainImage url={imageToShow} />
      <div className="w-full h-1/6">
        <ImageCarousel setImageToShow={setImageToShow} imageUrls={imageUrls} />
      </div>
    </div>
  );
}

export default ImagePart;
