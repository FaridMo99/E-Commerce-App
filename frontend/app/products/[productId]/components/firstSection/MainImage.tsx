import { CardContent } from '@/components/ui/card';
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom';
import { CameraIcon } from 'lucide-react';

function MainImage({ url }: { url: string }) {
    
      if (!url) {
        return (
          <CardContent
            className={`flex justify-center w-100 h-100 items-center bg-white text-black`}
          >
            <CameraIcon />
          </CardContent>
        );
      }
    
  return (
      <ImageZoom>
        <img
          src={url}
          alt="product image"
          className="bg-white w-100 h-full object-cover"
        />
      </ImageZoom>
  );
}

export default MainImage