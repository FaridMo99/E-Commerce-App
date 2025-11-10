import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import multer from "multer";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../config/env.js";


cloudinary.config({
  cloud_name:CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export async function handleCloudUpload(
  file: Express.Multer.File
): Promise<UploadApiResponse> {
  const imageStringBase64 = `data:${
    file.mimetype
  };base64,${file.buffer.toString("base64")}`;

  const res = await cloudinary.uploader.upload(imageStringBase64, {
    resource_type: "auto",
  });
  return res;
}

export async function deleteCloudAsset(url:string): Promise<void> {
    const publicId = url.split("/").slice(-1)[0]?.split(".")[0]

  await cloudinary.uploader.destroy(publicId!, { resource_type: "image" });
}

export const upload = multer({ storage: multer.memoryStorage() });