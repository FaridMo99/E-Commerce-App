"use client"
import { Input } from '@/components/ui/input';
import React from 'react'
import AddProductButton from './AddProductButton';
import { ProductsQuerySchema } from '@monorepo/shared';
import { SetStateAction } from 'react';
import CategoryFilter from './CategoryFilter';
import { CreateCategoryButton } from './CreateCategoryButton';
import { DeleteCategoryButton } from './DeleteCategoryButton';



type HeadSectionProps = {
  queryParams: ProductsQuerySchema;
  setQueryParams:React.Dispatch<SetStateAction<ProductsQuerySchema>>
};

function HeadSection({queryParams,setQueryParams}:HeadSectionProps) {
  return (
    <section className="flex justify-between gap-2 items-center w-full my-4 ">
      <Input
        type="text"
        placeholder='Search Products...'
        className="focus-visible:ring-foreground w-1/2"
        value={queryParams.search}
        onChange={(e) =>
          setQueryParams((p) => ({ ...p, search: e.target.value }))
        }
      />
        <CategoryFilter
          queryParams={queryParams}
          setQueryParams={setQueryParams}
        />
        <CreateCategoryButton />
        <DeleteCategoryButton/>
        <AddProductButton />
    </section>
  );
}

export default HeadSection