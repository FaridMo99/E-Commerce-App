"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/ui/shadcn-io/table";
import { ordersQuerySchema } from "@monorepo/shared";
import { Order } from "@/types/types";
import LoadingPage from "@/components/main/LoadingPage";
import useAuth from "@/stores/authStore";
import { getUserOrders } from "@/lib/queries/client/usersQueries";
import SectionWrapper from "@/components/main/SectionWrapper";
import { useSearchParams } from "next/navigation";
import OrdersFilter from "./OrdersFilter";
import ShowOrderButton from "../../admin/orders/components/ShowOrderButton";

export default function UserOrderTable() {
  const accessToken = useAuth((state) => state.accessToken);
  const searchParams = useSearchParams();

  const rawParams = {
    status: searchParams.get("status") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    order: searchParams.get("order") ?? undefined,
  };

  const parsed = ordersQuerySchema.safeParse(rawParams);

    const filters = parsed.data;
        const {
      data: orders,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ["get user orders", filters],
      queryFn: () => getUserOrders(accessToken!, filters),
      placeholderData: (pre) => pre,
    });

    if (isLoading) return <LoadingPage />;
    if (isError) throw error;


  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "ordered_at",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Ordered At" />
      ),
      cell: ({ row }) => (
        <span>{new Date(row.original.ordered_at).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span className="capitalize">{row.original.status}</span>
      ),
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.currency} {row.original.total_amount}
        </span>
      ),
    },
    {
      id: "showOrder",
      header: () => <span>Show Order</span>,
      cell: ({ row }) => <ShowOrderButton order={row.original} />,
    },
  ];

  if (isLoading) return <LoadingPage />;
  if (isError) throw error;

  return (
    <main className="px-8">
      <SectionWrapper
        header={`Orders (${orders?.length})`}
        styles="flex justify-between items-center mb-4"
      >
        <OrdersFilter />
      </SectionWrapper>

      <TableProvider
        className="bg-backgroundBright rounded-lg overflow-clip"
        columns={columns}
        data={orders ?? []}
      >
        <TableHeader className="pl-2">
          {({ headerGroup }) => (
            <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
              {({ header }) => <TableHead header={header} key={header.id} />}
            </TableHeaderGroup>
          )}
        </TableHeader>

        <TableBody>
          {({ row }) => (
            <TableRow key={row.id} row={row}>
              {({ cell }) => <TableCell cell={cell} key={cell.id} />}
            </TableRow>
          )}
        </TableBody>
      </TableProvider>
      
    </main>
  );
}
