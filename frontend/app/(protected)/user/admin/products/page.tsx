import SectionWrapper from "@/components/main/SectionWrapper";
import ProductsTable from "./components/ProductsTable"


function page() {
  return (
    <SectionWrapper header="Products" styles="w-full">
      <ProductsTable />
    </SectionWrapper>
  );
}

export default page
