import Mailjet from "node-mailjet";
import dotenv from "dotenv"
dotenv.config()

const publicKey = process.env.MJ_APIKEY_PUBLIC!
const privateKey = process.env.MJ_APIKEY_PRIVATE!

const mailjet = new Mailjet.Client({
  apiKey: publicKey, 
  apiSecret: privateKey,
});

export async function sendVerificationEmail(
  receiver: string,
  token: string
) {
  const clientOrigin = process.env.CLIENT_ORIGIN;
  const senderEmail = process.env.EMAIL_ADDRESS!;
  const senderName = `The ${clientOrigin} Team`;

  const verificationLink = `${clientOrigin}/verify?token=${token}`;

  const subject ="E-Mail verification - ${clientOrigin}"

  const htmlPart = `
    <h2>Hi there 👋</h2>
    <p>You recently visited ${clientOrigin}.</p>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationLink}">Link</a>
    <p>This link will expire in 24 hours.</p>
    <p>Wasnt you? Ignore this E-Mail.</p>
    <p>Thanks,</p>
    <h3>The ${clientOrigin} Team</h3>`;

  const textPart = `
    Hi there 👋

    You recently visited ${clientOrigin}.
    Please verify your email
    by clicking the link below:
    ${verificationLink}

    This link will expire in 24 hours.
    Wasnt you? Ignore this E-Mail.

    Thanks,
    The ${clientOrigin} Team`;

  console.log("sending email");

  const data = {
    Messages: [
      {
        From: {
          Email: senderEmail,
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
