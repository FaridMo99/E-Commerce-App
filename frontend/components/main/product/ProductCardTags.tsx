import ProductTag from "./ProductTag";

type ProductCardTagsProps = {
  stock_quantity: number;
  sale_price: number | null;
  published_at: Date | null;
  position?: "left" | "right";
};

function ProductCardTags({
  stock_quantity,
  sale_price,
  published_at,
  position = "right"
}: ProductCardTagsProps) {

  const positionClass = position === "left" ? "left-0" : "right-0";
  const roundedClass = position === "left" ? "rounded-r-lg" : "rounded-l-lg";

  return (
    <>
      {stock_quantity === 0 && (
        <ProductTag
          type="Sold out"
          styles={`absolute top-4 z-2 ${positionClass} ${roundedClass}`}
        />
      )}
      {sale_price && (
        <ProductTag
          type="Sale"
          styles={`absolute top-20 z-2 ${positionClass} w-10 ${roundedClass}`}
        />
      )}
      {published_at &&
        new Date(published_at) >=
          new Date(new Date().setDate(new Date().getDate() - 7)) && (
          <ProductTag
            type="New"
            styles={`absolute top-12 z-2 ${positionClass} w-10 ${roundedClass}`}
          />
        )}
    </>
  );
}

export default ProductCardTags;
