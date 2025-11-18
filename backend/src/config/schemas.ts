import { IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE } from "@monorepo/shared";
import z from "zod";

export const imageSchema = z.object({
  originalname: z.string().max(255),
  mimetype: z.enum(IMAGE_ALLOWED_TYPES),
  size: z.number().max(IMAGE_MAX_SIZE),
  buffer: z.instanceof(Buffer),
});
