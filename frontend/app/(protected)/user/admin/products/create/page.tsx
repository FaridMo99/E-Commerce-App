import ProductForm from "./components/ProductForm";

function page() {
  return (
    <>
          <h1 className="self-start text-2xl text-white">Add Product</h1>
          <ProductForm/>
    </>
  );
}

export default page

  //these are also for creating products
//product with images, nice price
//images should support drag and drop, multi images, previews, delete image