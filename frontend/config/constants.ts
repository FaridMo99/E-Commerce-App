export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL!;
export const API_BASE_URL = BASE_URL + "/api";
export const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!;
export const DOMAIN_NAME = process.env.NEXT_PUBLIC_DOMAIN_NAME!;
export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN!;

export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/api";
  }

  const internalUrl = process.env.BACKEND_DOCKER_INTERNAL_URL;
  const isDocker = process.env.NEXT_PUBLIC_DOCKER_ENV;

  if (isDocker === "true" && internalUrl) {
    return `${internalUrl}/api`;
  }

  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/api";
}