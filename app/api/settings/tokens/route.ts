import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getApiTokens, createApiToken } from "@/lib/db/queries/api-tokens";

/**
 * GET /api/settings/tokens
 * List all API tokens for the current user (excludes revoked)
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const tokens = await getApiTokens(userId);
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Error fetching API tokens:", error);
    return new Response("Failed to fetch API tokens", { status: 500 });
  }
}

/**
 * POST /api/settings/tokens
 * Create a new API token
 *
 * Body:
 * - name: string (required) - Name for the token (e.g., "Chrome Extension")
 * - scopes?: string[] - Allowed scopes (default: ["capture:write"])
 * - expiresInDays?: number - Optional expiration in days
 *
 * Response includes the raw token (only shown once!)
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, scopes, expiresInDays } = body as {
      name: string;
      scopes?: string[];
      expiresInDays?: number;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Token name is required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Token name must be 100 characters or less" },
        { status: 400 }
      );
    }

    const result = await createApiToken(userId, name.trim(), {
      scopes,
      expiresInDays,
    });

    return NextResponse.json({
      token: result.token, // Raw token - only shown once!
      id: result.record.id,
      name: result.record.name,
      tokenPrefix: result.record.token_prefix,
      scopes: result.record.scopes,
      expiresAt: result.record.expires_at,
      createdAt: result.record.created_at,
    });
  } catch (error) {
    console.error("Error creating API token:", error);
    return new Response("Failed to create API token", { status: 500 });
  }
}
