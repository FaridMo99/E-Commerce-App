import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCategories } from "@/lib/queries/client/categoryQueries";
import { ProductsQuerySchema } from "@monorepo/shared";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { SetStateAction } from "react";

type CategoryFilterProps = {
  queryParams: ProductsQuerySchema;
  setQueryParams:React.Dispatch<SetStateAction<ProductsQuerySchema>>
};

function CategoryFilter({
    queryParams,
    setQueryParams
}: CategoryFilterProps) {
    const { data: categories, isLoading } = useQuery({
        queryKey: ["get all categories"],
        queryFn: () => getAllCategories(),
        placeholderData:pre=>pre
    })

  return (
    <Select
      value={queryParams.category}
      onValueChange={(value) =>
        setQueryParams((pre) => ({ ...pre, category: value }))
      }
    >
      <SelectTrigger>
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
        <SelectLabel>Category</SelectLabel>
          {isLoading && <Loader2 className="animate-spin" />}
          {!categories && <p>No Categories found</p>}
          {!isLoading &&
            categories &&
            categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default CategoryFilter;
