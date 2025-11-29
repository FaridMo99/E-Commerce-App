"use client";
import InputValidationFailedText from "@/components/main/InputValidationFailedText";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateProductByProductId } from "@/lib/queries/client/adminQueries";
import useAuth from "@/stores/authStore";
import { AdminProduct } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProductSchema, UpdateProductSchema } from "@monorepo/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pen } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import CategorySelect from "./CategorySelect";



export function EditProduct( { product } : { product:AdminProduct } ) {
  const accessToken = useAuth((state) => state.accessToken);
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState,watch, setValue ,control} = useForm({
    resolver: zodResolver(updateProductSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price,
      sale_price: product.sale_price,
      stock_quantity: product.stock_quantity,
      is_public: product.is_public,
      category: product.category.id,
    },
  });

  const { errors } = formState;

  const { mutate, isPending } = useMutation({
    mutationKey: ["edit product", product.id],
    mutationFn: (newProduct:UpdateProductSchema) =>updateProductByProductId(product.id, newProduct, accessToken!),
    onSuccess: () => {
      toast.success("Edited Product successfully!");
      queryClient.invalidateQueries({queryKey:["get admin products"]})
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function submitHandler(updatedProduct: UpdateProductSchema) {
    mutate(updatedProduct);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="text-white cursor-pointer hover:text-white/80"
        >
          <Pen />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-backgroundBright text-white">
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Change Product fields</DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid gap-4">
            <Field className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" {...register("name")} />
              <InputValidationFailedText
                trigger={errors.name}
                text={errors.name?.message}
              />
            </Field>

            <Field className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="overflow-scroll wrap-break-word text-white max-h-50 min-h-40"
                {...register("description")}
              />
              <InputValidationFailedText
                trigger={errors.description}
                text={errors.description?.message}
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="flex flex-row justify-between items-center my-4">
            <Field>
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                step={0.01}
                id="price"
                {...register("price")}
              />
              <InputValidationFailedText
                trigger={errors.price}
                text={errors.price?.message}
              />
            </Field>
            <Field>
              <Label htmlFor="sale">Sale</Label>
              <Input
                type="number"
                id="sale"
                step={0.01}
                {...register("sale_price")}
              />
              <InputValidationFailedText
                trigger={errors.sale_price}
                text={errors.sale_price?.message}
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="flex flex-row justify-between items-center">
            <Field className="w-1/3">
              <Label htmlFor="stock">Stock Amount</Label>
              <Input
                type="number"
                step={1}
                min={0}
                id="stock"
                {...register("stock_quantity")}
              />
              <InputValidationFailedText
                trigger={errors.stock_quantity}
                text={errors.stock_quantity?.message}
              />
            </Field>
            <Field className="w-1/3">
              <Label htmlFor="category">Category</Label>
              <CategorySelect
                categoryId={watch("category")}
                setCategoryId={(val) => setValue("category", val)}
              />
              <InputValidationFailedText
                trigger={errors.category}
                text={errors.category?.message}
              />
            </Field>
            <Field className="w-1/3">
              <Label htmlFor="public">Public</Label>
              <Controller
                name="is_public"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <InputValidationFailedText
                trigger={errors.is_public}
                text={errors.is_public?.message}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 className="animate-spin text-white" />
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}