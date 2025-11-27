"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Searchlist from "./Searchlist";
import { getProducts } from "@/lib/queries/client/productQueries";

function Searchbar() {
  const searchParam = useSearchParams();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [search, setSearch] = useState<string>(searchParam.get("search") ?? "");
  const debouncedSearch: string = useDebounce(search, 600);
  const router = useRouter();
  const { data: products, isLoading } = useQuery({
    queryKey: ["search for products:", debouncedSearch],
    queryFn: () => getProducts({ search: debouncedSearch }),
    enabled: debouncedSearch.length > 0,
    placeholderData:pre=>pre
  });

  return (
    <div
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
      className="w-full absolute top-0 left-0 h-full flex flex-col justify-center items-center"
    >
      <Input
        className={`md:w-1/3 w-1/2 pr-10 ${search.length > 0 && isFocused ? "rounded-b-none" : ""}`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && search.length > 0) {
            router.push(`/products?search=${search}`);
            if (isFocused) {
              setIsFocused(false);
            }
          }
        }}
      />
      {search.length > 0 && isFocused && (
        <button
          onClick={() => {
            router.push(`/products?search=${search}`);
            if (isFocused) {
              setIsFocused(false);
            }
          }}
          aria-label="Search for Products"
          className="absolute cursor-pointer md:right-[calc(33.333%+8px)] right-[calc(25%+8px)]"
        >
          <Search aria-label="Search" />
        </button>
      )}
      {search.length > 0 && isFocused && (
        <Searchlist products={products ?? []} isLoading={isLoading} />
      )}
    </div>
  );
}

export default Searchbar;
