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
      <div className='flex justify-between items-center gap-2 flex-wrap lg:flex-nowrap'>
        <CategoryFilter
          queryParams={queryParams}
          setQueryParams={setQueryParams}
        />
        <CreateCategoryButton />
        <DeleteCategoryButton />
        <AddProductButton />
      </div>
    </section>
  );
}

export default HeadSection