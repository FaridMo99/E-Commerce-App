"use client";
import { useState } from "react";
import useAuth from "@/stores/authStore";
import { createCategory } from "@/lib/queries/client/adminQueries";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryButton } from "./CategoryButton";
import { Field } from "@/components/ui/field";

export function CreateCategoryButton() {
  const accessToken = useAuth((state) => state.accessToken);
  const [category, setCategory] = useState<string>("");

  return (
    <CategoryButton
      title="Create Category"
      buttonText="Create Category"
      submitButtonText="Submit"
      successMessage="Created Category successfully!"
      mutationFn={(name: string) => createCategory(name, accessToken!)}
      mutationArgs={category}
      mutationKey={["create categorie"]}
      invalidQueries={["get all categories"]}
      categoryLength={category.length}
    >
      <Field className="grid gap-3">
        <Label htmlFor="category">Category Name:</Label>
        <Input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </Field>
    </CategoryButton>
  );
}
