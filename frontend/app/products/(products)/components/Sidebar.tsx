"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCategory } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { getProductsMetaInfos } from "@/lib/queries/client/productQueries";
import { Loader2 } from "lucide-react";
import SidebarSelect, { SingleSelectItem } from "./SidebarSelect";
import PriceSlider from "./PriceSlider";

const sortObj: SingleSelectItem[] = [{
    value: "name|asc",
    title:"Name ↑"
  },
    {
    value: "name|desc",
    title:"Name ↓"
  },
    {
    value: "price|asc",
    title:"Price ↑"
  },
    {
    value: "price|desc",
    title:"Price ↓"
  },
    {
    value: "created_at|asc",
    title:"Date ↑"
  },
    {
    value: "created_at|desc",
    title:"Date ↓"
  }] 
  


function Sidebar({ categories }: { categories: ProductCategory[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  //filters
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sale = searchParams.get("sale");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["get metadata for product", searchParams.toString()],
    queryFn: () =>
      getProductsMetaInfos({
        category: category || undefined,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        sale: sale === "true" ? true : undefined,
      }),
  });

  //sorting
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  function handleCategoryChange(selectedCategory: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", selectedCategory);
    router.push(`?${params.toString()}`);
  }

  function handleSaleChange(isChecked: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (isChecked) {
      params.set("sale", "true");
    } else {
      params.delete("sale");
    }
    router.push(`?${params.toString()}`);
  }

  function handleSorting(val: string) {
    const [field, order] = val.split("|");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", field);
    params.set("sortOrder", order);
    router.push(`?${params.toString()}`);
  }

  function handlePriceChange(newValues: [number, number]) {
    const params = new URLSearchParams(searchParams.toString());
    const [min, max] = newValues;
    params.set("minPrice", min.toString());
    params.set("maxPrice", max.toString());
    router.push(`?${params.toString()}`);
  }

  return (
    <aside className="w-1/5 h-[50vh] sticky top-[20vh] bg-backgroundBright rounded-xl p-6 flex flex-col justify-around font-bold text-white">
      {/*sorting select*/}
      <SidebarSelect
        valueChangeHandler={handleSorting}
        value={sortBy && sortOrder ? `${sortBy}|${sortOrder}` : ""}
        placeholder="Sort"
        label="Sort Options"
        selectItems={sortObj}
      />

      {/*category select*/}
      <SidebarSelect
        valueChangeHandler={handleCategoryChange}
        value={category ?? ""}
        placeholder="Select a Category"
        label="Categories"
        selectItems={categories.map(category=>({title:category.name,value:category.name}))}
      />
      {/* max and min price slider*/}
      {isLoading && (
        <Loader2 className="animate-spin self-center text-foreground" />
      )}
      {!isLoading && !isError && data && <PriceSlider currency={data?.currency} min={data?.minPrice} max={data?.maxPrice} valueChangeHandler={handlePriceChange} />}
      {/*sale box*/}
      <div className="flex w-full items-center ">
        <Label htmlFor="saleBox" className="mr-2 text-md">
          Sale
        </Label>
        <Checkbox
          id="saleBox"
          checked={sale === "true"}
          onCheckedChange={handleSaleChange}
        />
      </div>
    </aside>
  );
}
export default Sidebar;
