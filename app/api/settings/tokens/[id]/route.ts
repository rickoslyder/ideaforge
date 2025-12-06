import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revokeApiToken, deleteApiToken } from "@/lib/db/queries/api-tokens";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/settings/tokens/[id]
 * Revoke (soft delete) an API token
 *
 * Query params:
 * - permanent=true: Hard delete instead of revoke
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id: tokenId } = await context.params;
    const permanent = req.nextUrl.searchParams.get("permanent") === "true";

    if (permanent) {
      await deleteApiToken(tokenId, userId);
    } else {
      await revokeApiToken(tokenId, userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking API token:", error);
    return new Response("Failed to revoke API token", { status: 500 });
  }
}
