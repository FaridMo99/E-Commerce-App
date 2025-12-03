type ProductTagProps = {
    type: "Sale" | "New" | "Sold out",
    styles?:string
}

//give this to all elemnts that are products
function ProductTag({ type, styles }: ProductTagProps) {
    let bgColor = "";
    if (type === "Sale") bgColor = "bg-red-500";
    if (type === "New") bgColor = "bg-green-500";
    if (type === "Sold out") bgColor = "bg-gray-300";

  return (
      <div className={`flex justify-center items-center px-6 ${bgColor} text-background font-semibold ${styles}`}>{type}</div>
  )
}

export default ProductTag