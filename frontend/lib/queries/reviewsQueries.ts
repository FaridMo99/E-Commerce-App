import { ReviewsQuerySchema } from "@monorepo/shared";
import { apiBaseUrl } from "./productQueries";
import { handleResponse } from "./utils";

export async function getAllReviews(
  queryParam?: ReviewsQuerySchema,
): Promise<> {
  const params = new URLSearchParams();

  if (queryParam) {
    if (queryParam.page !== undefined)
      params.set("page", String(queryParam.page));
    if (queryParam.limit !== undefined)
      params.set("limit", String(queryParam.limit));
    if (queryParam.created_at) params.set("created_at", queryParam.created_at);
    if (queryParam.rating) params.set("rating", queryParam.rating);
    if (queryParam.sortBy !== undefined)
      params.set("sortBy", String(queryParam.sortBy));
    if (queryParam.sortOrder !== undefined)
      params.set("sortOrder", String(queryParam.sortOrder));
  }

  const url = `${apiBaseUrl}/reviews?${params.toString()}`;

  const res = await fetch(url, { credentials: "include" });
  return await handleResponse(res);
}

export async function getReviewByReviewId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/reviews/${id}`);
  const data = await res.json();

  return await handleResponse(res);
}

export async function deleteReviewByReviewId(id: string): Promise<> {
  const res = await fetch(`${apiBaseUrl}/reviews/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return await handleResponse(res);
}

export async function setReviewPrivateOrPublic(
  id: string,
  newState: boolean,
): Promise<> {
  const res = await fetch(`${apiBaseUrl}/reviews/${id}`, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_public: newState }),
  });
  return await handleResponse(res);
}
