import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Debug logging for 405 investigation
function logMiddleware(stage: string, req: Request, extra?: Record<string, unknown>) {
  console.log(`[Middleware:${stage}]`, {
    method: req.method,
    url: req.url,
    pathname: new URL(req.url).pathname,
    ...extra,
  });
}

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/api/health",
  "/api/debug(.*)",
  "/api/llm/(.*)",  // Let API routes handle their own auth to avoid middleware issues
  "/api/capture",   // Token-authenticated (validated in handler)
]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  logMiddleware("ENTRY", req, { isPublic: isPublicRoute(req), isApi: isApiRoute(req) });

  // Handle CORS preflight requests for API routes
  if (req.method === "OPTIONS" && isApiRoute(req)) {
    logMiddleware("OPTIONS_HANDLER", req);
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (!isPublicRoute(req)) {
    logMiddleware("AUTH_CHECK", req);
    const { userId } = await auth();
    logMiddleware("AUTH_RESULT", req, { hasUserId: !!userId });
    if (!userId) {
      // For API routes, return 401 instead of redirecting
      if (isApiRoute(req)) {
        logMiddleware("RETURNING_401", req);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      logMiddleware("REDIRECTING_TO_SIGNIN", req);
      return (await auth()).redirectToSignIn();
    }
  } else {
    logMiddleware("PUBLIC_ROUTE_SKIP_AUTH", req);
  }

  // Explicitly continue to route handler for all requests (including authenticated)
  logMiddleware("NEXT_RESPONSE", req);
  return NextResponse.next();
}, { debug: true });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
