import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import {
  AWS_REGION,
  S3_BUCKET_NAME,
} from "../config/env.js";
import { getTimestamp } from "../lib/utils.js";
import chalk from "chalk";

const s3Client = new S3Client({region: AWS_REGION});

export async function handleS3Upload(file: Express.Multer.File) {
  try {
    console.log(
      chalk.yellow(
        `${getTimestamp()} Uploading to S3: ${file.originalname}...`,
      ),
    );

    const fileKey = `${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    console.log(
      chalk.green(`${getTimestamp()} S3 Upload Success: ${file.originalname}`),
    );

    return {
      url: `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`,
      key: fileKey,
    };
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} S3 Upload Failed: ${file.originalname}`),
      err,
    );
    throw err;
  }
}

export async function deleteS3Asset(fileKey: string): Promise<void> {
  try {
    console.log(
      chalk.yellow(`${getTimestamp()} Deleting S3 asset: ${fileKey}...`),
    );

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);

    console.log(chalk.green(`${getTimestamp()} S3 asset deleted: ${fileKey}`));
  } catch (err) {
    console.log(
      chalk.red(`${getTimestamp()} Failed to delete S3 asset: ${fileKey}`),
      err,
    );
    throw err;
  }
}

export const upload = multer({ storage: multer.memoryStorage() });
