"use client";

import { useState } from "react";
import useAuth from "@/stores/authStore";
import { deleteCategoryByCategoryId } from "@/lib/queries/client/adminQueries";
import CategorySelect from "./CategorySelect";
import { Field, FieldGroup } from "@/components/ui/field";
import { CategoryButton } from "./CategoryButton";

export function DeleteCategoryButton() {
  const accessToken = useAuth((state) => state.accessToken);
  const [categoryId, setCategoryId] = useState<string>("");

  return (
    <CategoryButton
      title="Delete Category"
      buttonText="Delete Category"
      submitButtonText="Delete"
      successMessage="Deleted Category successfully!"
      mutationFn={(id: string) => deleteCategoryByCategoryId(id, accessToken!)}
      mutationArgs={categoryId}
      mutationKey={["delete category", categoryId]}
      invalidQueries={["get all categories"]}
      categoryLength={categoryId.length}
    >
      <FieldGroup className="grid gap-4 mt-4">
        <Field className="grid gap-3">
          <CategorySelect
            setCategoryId={setCategoryId}
            categoryId={categoryId}
          />
        </Field>
      </FieldGroup>
    </CategoryButton>
  );
}