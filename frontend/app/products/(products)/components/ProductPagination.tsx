"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ProductMetaInfos } from "@/types/types";

function ProductPagination() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const currentPage = Number(searchParams.get("page")) || 1;


  const cachedData = queryClient.getQueryData<ProductMetaInfos>(["get metadata for product", searchParams.toString()]);
  
  const totalProducts = cachedData?.totalItems || 0;

  const totalPages = Math.ceil(totalProducts / 10);
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const pages = useMemo(() => {
    const items: (number | "start-ellipsis" | "end-ellipsis")[] = [];

    items.push(1);

    if (currentPage > 3) items.push("start-ellipsis");

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(i);
    }

    if (currentPage < totalPages - 2) items.push("end-ellipsis");

    if (totalPages > 1) items.push(totalPages);

    return items;
  }, [currentPage, totalPages]);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) handlePageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pages.map((page, idx) =>
          page === "start-ellipsis" || page === "end-ellipsis" ? (
            <PaginationItem key={page + idx}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) handlePageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default ProductPagination;
