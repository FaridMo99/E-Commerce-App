import "server-only";
import { getAllCategories } from "@/lib/queries/server/categoryQueries";
import Sidebar from "./components/Sidebar";
import { ChildrenProps } from "@/types/types";
import ProductPagination from "./components/ProductPagination";

async function layout({ children }: ChildrenProps) {
  const categories = await getAllCategories();

  return (
    <main className="w-full h-full">
      <section className="py-20 px-30 flex w-full">
        <Sidebar categories={categories} />
        {children}
      </section>
      <ProductPagination/>
    </main>
  );
}

export default layout;
