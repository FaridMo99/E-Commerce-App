import type { Cart, CartItem } from "../generated/prisma/client.js";
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
