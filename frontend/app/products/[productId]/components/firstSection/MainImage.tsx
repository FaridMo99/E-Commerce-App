import { CardContent } from "@/components/ui/card";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { CameraIcon } from "lucide-react";

function MainImage({ url }: { url: string }) {
  if (!url) {
    return (
      <CardContent
        className={`flex justify-center w-[33vw] h-100 items-center bg-white text-black`}
      >
        <CameraIcon />
      </CardContent>
    );
  }

  return (
    <div className="w-[33vw] aspect-square overflow-hidden rounded-sm bg-white">
      <ImageZoom className="w-full h-full">
        <img
          src={url}
          alt="product image"
          className="w-full h-full object-cover block"
        />
      </ImageZoom>
    </div>
  );
}

export default MainImage;
