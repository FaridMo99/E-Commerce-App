import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import multer from "multer";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../config/env.js";
import { getTimestamp } from "../lib/utils.js";
import chalk from "chalk";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});


export async function handleCloudUpload(
  file: Express.Multer.File
): Promise<UploadApiResponse> {
  try {
    console.log(chalk.yellow(`${getTimestamp()} Uploading file: ${file.originalname}...`));

    const imageStringBase64 = `data:${
      file.mimetype
    };base64,${file.buffer.toString("base64")}`;

    const res = await cloudinary.uploader.upload(imageStringBase64, {
      resource_type: "auto",
    });

    console.log(
      chalk.green(
        `${getTimestamp()} File uploaded successfully: ${file.originalname}`
      )
    );
    return res;
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to upload file: ${file.originalname}`),err);
    throw err;
  }
}

export async function deleteCloudAsset(url: string): Promise<void> {
  try {
    const publicId = url.split("/").slice(-1)[0]?.split(".")[0];
    console.log(
      chalk.yellow(`${getTimestamp()} Deleting cloud asset: ${publicId}...`)
    );

    await cloudinary.uploader.destroy(publicId!, { resource_type: "image" });

    console.log(chalk.green(`${getTimestamp()} Cloud asset deleted successfully: ${publicId}`));
  } catch (err) {
    console.log(chalk.red(`${getTimestamp()} Failed to delete cloud asset: ${url}`),err);
    throw err;
  }
}

export const upload = multer({ storage: multer.memoryStorage() });
