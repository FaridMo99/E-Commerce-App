import ImageWithPlaceholder from '@/components/main/ImageWithPlaceholder';
import ImageCarousel from './ImageCarousel';

type ImagePartProps = {
    imageUrls:string[]
}


function ImagePart({imageUrls}:ImagePartProps) {
  return (
    <div className="flex flex-col justify-between items-center">
      {/*should be popup when cliking on it */}
      <ImageWithPlaceholder
        src={imageUrls[0]}
        width="w-100"
        height="h-100"
      />
      <div className="w-full">
        <ImageCarousel imageUrls={imageUrls} />
      </div>
    </div>
  );
}

export default ImagePart