"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProductCategory } from "@/types/types";
import { getProductsMetaInfos } from "@/lib/queries/client/productQueries";

import SidebarSelect, { SingleSelectItem } from "./SidebarSelect";
import PriceSlider from "./PriceSlider";

const sortObj: SingleSelectItem[] = [
  { value: "name|asc", title: "Name ↑" },
  { value: "name|desc", title: "Name ↓" },
  { value: "price|asc", title: "Price ↑" },
  { value: "price|desc", title: "Price ↓" },
  { value: "created_at|asc", title: "Date ↑" },
  { value: "created_at|desc", title: "Date ↓" },
];

function Sidebar({ categories }: { categories: ProductCategory[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sale = searchParams.get("sale");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["get metadata for product", searchParams.toString()],
    queryFn: () =>
      getProductsMetaInfos({
        category: category || undefined,
        sale: sale === "true" ? true : undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const [dragValues, setDragValues] = useState<[number, number] | null>(null);

  const currentPriceLimits: [number, number] = dragValues ?? [
    minPrice ? Number(minPrice) : (data?.minPrice ?? 0),
    maxPrice ? Number(maxPrice) : (data?.maxPrice ?? 0),
  ];

  function handleCategoryChange(selectedCategory: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", selectedCategory);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function handleSaleChange(isChecked: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (isChecked) {
      params.set("sale", "true");
    } else {
      params.delete("sale");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function handleSorting(val: string) {
    const [field, order] = val.split("|");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", field);
    params.set("sortOrder", order);
    router.push(`?${params.toString()}`);
  }

  function handlePriceDrag(values: [number, number]) {
    setDragValues(values);
  }

  function handlePriceCommit(values: [number, number]) {
    setDragValues(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", values[0].toString());
    params.set("maxPrice", values[1].toString());
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <aside className="sm:w-1/5 h-[50vh] sm:sticky sm:top-[20vh] bg-backgroundBright rounded-xl p-6 mx-4 mb-12 sm:m-0 flex flex-col justify-around font-bold text-white">
      {/* Sorting Select */}
      <SidebarSelect
        valueChangeHandler={handleSorting}
        value={sortBy && sortOrder ? `${sortBy}|${sortOrder}` : ""}
        placeholder="Sort"
        label="Sort Options"
        selectItems={sortObj}
      />

      {/* Category Select */}
      <SidebarSelect
        valueChangeHandler={handleCategoryChange}
        value={category ?? ""}
        placeholder="Select a Category"
        label="Categories"
        selectItems={categories.map((cat) => ({
          title: cat.name,
          value: cat.name,
        }))}
      />

      {/* Price Slider Section */}
      <div className="flex flex-col gap-4">
        {isLoading && !data && (
          <Loader2 className="animate-spin self-center text-foreground" />
        )}

        {!isLoading && !isError && data && (
          <PriceSlider
            currency={data.currency}
            min={data.minPrice}
            max={data.maxPrice}
            value={currentPriceLimits}
            onDrag={handlePriceDrag}
            onCommit={handlePriceCommit}
          />
        )}
      </div>

      {/* Sale Checkbox */}
      <div className="flex w-full items-center">
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
