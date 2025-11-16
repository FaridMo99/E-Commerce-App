import type { Request, Response, NextFunction } from "express";
import stripe, { stripeEventHandler } from "../services/stripe.js";
import { STRIPE_WEBHOOK_SECRET } from "../config/env.js";
import chalk from "chalk";
import { getTimestamp } from "../lib/utils.js";

//request that key later from stripe for prod

//webhook that gets hit after order done
export async function stripeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.log(
      chalk.red(`${getTimestamp()} Stripe webhook call missing signature`)
    );
    return res.status(400).send("Missing signature");
  }

  try {
    console.log(chalk.yellow(`${getTimestamp()} Stripe webhook received`));

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    console.log(
      chalk.yellow(`${getTimestamp()} Stripe event constructed: ${event.type}`)
    );

    await stripeEventHandler(event);

    console.log(
      chalk.green(
        `${getTimestamp()} Stripe event handled successfully: ${event.type}`
      )
    );
    res.send({ received: true });
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Stripe webhook handling failed`),
      err
    );
    next(err);
  }
}
