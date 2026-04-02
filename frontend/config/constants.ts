export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL!;
export const DOCKER_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_DOCKER_INTERNAL_URL!;
export const API_BASE_URL = BASE_URL + "/api";
export const API_DOCKER_BASE_URL = DOCKER_BASE_URL + "/api";
export const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!;
export const DOMAIN_NAME = process.env.NEXT_PUBLIC_DOMAIN_NAME!;
export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN!;
export const IS_DOCKER_CONTAINER = process.env.NEXT_PUBLIC_DOCKER_ENV!;

export function getApiUrl():string {
  if (typeof window !== "undefined") {
    return API_BASE_URL
  }

    if (IS_DOCKER_CONTAINER === "true") {
        return API_DOCKER_BASE_URL
    }

     return API_BASE_URL;
};