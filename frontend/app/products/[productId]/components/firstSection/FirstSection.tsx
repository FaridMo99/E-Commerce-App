"use client";
import { Product } from "@/types/types";
import useAuth from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProductToRecentlyViewedProductsByProductId } from "@/lib/queries/client/usersQueries";
import { useEffect } from "react";
import ImagePart from "./ImagePart";
import DescriptionPart from "./DescriptionPart";
import AddingPart from "./AddingPart";

type FirstSectionProps = {
  product: Product;
};

function FirstSection({ product }: FirstSectionProps) {
  const accessToken = useAuth((state) => state.accessToken);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: ["add product to recently viewed", product],
    mutationFn: () => addProductToRecentlyViewedProductsByProductId(product.id, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get recently viewed products"],
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });

  useEffect(() => {
    if (accessToken) {
      mutate();
    }
  }, [mutate]);

  return (
    <section className="flex justify-between w-full h-[85vh] px-8">
      <div className="flex items-center">
      <ImagePart imageUrls={product.imageUrls}/>
      <DescriptionPart product={product}/>
      </div>
    <AddingPart product={product}/>
    </section>
  );
}

export default FirstSection;
