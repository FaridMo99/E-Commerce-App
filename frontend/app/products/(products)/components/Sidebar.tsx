"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Category } from "@/lib/queries/categoryQueries";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

//costraint the slider somehow with min and max values from db
//debounce the slider so only when he let go it fetches
function Sidebar({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  //filters
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sale = searchParams.get("sale");

  const [priceLimits, setPriceLimits] = useState<[number, number]>(() => [
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 100,
  ]);

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
    setPriceLimits([min, max]);
  }

  return (
    <aside className="w-1/5 h-[50vh] sticky top-[20vh] bg-backgroundBright rounded-xl p-6 flex flex-col justify-around font-bold text-white">
      {/*sorting select*/}
      <Select
        value={sortBy && sortOrder ? `${sortBy}|${sortOrder}` : ""}
        onValueChange={handleSorting}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sort Options</SelectLabel>
            <SelectItem value="name|asc">Name ↑</SelectItem>
            <SelectItem value="name|desc">Name ↓</SelectItem>
            <SelectItem value="price|asc">Price ↑</SelectItem>
            <SelectItem value="price|desc">Price ↓</SelectItem>
            <SelectItem value="created_at|asc">Date ↑</SelectItem>
            <SelectItem value="created_at|desc">Date ↓</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/*category select*/}
      <Select value={category ?? ""} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Categories</SelectLabel>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* max and min price slider*/}
      <div className="w-[60%] space-y-3">
        <Slider
          value={priceLimits}
          onValueChange={handlePriceChange}
          max={100}
          step={1}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Min: {priceLimits[0]}</span>
          <span>Max: {priceLimits[1]}</span>
        </div>
      </div>

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
