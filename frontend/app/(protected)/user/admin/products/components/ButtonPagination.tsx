import { Button } from "@/components/ui/button";
import type { ProductsQuerySchema } from "@monorepo/shared";
import { SetStateAction } from "react";


type ButtonPaginationProps = {
  queryParams: ProductsQuerySchema;
  setQueryParams: React.Dispatch<SetStateAction<ProductsQuerySchema>>;
  length: number;
};

function ButtonPagination({
  queryParams,
  setQueryParams,
  length,
}: ButtonPaginationProps) {
  return (
    <section className="flex items-center  justify-center gap-3 py-4">
      <Button
        disabled={queryParams.page === 1}
        className="px-3 py-1 text-sm border rounded"
        onClick={() =>
          setQueryParams((p: ProductsQuerySchema) => ({
            ...p,
            page: p.page! - 1,
          }))
        }
      >
        Prev
      </Button>

      <Button
        disabled={length < 10}
        className="px-3 py-1 text-sm border rounded"
        onClick={() =>
          setQueryParams((p: ProductsQuerySchema) => ({
            ...p,
            page: p.page! + 1,
          }))
        }
      >
        Next
      </Button>
    </section>
  );
}

export default ButtonPagination;
