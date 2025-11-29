"use client";

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

import { getProductsAdmin } from "@/lib/queries/client/productQueries";
import { ProductsQuerySchema } from "@monorepo/shared";
import { AdminProduct } from "@/types/types";
import LoadingPage from "@/components/main/LoadingPage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeadSection from "./HeadSection";
import ButtonPagination from "./ButtonPagination";
import DeleteProduct from "./DeleteProduct";
import { EditProduct } from "./EditProduct";
import useAuth from "@/stores/authStore";


export default function ProductsTable() {
  const accessToken = useAuth(state => state.accessToken)
  const [queryParams, setQueryParams] = useState<ProductsQuerySchema>({
    page: 1,
    limit: 20,
    sortBy: "name",
    sortOrder: "asc",
    search:""
  });


  const { data:products, isLoading  } = useQuery({
    queryKey: ["get admin products", queryParams],
    queryFn: () => getProductsAdmin(accessToken!, queryParams),
    placeholderData: pre => pre,
    enabled:!!accessToken
  });

  console.log(products)
  const columns: ColumnDef<AdminProduct>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Product" />
      ),
      cell: ({ row }) => (
        <section className="flex items-center gap-3">
          <Avatar className="size-10 rounded-md">
            <AvatarImage src={row.original.imageUrls[0]} />
            <AvatarFallback>{row.original.name}</AvatarFallback>
          </Avatar>

          <section>
            <span className="font-medium">{row.original.name}</span>
            <section className="text-muted-foreground text-xs flex items-center gap-1">
              {row.original.category?.name}
            </section>
          </section>
        </section>
      ),
    },

    {
      accessorKey: "price",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.currency} {row.original.price}
        </span>
      ),
    },

    {
      accessorKey: "sale_price",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Sale Price" />
      ),
      cell: ({ row }) =>
        row.original.sale_price ? (
          <span className="text-green-600 font-medium">
            {row.original.currency} {row.original.sale_price}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },

    {
      accessorKey: "stock_quantity",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => (
        <span
          className={
            row.original.stock_quantity > 0 ? "text-green-600" : "text-red-600"
          }
        >
          {row.original.stock_quantity}
        </span>
      ),
    },
    {
      accessorKey: "is_public",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Public" />
      ),
      cell: ({ row }) => (
        <span className={row.original.is_public ? "text-green-600" : "text-red-600"}>
          {row.original.is_public ? "Yes" : "No"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="pl-4">Actions</span>,
      cell: ({ row }) => {
        const product = row.original;

        return (
          <section className="flex items-center gap-3 pl-4">
            <EditProduct product={product} />
            <DeleteProduct product={product}/>
          </section>
        );
      },
    },
  ];

  if (isLoading)
    return <LoadingPage />;

  if(!products) return <p>No Products found</p>

  return (
    <>
      <HeadSection queryParams={queryParams} setQueryParams={setQueryParams}/>
      <TableProvider
        className="bg-backgroundBright rounded-lg overflow-clip"
        columns={columns}
        data={products}
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
        <ButtonPagination queryParams={queryParams} setQueryParams={setQueryParams} length={products.length}/>
    </>
  );
}