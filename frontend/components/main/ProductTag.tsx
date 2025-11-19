import React from 'react'

type ProductTagProps = {
    type: "Sale" | "New",
    styles?:string
}

//give this to all elemnts that are products
function ProductTag({type, styles}:ProductTagProps) {
  return (
      <div className={`flex justify-center items-center px-6 ${type === "Sale" ? "bg-red-500" : "bg-blue-500"} text-background font-semibold ${styles}`}>{type}</div>
  )
}

export default ProductTag