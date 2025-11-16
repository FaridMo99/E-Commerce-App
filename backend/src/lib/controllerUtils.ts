import type { Cart, CartItem, Product } from "../generated/prisma/client.js";
import type { BatchPayload } from "../generated/prisma/internal/prismaNamespace.js";
import prisma from "../services/prisma.js";

type CartReturn = (Cart & { items: CartItem[] }) | null;

export async function deleteUserCart(
  userId: string,
): Promise<[BatchPayload, CartReturn]> {
  const [_, cart] = await prisma.$transaction([
    prisma.cartItem.deleteMany({
      where: { cart: { userId: userId } },
    }),
    prisma.cart.findUnique({
      where: { userId: userId },
      include: { items: true },
    }),
  ]);

  return [_, cart];
}


export function calculateAverage(numbers:number[]) {

    if (!numbers.length) return 0;
    const sum = numbers.reduce((total, n) => total + n, 0);
    return sum / numbers.length;

}