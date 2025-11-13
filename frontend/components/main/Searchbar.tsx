"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";

function Searchbar() {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch: string = useDebounce(search, 600);

  return (
    <div className="w-full absolute top-0 left-0 h-full flex justify-center items-center ">
      <Input
        className="md:w-1/3 w-1/2 pr-10"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search.length > 0 && (
        <button
          aria-label="Search for Products"
          className="absolute md:right-[calc(33.333%+8px)] right-[calc(25%+8px)]"
        >
          <Search aria-label="Search" />
        </button>
      )}
    </div>
  );
}

export default Searchbar;
