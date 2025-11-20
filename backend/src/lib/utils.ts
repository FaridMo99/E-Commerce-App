import type { ProductWithSelectedFields } from "../config/prismaHelpers.js";

export const getTimestamp = () =>
  `[${new Date().toISOString().replace("T", ", ").replace("Z", "")}]`;

type ProductWithAvgRating = ProductWithSelectedFields & {
  averageRating: number;
};


export function calcAvgRating(product:ProductWithSelectedFields ) {
  const ratings = product.reviews?.map((r) => r.rating) ?? [];

  (product as ProductWithAvgRating).averageRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;


  delete (product as { reviews?: any }).reviews;

}