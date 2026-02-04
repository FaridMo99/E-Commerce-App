import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllHeaders } from "./lib/serverHelpers";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
    const refreshToken = request.cookies.get("refreshToken");
    const additionalHeaders = await getAllHeaders();
    
  if (refreshToken) {
    try {
      const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/refresh-token`,
        {
          method: "POST",
          headers: additionalHeaders
        },
      );

        if (backendRes.ok) {
          
        const setCookies = backendRes.headers.getSetCookie();
        setCookies.forEach((cookie) => {
          response.headers.append("Set-Cookie", cookie);
        });
          
          const data = await backendRes.json();
        response.headers.set("x-internal-user", JSON.stringify(data.user));
        response.headers.set("x-internal-token", data.accessToken);
      } else if (backendRes.status === 401) {
          return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware Sync Error:", error);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
