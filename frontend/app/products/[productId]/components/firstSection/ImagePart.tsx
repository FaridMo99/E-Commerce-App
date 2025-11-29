"use client"
import { useState } from 'react';
import ImageCarousel from './ImageCarousel';
import MainImage from './MainImage';

type ImagePartProps = {
    imageUrls:string[]
}


function ImagePart({ imageUrls }: ImagePartProps) {
  const [imageToShow, setImageToShow] = useState<string>(imageUrls[0])

  return (
    <div className="flex flex-col justify-between items-start">
      <MainImage url={imageToShow} />

      <div className="w-100 h-50">
        <ImageCarousel setImageToShow={setImageToShow} imageUrls={imageUrls} />
      </div>
    </div>
  );
}

export default ImagePart