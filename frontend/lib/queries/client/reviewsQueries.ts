import { ReviewsQuerySchema } from "@monorepo/shared";
import { handleResponse } from "../utils";
import { apiBaseUrl } from "@/config/constants";
import { AccessToken, AuthProductReview, ProductReview } from "@/types/types";
import { getCsrfHeaderClientSide } from "@/lib/helpers";

export async function getAllReviews(
  queryParam?: ReviewsQuerySchema,
): Promise<ProductReview[]> {
  const params = new URLSearchParams();

  if (queryParam) {
    if (queryParam.page !== undefined)
      params.set("page", String(queryParam.page));
    if (queryParam.limit !== undefined)
      params.set("limit", String(queryParam.limit));
    if (queryParam.created_at) params.set("created_at", String(queryParam.created_at));
    if (queryParam.rating) params.set("rating", String(queryParam.rating));
    if (queryParam.sortBy !== undefined)
      params.set("sortBy", String(queryParam.sortBy));
    if (queryParam.sortOrder !== undefined)
      params.set("sortOrder", String(queryParam.sortOrder));
  }

  const url = `${apiBaseUrl}/reviews?${params.toString()}`;

  const res = await fetch(url, {
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function getReviewByReviewId(id: string): Promise<ProductReview> {
    

  const res = await fetch(`${apiBaseUrl}/reviews/${id}`);

  return await handleResponse(res);
}

export async function deleteReviewByReviewId(id: string, accessToken: AccessToken): Promise<void> {

  const res = await fetch(`${apiBaseUrl}/reviews/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await handleResponse(res);
}

export async function setReviewPrivateOrPublic(
  id: string,
  newState: boolean,
  accessToken: AccessToken
): Promise<AuthProductReview> {

  const res = await fetch(`${apiBaseUrl}/reviews/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaderClientSide(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ is_public: newState }),
  });
  return await handleResponse(res);
}
