import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCaptures } from "@/lib/db/queries/captures";

/**
 * GET /api/captures
 * List all unconverted captures (inbox)
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const captures = await getCaptures(userId);
    return NextResponse.json({ captures });
  } catch (error) {
    console.error("Error fetching captures:", error);
    return new Response("Failed to fetch captures", { status: 500 });
  }
}
