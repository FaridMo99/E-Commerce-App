import "server-only";
import { getAllCategories } from "@/lib/queries/server/categoryQueries";
import Sidebar from "./components/Sidebar";
import ProductPagination from "./components/ProductPagination";
import { Metadata } from "next";
import { DOMAIN_NAME } from "@/config/constants";

export const metadata: Metadata = {
  title: "Products",
  description: `Discover various Products`,
  openGraph: {
    title: `${DOMAIN_NAME} | Products`,
  },
};

async function layout(props: LayoutProps<"/products">) {
  const categories = await getAllCategories();

  return (
    <main className="w-full h-full">
      <section className="py-20 px-30 flex w-full">
        <Sidebar categories={categories} />
        {props.children}
      </section>
      <ProductPagination />
    </main>
  );
}

export default layout;
