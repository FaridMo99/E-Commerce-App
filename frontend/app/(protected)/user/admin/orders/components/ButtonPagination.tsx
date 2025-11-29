import { Button } from "@/components/ui/button";
import { OrdersQuerySchema, TimeframeQuerySchema } from "@monorepo/shared";
import { SetStateAction } from "react";

type ButtonPaginationProps = {
  queryParams: [OrdersQuerySchema, TimeframeQuerySchema];
  setQueryParams: React.Dispatch<
    SetStateAction<[OrdersQuerySchema, TimeframeQuerySchema]>
  >;
  length: number;
};

function ButtonPagination({
  queryParams,
  setQueryParams,
  length,
}: ButtonPaginationProps) {
  return (
    <section className="flex items-center justify-end gap-3 py-4">
      <Button
        disabled={queryParams[0].page === 1}
        className="px-3 py-1 text-sm border rounded"
        onClick={() => setQueryParams((p) => ({ ...p, page: p[0].page! - 1 }))}
      >
        Prev
      </Button>

      <Button
        disabled={length < 10}
        className="px-3 py-1 text-sm border rounded"
        onClick={() => setQueryParams((p) => ({ ...p, page: p[0].page! + 1 }))}
      >
        Next
      </Button>
    </section>
  );
}

export default ButtonPagination;
