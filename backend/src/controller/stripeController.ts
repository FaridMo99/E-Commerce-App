import type { Request, Response, NextFunction } from "express";
import stripe, { stripeEventHandler } from "../services/stripe.js";
import { STRIPE_WEBHOOK_SECRET } from "../config/env.js";

//request that key later from stripe for prod

//webhook that gets hit after order done
export async function stripeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).send("Missing signature");

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET,
    );
    
    await stripeEventHandler(event);

    res.send({ received: true });
  } catch (err) {
    next(err);
  }
}
