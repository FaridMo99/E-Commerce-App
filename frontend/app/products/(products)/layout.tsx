import Sidebar from "./components/Sidebar";
import "server-only";
import { getAllCategories } from "@/lib/queries/categoryQueries";

async function layout({ children }: { children: React.ReactNode }) {
  const categories = await getAllCategories();
  return (
    <main className="py-20 px-30 flex w-full">
      <Sidebar categories={categories} />
      {children}
    </main>
  );
}

export default layout;
