import Stripe from "stripe";
import { STRIPE_API_KEY } from "../config/env.js";

const stripe = new Stripe(STRIPE_API_KEY, {
  typescript:true
})

export async function stripeEventHandler(type:Stripe.Event.Type) {
        switch (type) {
          case "payment_intent.succeeded":
            //successful action
            break;
          case "payment_intent.canceled":
            //cancelled action
            break;
          case "payment_intent.payment_failed":
            //failed payment action
            break;
          //add more actions

          default:
            console.log("Unhandled event" + type);
        }
}


export default stripe

//add middleware, rn everything public(get stripe webhook secret to protect this route)
//webhooks to update db and keep in sync
//should also notify owner if something sold out or close to sold out
//webhook to notify owner, email or sms
//paymentintents to create payments
//user creation for stripe
//etc. etc. etc.
//how to keep in sync with db and other users
//multi currency support
//handle payment fails
//redirect on success pay/fail pay/cancelled pay(server side redirect and frontend ui)
//handle stornierungen and refunds, also in db orders table