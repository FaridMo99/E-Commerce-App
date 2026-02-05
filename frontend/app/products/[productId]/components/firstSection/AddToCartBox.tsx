"use client";
import { useEffect, useState } from "react";
import ItemQuantity from "./ItemQuantity";
import AddCart from "./AddCart";
import useAuth from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProductToRecentlyViewedProductsByProductId } from "@/lib/queries/client/usersQueries";

type AddToCartBoxProps = {
  stockAmount: number;
  productId: string;
};

//logic for addProductToRecentlyViewedProductsByProductId here instead of elsewhere since this already a client component
function AddToCartBox({ stockAmount, productId }: AddToCartBoxProps) {
  const [quantity, setQuantity] = useState<number>(
    stockAmount === 0 ? stockAmount : 1,
  );
      const accessToken = useAuth((state) => state.accessToken);
      const queryClient = useQueryClient();

      const { mutate } = useMutation({
        mutationKey: ["add product to recently viewed", productId],
        mutationFn: () =>
          addProductToRecentlyViewedProductsByProductId(
            productId,
            accessToken!,
          ),
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
        if (accessToken && productId) {
          mutate();
        }
      }, [mutate, accessToken, productId]);
  
  return (
    <div className="flex flex-col justify-between items-center w-full">
      <ItemQuantity
        quantity={quantity}
        setQuantity={setQuantity}
        maxQuantity={stockAmount}
      />
      <AddCart itemId={productId} quantity={quantity} />
    </div>
  );
}

export default AddToCartBox;
