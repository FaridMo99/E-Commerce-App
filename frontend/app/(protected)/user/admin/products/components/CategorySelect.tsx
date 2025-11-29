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
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

function CategorySelect({
  setCategoryId,
  categoryId,
}: {
  setCategoryId: (val: string) => void;
  categoryId?: string;
}) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["get all categories"],
    queryFn: () => getAllCategories(),
    placeholderData: (pre) => pre,
  });

  return (
    <Select value={categoryId} onValueChange={(value) => setCategoryId(value)}>
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
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default CategorySelect;
