"use client"
import { useState } from "react";
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
import { OrdersQuerySchema, TimeframeQuerySchema } from "@monorepo/shared";
import { Order } from "@/types/types";
import LoadingPage from "@/components/main/LoadingPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/stores/authStore";
import { getOrders } from "@/lib/queries/client/adminQueries";
import ButtonPagination from "./ButtonPagination";
import { User2 } from "lucide-react";
import ShowOrderButton from "./ShowOrderButton";
import ChangeTimeframeDropdown from "./Timeframe";

export default function OrdersTable() {
  const accessToken = useAuth((state) => state.accessToken);
  const [queryParams, setQueryParams] = useState<
    [OrdersQuerySchema, TimeframeQuerySchema]
  >([
    {
      page: 1,
      limit: 20,
      sort: "ordered_at",
      order: "asc",
      status: undefined,
    },
    {
      from: new Date(),
      to: new Date(),
    },
  ]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["get orders for admin", queryParams],
    queryFn: () => getOrders(accessToken!, queryParams[1], queryParams[0]),
    placeholderData: (pre) => pre,
    enabled: !!accessToken,
  });

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "user",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => (
        <section className="flex items-center gap-3">
          <Avatar className="size-10 rounded-md">
            <AvatarFallback>
              <User2 />
            </AvatarFallback>
          </Avatar>

          <section>
            <span className="font-medium">{row.original.user.name}</span>
            <section className="text-muted-foreground text-xs flex items-center gap-1">
              Joined:{" "}
              {new Date(row.original.user.created_at).toLocaleDateString()}
            </section>
          </section>
        </section>
      ),
    },

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
      accessorKey: "payment",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Payment" />
      ),
      cell: ({ row }) =>
        row.original.payment ? (
          <span>
            {row.original.payment.method} — {row.original.payment.status}
          </span>
        ) : (
          <span className="text-muted-foreground">No Payment</span>
        ),
    },

    {
      accessorKey: "shipping_address",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Shipping" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.shipping_address || (
            <span className="text-muted-foreground">None</span>
          )}
        </span>
      ),
    },
    {
      id: "showOrder",
      header: () => <span>Show Order</span>,
      cell: ({ row }) => (
            <ShowOrderButton order={row.original}/>
      ),
    },
  ];

  if (isLoading) return <LoadingPage />;
  if (!orders) return <p>No Orders found</p>;

  return (
    <>
      <ChangeTimeframeDropdown
        onChangeTimeframe={(range) => {
          setQueryParams(([orderParams, _]) => [
            orderParams,
            {
              from: range.from,
              to: range.to,
            },
          ]);
        }}
      />
      <TableProvider
        className="bg-backgroundBright rounded-lg overflow-clip"
        columns={columns}
        data={orders}
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

      <ButtonPagination
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        length={orders.length}
      />
    </>
  );
}
