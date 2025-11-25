"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/types/types";

const statusFilters: OrderStatus[] = [
  "CANCELLED",
  "DELIVERED",
  "DELIVERING",
  "ORDERED",
  "PENDING",
];

const sortFilters = [
  { label: "Newest", sort: "ordered_at", order: "desc" },
  { label: "Oldest", sort: "ordered_at", order: "asc" },
  { label: "Status A→Z", sort: "status", order: "asc" },
  { label: "Status Z→A", sort: "status", order: "desc" },
];

export default function OrdersFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateParams = (values: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(values).forEach(([key, value]) => {
      params.set(key, value);
    });

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-4">
      {/* STATUS FILTER */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Status
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="rounded-xl p-2 w-40">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {statusFilters.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => updateParams({ status })}
            >
              {status}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Sort
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="rounded-xl p-2 w-40">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {sortFilters.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onClick={() =>
                updateParams({ sort: item.sort, order: item.order })
              }
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
