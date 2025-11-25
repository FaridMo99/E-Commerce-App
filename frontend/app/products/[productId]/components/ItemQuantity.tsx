"use client"

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { MinusIcon, PlusIcon } from "lucide-react";

type ItemQuantityProps = {
    quantity: number;
    setQuantity: React.Dispatch<number>,
    maxQuantity: number;
}


function ItemQuantity({
  quantity,
  setQuantity,
  maxQuantity,
}: ItemQuantityProps) {
  
  return (
      <ButtonGroup>
        <Button
          disabled={quantity === 0}
          onClick={() => setQuantity( quantity - 1)}
          size="sm"
          variant="outline"
        >
          <MinusIcon />
        </Button>
        <ButtonGroupText className="min-w-12 justify-center">
          {quantity}
        </ButtonGroupText>
          <Button
              disabled={quantity === maxQuantity}
            onClick={() => {
                if (quantity < maxQuantity) {
                setQuantity(quantity + 1);   
                }
            }}
          size="sm"
          variant="outline"
        >
          <PlusIcon />
        </Button>
      </ButtonGroup>
  );
}

export default ItemQuantity

