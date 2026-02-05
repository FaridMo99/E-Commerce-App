import { Product } from "@/types/types";
import ImagePart from "./ImagePart";
import DescriptionPart from "./DescriptionPart";
import AddingPart from "./AddingPart";

type FirstSectionProps = {
  product: Product;
};

function FirstSection({ product }: FirstSectionProps) {

  return (
    <section className="flex flex-col sm:flex-row justify-between w-full h-auto sm:h-[85vh] pt-12">
      <div className="flex h-full w-full">
        <ImagePart imageUrls={product.imageUrls} />
        <DescriptionPart product={product} />
      </div>
      <AddingPart product={product} />
    </section>
  );
}

export default FirstSection;
