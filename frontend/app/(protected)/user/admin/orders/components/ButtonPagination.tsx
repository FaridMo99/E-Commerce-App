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
  const currentPage = queryParams[0].page!;

  return (
    <section className="flex items-center justify-end gap-3 py-4">
      <Button
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm border rounded"
        onClick={() =>
          setQueryParams(([orderParams, timeframe]) => [
            { ...orderParams, page: orderParams.page! - 1 },
            timeframe,
          ])
        }
      >
        Prev
      </Button>

      <Button
        disabled={length < queryParams[0].limit!}
        className="px-3 py-1 text-sm border rounded"
        onClick={() =>
          setQueryParams(([orderParams, timeframe]) => [
            { ...orderParams, page: orderParams.page! + 1 },
            timeframe,
          ])
        }
      >
        Next
      </Button>
    </section>
  );
}

export default ButtonPagination