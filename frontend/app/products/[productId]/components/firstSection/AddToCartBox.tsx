"use client"
import { useState } from 'react'
import ItemQuantity from './ItemQuantity'
import AddCart from './AddCart'

type AddToCartBoxProps = {
    stockAmount: number
    productId:string
}

function AddToCartBox({ stockAmount, productId }: AddToCartBoxProps) {
  const [quantity, setQuantity] = useState<number>(
    stockAmount === 0 ? stockAmount : 1
  );
  return (
    <div className='flex flex-col justify-between items-center w-full'>
      <ItemQuantity
        quantity={quantity}
        setQuantity={setQuantity}
        maxQuantity={stockAmount}
      />
      <AddCart itemId={productId} quantity={quantity}/>
    </div>
  );
}

export default AddToCartBox