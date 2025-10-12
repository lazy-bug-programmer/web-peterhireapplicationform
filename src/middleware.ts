import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Allow access to the root path
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  // Allow access to login page
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  // Check if the route is an admin route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Check for authentication cookie
    const userId = request.cookies.get("userId")?.value;

    if (!userId) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // For now, allow access if user has cookie - admin check will be done at component level
    return NextResponse.next();
  }

  // Allow access to all other routes
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ["/", "/admin/:path*"],
};
