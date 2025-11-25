import { CameraIcon } from "lucide-react";
import { CardContent } from "../ui/card";


type ImageWithPlaceholderProps = {
  src: string;
  width: `w-${string}`;
  height: `h-${string}`;
};

function ImageWithPlaceholder({src, width, height}:ImageWithPlaceholderProps) {

    return (
      <CardContent className={`${width} ${height} flex justify-center items-center bg-white text-black`}>
        {src ? <img src={src} /> : <CameraIcon />}
      </CardContent>
    );
}

export default ImageWithPlaceholder