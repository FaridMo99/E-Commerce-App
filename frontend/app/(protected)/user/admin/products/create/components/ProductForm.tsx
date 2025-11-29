"use client"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createProduct, getBaseCurrency } from "@/lib/queries/client/adminQueries"
import useAuth from "@/stores/authStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import CategorySelect from "../../components/CategorySelect"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import ImageUpload from "./ImageUpload"
import InputValidationFailedText from "@/components/main/InputValidationFailedText"
import { ClientProductSchema, fullClientProductSchema } from "@/schemas/schemas"
import { DEFAULT_NICE_PRICE } from "@monorepo/shared"

function ProductForm() {
    const accessToken = useAuth(state => state.accessToken)
  const { register, formState, reset, handleSubmit, watch, setValue, control } = useForm({
    resolver: zodResolver(fullClientProductSchema),
    defaultValues: {
      stock_quantity:1
    }
  })
    const {errors} = formState

    const { data: currency, isLoading } = useQuery({
        queryKey: ["get base currency"],
        queryFn:()=>getBaseCurrency(accessToken!)
    })
    const { mutate, isPending } = useMutation({
      mutationKey: ["create product"],
      mutationFn: (product: ClientProductSchema) =>
        createProduct(product, accessToken!),
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: () => {
        toast.success("Successfully created Product");
        reset();
      },
    });

    function submitHandler(product:ClientProductSchema) {
        mutate(product)
    }


  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="bg-backgroundBright flex flex-col w-full h-full rounded-lg p-8 mt-4"
    >
      <Field>
        <Label htmlFor="name">Name</Label>
        <Input {...register("name")} id="name" type="text" />
        <InputValidationFailedText
          trigger={errors.name}
          text={errors.name?.message}
        />
      </Field>
      <Field className="my-4">
        <Label htmlFor="description">Description</Label>
        <Textarea {...register("description")} id="description" />
        <InputValidationFailedText
          trigger={errors.description}
          text={errors.description?.message}
        />
      </Field>
      <Field className="mb-4">
        <div className="flex justify-between">
          <Label>Category</Label>
        </div>
        <CategorySelect
          categoryId={watch("category")}
          setCategoryId={(val) => setValue("category", val)}
        />
        <InputValidationFailedText
          trigger={errors.category}
          text={errors.category?.message}
        />
      </Field>
      <Field>
        <Label>Product Images</Label>
        <ImageUpload
          value={watch("images")}
          onChange={(files) =>
            setValue("images", files, { shouldValidate: true })
          }
        />
        <InputValidationFailedText
          trigger={errors.images}
          text={errors.images?.message}
        />
      </Field>

      <div className="flex justify-between items-center my-4">
        <Field className="w-4/10 relative">
          <Label htmlFor="price">Price</Label>
          <div className="relative">
            {!isLoading && currency && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                {currency.value}
              </span>
            )}
            <Input
              step={0.01}
              {...register("price")}
              id="price"
              type="number"
              className="pl-12"
              placeholder={`  has to end with .${DEFAULT_NICE_PRICE}`}
            />
          </div>
          <InputValidationFailedText
            trigger={errors.price}
            text={errors.price?.message}
          />
        </Field>
        <Field className="w-4/10 relative">
          <Label htmlFor="sale">Sale Price (Optional)</Label>
          <div className="relative">
            {!isLoading && currency && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                {currency.value}
              </span>
            )}
            <Input
              step={0.01}
              {...register("sale_price")}
              id="sale"
              type="number"
              className="pl-12"
              placeholder={`  has to end with .${DEFAULT_NICE_PRICE}`}
            />
          </div>
          <InputValidationFailedText
            trigger={errors.sale_price}
            text={errors.sale_price?.message}
          />
        </Field>
      </div>
      <Field className="my-4">
        <Label htmlFor="amount">Quantity</Label>
        <Input {...register("stock_quantity")} id="amount" type="number" />
        <InputValidationFailedText
          trigger={errors.stock_quantity}
          text={errors.stock_quantity?.message}
        />
      </Field>
      <Label className="mb-2" htmlFor="public">
        Public
      </Label>
      <Field className="bg-background/60 border border-white/30 rounded-2xl flex flex-row justify-around">
        <div className="ml-4 p-6">
          <p className="text-white">
            Toggle to show or hide this product in your store
          </p>
          <p className="text-white/50 text-sm mt-2 ml-2">
            On default is not public
          </p>
        </div>
        <div className="flex justify-end items-center p-6">
          <Controller
            name="is_public"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        <InputValidationFailedText
          trigger={errors.is_public}
          text={errors.is_public?.message}
        />
      </Field>
      <Button className="my-4 self-center" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="animate-spin" /> : "Create"}
      </Button>
    </form>
  );
}

export default ProductForm