"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { OrderStatus } from "@/types/types";
import OrdersFilterDropdownWrapper from "./OrdersFilterDropdownWrapper";

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
    <div className="flex gap-4 items-center justify-end my-4">
      <OrdersFilterDropdownWrapper label="Filter By Status" buttonText="Status">
        {statusFilters.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => updateParams({ status })}
          >
            {status}
          </DropdownMenuItem>
        ))}
      </OrdersFilterDropdownWrapper>
      <OrdersFilterDropdownWrapper label="Sort By" buttonText="Sort">
        {sortFilters.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={() => updateParams({ sort: item.sort, order: item.order })}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </OrdersFilterDropdownWrapper>
    </div>
  );
}
