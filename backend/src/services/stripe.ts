import Stripe from "stripe";
import { STRIPE_API_KEY } from "../config/env.js";
import { deleteUserCart } from "../lib/controllerUtils.js";
import prisma from "./prisma.js";
import { email, includes } from "zod";
import { sendOrderEmail } from "./email.js";

const stripe = new Stripe(STRIPE_API_KEY, {
  typescript: true,
});



//success -> send email with data, update stock amount
export async function stripeEventHandler(stripeEvent: Stripe.Event,) {

  switch (stripeEvent.type) {
    //only for card payment not for async payments like klarna etc.
    case "checkout.session.completed":
      //successful action
      const session = stripeEvent.data.object
      const orderId = session.metadata?.orderId!;
      const userId = session.metadata?.userId!;
        
      //update order status and empty user cart
      const [cart, order] = await prisma.$transaction([
        prisma.cart.delete({
          where: { userId },
          include: {
            user: { select: { email: true } },
            items: { include: { product: true } },
          },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: { status: "ORDERED" },
          include: { items: { include: { product: true } } },
        }),
      ]);

      await sendOrderEmail(cart.user.email,order)
    default:
      console.log("Unhandled event" + stripeEvent.type);
  }
}

export default stripe;