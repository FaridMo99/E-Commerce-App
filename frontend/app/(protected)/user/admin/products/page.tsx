import ProductsTable from "./components/ProductsTable"


function page() {
  return (
    <>
      <h1 className="self-start text-2xl text-white">Products</h1>
      <ProductsTable/>
    </>
  )
}

export default page


//create product with images, nice price
//images should support drag and drop, multi images, previews, delete image
//update product
//everything thats related to price show the basecurrency