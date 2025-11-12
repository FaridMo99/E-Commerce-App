"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

function Searchbar() {
  const [search, setSearch] = useState<string>("");

  return (
    <div className="w-2/3 h-full flex justify-center items-center relative">
      <Input
        className="md:w-1/3 w-4/5 pr-10"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search.length > 0 && (
        <button
          aria-label="Search for Products"
          className="absolute md:right-[calc(33.333%+8px)] right-[calc(10%+8px)]"
        >
          <Search aria-label="Search" />
        </button>
      )}
    </div>
  );
}

export default Searchbar;
