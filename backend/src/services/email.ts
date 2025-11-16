import Mailjet from "node-mailjet";
import type { UrlType } from "../types/types.js";
import {
  CLIENT_ORIGIN,
  DEV_EMAIL_FALLBACK_IF_NO_ADMIN,
  EMAIL_ADDRESS,
  MJ_APIKEY_PRIVATE,
  MJ_APIKEY_PUBLIC,
} from "../config/env.js";
import type { Prisma } from "../generated/prisma/client.js";
import { formatPriceForClient } from "../lib/currencyHandlers.js";
import { getTimestamp } from "../lib/utils.js";
import chalk from "chalk";
import type { RequestData } from "node-mailjet/declarations/request/Request.js";
import prisma from "./prisma.js";

type OrderWithItemsAndProduct = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: { product: true };
    };
  };
}>;

const mailjet = new Mailjet.Client({
  apiKey: MJ_APIKEY_PUBLIC,
  apiSecret: MJ_APIKEY_PRIVATE,
});

export async function sendVerificationEmail(
  receiver: string,
  url: UrlType,
  token: string
): Promise<Mailjet.LibraryResponse<RequestData>> {
  const senderName = `The ${CLIENT_ORIGIN} Team`;

  const verificationLink = `${CLIENT_ORIGIN}/${url}?token=${token}`;

  const subject =
    url === "verify-success"
      ? `E-Mail verification - ${CLIENT_ORIGIN}`
      : `Change Password - ${CLIENT_ORIGIN}`;

  const htmlPart = `
    <h2>Hi there 👋</h2>
    <p>You recently visited ${CLIENT_ORIGIN}.</p>
    <p>Please ${
      url === "verify-success" ? "verify your email" : "change your Password"
    } by clicking the link below:</p>
    <a href="${verificationLink}">Link</a>
    <p>This link will expire in 24 hours.</p>
    <p>Wasnt you? Ignore this E-Mail.</p>
    <p>Thanks,</p>
    <h3>The ${CLIENT_ORIGIN} Team</h3>`;

  const textPart = `
    Hi there 👋

    You recently visited ${CLIENT_ORIGIN}.
    Please ${
      url === "verify-success" ? "verify your email" : "change your Password"
    } by clicking the link below:
    ${verificationLink}

    This link will expire in 24 hours.
    Wasnt you? Ignore this E-Mail.

    Thanks,
    The ${CLIENT_ORIGIN} Team`;

  const data = {
    Messages: [
      {
        From: {
          Email: EMAIL_ADDRESS,
          Name: senderName,
        },
        To: [
          {
            Email: receiver,
          },
        ],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart,
      },
    ],
  };

  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Sending ${url} email to: ${receiver}...`)
    );
    const request = await mailjet
      .post("send", { version: "v3.1" })
      .request(data);

    console.log(
      chalk.green(
        `${getTimestamp()} ${url} email successfully sent to: ${receiver}`
      )
    );

    return request;
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to send email to: ${receiver}`),
      err
    );
    throw err;
  }
}

export async function sendOrderEmail(
  receiver: string,
  order: OrderWithItemsAndProduct
): Promise<Mailjet.LibraryResponse<RequestData>> {
  const senderName = `The ${CLIENT_ORIGIN} Team`;

  const orderItemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:8px;">
          <img src="${item.product.imageUrls?.[0] ?? ""}" alt="${item.product.name}" width="60" style="object-fit:cover; margin-right:8px; vertical-align:middle;">
          ${item.product.name}
        </td>
        <td style="padding:8px; text-align:center;">${item.quantity}</td>
        <td style="padding:8px; text-align:right;">${formatPriceForClient(item.price_at_purchase)}</td>
      </tr>
    `
    )
    .join("");

  const orderItemsText = order.items
    .map(
      (item) =>
        `${item.product.name} x${item.quantity} - ${formatPriceForClient(item.price_at_purchase)}`
    )
    .join("\n");

  const subject = `Your Order #${order.id} at ${CLIENT_ORIGIN}`;

  const htmlPart = `
    <h2>Hi there 👋</h2>
    <p>Thanks for your order! Here’s a summary of your purchase:</p>
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml}
      </tbody>
    </table>
    <p><strong>Total: ${formatPriceForClient(order.total_amount)}</strong></p>
    <p>Order ID: ${order.id}</p>
    <p>You can view your order details <a href="${CLIENT_ORIGIN}/user/orders/${order.id}">here</a>.</p>
    <p>Thanks,<br/>The ${CLIENT_ORIGIN} Team</p>
  `;

  const textPart = `
Hi there 👋

Thanks for your order! Here’s a summary of your purchase:

${orderItemsText}

Total: ${formatPriceForClient(order.total_amount)}
Order ID: ${order.id}

View your order details: ${CLIENT_ORIGIN}/user/orders/${order.id}

Thanks,
The ${CLIENT_ORIGIN} Team
  `;

  const data = {
    Messages: [
      {
        From: { Email: EMAIL_ADDRESS, Name: senderName },
        To: [{ Email: receiver }],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart,
      },
    ],
  };

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Sending order email to: ${receiver}, order ID: ${order.id}`
      )
    );
    const request = await mailjet
      .post("send", { version: "v3.1" })
      .request(data);
    console.log(
      chalk.green(
        `${getTimestamp()} Order email successfully sent to: ${receiver}, order ID: ${order.id}`
      )
    );
    return request;
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to send order email to: ${receiver}, order ID: ${order.id}`
      ),
      err
    );
    throw err;
  }
}

export async function notifyAdmin(
  about: string
): Promise<Mailjet.LibraryResponse<any> | void> {
  const senderName = `The ${CLIENT_ORIGIN} Team`;
  const subject = `Admin Notification - ${CLIENT_ORIGIN}`;

  
  let adminEmail: string | undefined;
  try {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    adminEmail = admin?.email ?? DEV_EMAIL_FALLBACK_IF_NO_ADMIN;
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to fetch admin from DB`),
      err
    );
    adminEmail = DEV_EMAIL_FALLBACK_IF_NO_ADMIN;
  }

  if (!adminEmail) {
    console.log(
      chalk.red(
        `${getTimestamp()} No admin email configured, skipping notification.`
      )
    );
    return;
  }

  const htmlPart = `
    <h2>Admin Notification 👋</h2>
    <p>${about}</p>
    <p>Sent from ${CLIENT_ORIGIN}</p>`;

  const textPart = `
Admin Notification

${about}

Sent from ${CLIENT_ORIGIN}`;

  const data = {
    Messages: [
      {
        From: { Email: EMAIL_ADDRESS, Name: senderName },
        To: [{ Email: adminEmail }],
        Subject: subject,
        TextPart: textPart,
        HTMLPart: htmlPart,
      },
    ],
  };

  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Sending admin notification to: ${adminEmail}...`
      )
    );
    const request = await mailjet
      .post("send", { version: "v3.1" })
      .request(data);
    console.log(
      chalk.green(
        `${getTimestamp()} Admin notification sent successfully to: ${adminEmail}`
      )
    );
    return request;
  } catch (err) {
    console.log(
      chalk.red(
        `${getTimestamp()} Failed to send admin notification to: ${adminEmail}`
      ),
      err
    );
    throw err;
  }
}