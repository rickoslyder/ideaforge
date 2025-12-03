import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

const LITELLM_PRICING_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";

// In-memory cache with TTL
let pricingCache: { data: Record<string, unknown>; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = Date.now();

  // Return cached data if fresh
  if (pricingCache && now - pricingCache.fetchedAt < CACHE_TTL) {
    return Response.json(pricingCache.data);
  }

  try {
    const response = await fetch(LITELLM_PRICING_URL, {
      next: { revalidate: CACHE_TTL / 1000 }, // Next.js cache
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pricing data: ${response.status}`);
    }

    const data = await response.json();

    // Update cache
    pricingCache = { data, fetchedAt: now };

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching pricing data:", error);

    // Return stale cache if available
    if (pricingCache) {
      return Response.json(pricingCache.data);
    }

    return new Response("Failed to fetch pricing data", { status: 500 });
  }
}
