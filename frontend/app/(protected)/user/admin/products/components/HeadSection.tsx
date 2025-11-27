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
    <section className="flex justify-between items-center w-full ">
      <Input
        type="text"
        className="focus-visible:ring-foreground my-4 w-1/2"
        value={queryParams.search}
        onChange={(e) =>
          setQueryParams((p) => ({ ...p, search: e.target.value }))
        }
      />
      <div className='flex justify-between items-center'>
        <CategoryFilter
          queryParams={queryParams}
          setQueryParams={setQueryParams}
        />
        <CreateCategoryButton />
        <DeleteCategoryButton/>
        <AddProductButton />
      </div>
    </section>
  );
}

export default HeadSection