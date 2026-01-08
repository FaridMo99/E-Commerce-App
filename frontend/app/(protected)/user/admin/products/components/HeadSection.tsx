"use client"
import { Input } from '@/components/ui/input';
import React from 'react'
import { ProductsQuerySchema } from '@monorepo/shared';
import { SetStateAction } from 'react';
import HeadSectionButtons from './HeadSectionButtons';



export type HeadSectionProps = {
  queryParams: ProductsQuerySchema;
  setQueryParams:React.Dispatch<SetStateAction<ProductsQuerySchema>>
};

function HeadSection({queryParams,setQueryParams}:HeadSectionProps) {
  return (
    <section className="flex flex-col lg:flex-row justify-between gap-2 lg:items-center items-start w-full my-4 ">
      <Input
        type="text"
        placeholder="Search Products..."
        className="focus-visible:ring-foreground lg:w-1/2 w-full"
        value={queryParams.search}
        onChange={(e) =>
          setQueryParams((p) => ({ ...p, search: e.target.value }))
        }
      />
    <HeadSectionButtons queryParams={queryParams} setQueryParams={setQueryParams}/>
    </section>
  );
}

export default HeadSection