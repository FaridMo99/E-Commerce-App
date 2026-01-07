import { MetadataRoute } from "next";
import { DOMAIN } from "@/config/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/user",
        "/login",
        "/signup",
        "/new-verification-link",
        "/change-password",
        "/forgot-password",
        "/verify-success",
        "/oauth-success",
      ],
    },
    sitemap: `${DOMAIN}/sitemap.xml`,
  };
}
