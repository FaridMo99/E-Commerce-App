import CategoryFilter from "./CategoryFilter";
import { CreateCategoryButton } from "./CreateCategoryButton";
import { DeleteCategoryButton } from "./DeleteCategoryButton";
import AddProductButton from "./AddProductButton";
import { HeadSectionProps } from "./HeadSection";

function HeadSectionButtons({ queryParams, setQueryParams }: HeadSectionProps) {
  return (
    <div className="flex justify-between items-center gap-2 flex-wrap lg:flex-nowrap">
      <CategoryFilter
        queryParams={queryParams}
        setQueryParams={setQueryParams}
      />
      <CreateCategoryButton />
      <DeleteCategoryButton />
      <AddProductButton />
    </div>
  );
}

export default HeadSectionButtons;
