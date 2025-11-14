export const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
export const apiBaseUrl = baseUrl + "/api";

//button click redirects to this route
export const googleLoginPath = `${apiBaseUrl}/auth/oauth/google`;
export const facebookLoginPath = `${apiBaseUrl}/auth/oauth/facebook`;
