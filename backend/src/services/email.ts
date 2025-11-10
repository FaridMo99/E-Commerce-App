import Mailjet from "node-mailjet";
import type { UrlType } from "../types/types.js";
import { CLIENT_ORIGIN, EMAIL_ADDRESS, MJ_APIKEY_PRIVATE, MJ_APIKEY_PUBLIC } from "../config/env.js";



const mailjet = new Mailjet.Client({
  apiKey: MJ_APIKEY_PUBLIC,
  apiSecret: MJ_APIKEY_PRIVATE,
});

export async function sendVerificationEmail(
  receiver: string,
  url: UrlType,
  token: string
) {
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

  console.log("sending email");

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

  const request = await mailjet.post("send", { version: "v3.1" }).request(data);

  return request;
}
