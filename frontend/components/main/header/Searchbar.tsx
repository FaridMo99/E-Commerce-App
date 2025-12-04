"use client";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useDebounce from "@/hooks/useDebounce";
import { getProducts } from "@/lib/queries/client/productQueries";
import { Input } from "@/components/ui/input";
import Searchlist from "./Searchlist";


function Searchbar() {
  const [search, setSearch] = useState<string>("")
  const debouncedSearch = useDebounce(search, 600);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: () => getProducts({search:debouncedSearch}),
    enabled: debouncedSearch.length > 0,
  });

  function searchHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
      setIsFocused(false);
      inputRef.current?.blur();
      router.push(`/products?search=${search}`);
  }

  return (
    <form
      onSubmit={searchHandler}
      className="absolute w-1/3 left-1/3 top-[5vh] z-49"
    >
      <div className="w-full relative">
        <Input
          ref={inputRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
            }, 200);
          }}
          name="search"
          placeholder="Search..."
          className={`border-2 w-full h-[5vh] focus-visible:ring-0 text-black pr-[4vh] bg-gray-50 rounded-l-lg
          ${debouncedSearch.length > 0 && isFocused ? "rounded-b-none border-b-2" : ""}  z-4`}
          type="text"
          autoComplete="on"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          tabIndex={0}
          type="submit"
          aria-label="search users"
          className="flex justify-center items-center absolute top-[1vh] right-0 z-1 disabled:opacity-60"
          disabled={!data || data.length === 0}
        >
          <Search className="text-foreground w-[4vh]" />
        </button>
      </div>
      {debouncedSearch.length > 0 &&
        isFocused &&
        <Searchlist products={data ?? []} />
      }
    </form>
  );
}

export default Searchbar;
