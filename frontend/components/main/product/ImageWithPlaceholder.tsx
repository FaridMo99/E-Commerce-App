import { CardContent } from "@/components/ui/card";
import { CameraIcon } from "lucide-react";

type ImageWithPlaceholderProps = {
  imageUrls?: string[];
  width: `w-${string}`;
  height: `h-${string}`;
};

function ImageWithPlaceholder({
  imageUrls = [],
  width,
  height,
}: ImageWithPlaceholderProps) {
  const firstImage = imageUrls[0];
  const secondImage = imageUrls[1];

  if (!firstImage) {
    return (
      <CardContent
        className={`${width} ${height} flex justify-center items-center bg-white text-black`}
      >
        <CameraIcon />
      </CardContent>
    );
  }

  return (
    <CardContent className={`${width} ${height} relative overflow-hidden bg-white`}>
      <img
        src={firstImage}
        alt="product image"
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
          secondImage ? "hover:opacity-0" : "opacity-100"
        }`}
      />

      {secondImage && (
        <img
          src={secondImage}
          alt="product image hover"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-300"
        />
      )}
    </CardContent>
  );
}

export default ImageWithPlaceholder;
