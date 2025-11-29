"use client";
import { Product } from "@/types/types";

type ImageCarouselProps = {
  imageUrls: Product["imageUrls"];
  setImageToShow:React.Dispatch<string>
};


function ImageCarousel({ imageUrls, setImageToShow }: ImageCarouselProps) {
  return (
    <section className="w-full flex items-center h-full">
      {imageUrls.map((url) => (
        <img
          key={url}
            onClick={() => setImageToShow(url)}
            alt="product image"
            className="h-30 w-20"
            src={url}
          />
      ))}
    </section>
  );
}

export default ImageCarousel;
