import { ProductViewProps } from './ProductView'

function ProductViewContent({product}:ProductViewProps) {
  return (
    <div className="h-full flex flex-col w-2/3 pl-2">
      <h2 className="text-lg font-bold mt-4 truncate">{product.name}</h2>
      <p className=" text-white wrap-anywhere truncate">
        {product.description}
      </p>
    </div>
  );
}

export default ProductViewContent