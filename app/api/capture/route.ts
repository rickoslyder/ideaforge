import { NextRequest, NextResponse } from "next/server";
import { extractTokenFromHeader } from "@/lib/auth/api-token";
import { validateToken } from "@/lib/db/queries/api-tokens";
import { createCapture, createCaptureAsProject } from "@/lib/db/queries/captures";
import type { CaptureSourceType } from "@/lib/db/types";

// CORS headers for browser extension
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * OPTIONS /api/capture
 * Handle CORS preflight for browser extensions
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * POST /api/capture
 * Create a quick capture (token-authenticated)
 *
 * Headers:
 * - Authorization: Bearer idfc_...
 *
 * Body:
 * - title: string (required) - Title for the capture
 * - idea?: string - Main idea content
 * - source_url?: string - URL where the idea came from
 * - source_title?: string - Title of the source page
 * - selected_text?: string - Text that was highlighted
 * - tags?: string[] - Tags for organization
 * - metadata?: object - Additional flexible data
 * - create_project?: boolean - true = create project directly, false = add to inbox
 *
 * Response:
 * - If create_project: true → { success, project: { id, local_id, name, url } }
 * - If create_project: false → { success, capture: { id, title, created_at } }
 */
export async function POST(req: NextRequest) {
  // Validate token
  const token = extractTokenFromHeader(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { error: "Missing or invalid authorization token" },
      { status: 401, headers: corsHeaders }
    );
  }

  const validation = await validateToken(token);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 401, headers: corsHeaders }
    );
  }

  // Check scope
  if (!validation.scopes.includes("capture:write")) {
    return NextResponse.json(
      { error: "Token does not have capture:write scope" },
      { status: 403, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    const {
      title,
      idea,
      source_url,
      source_title,
      selected_text,
      tags,
      metadata,
      create_project,
    } = body as {
      title: string;
      idea?: string;
      source_url?: string;
      source_title?: string;
      selected_text?: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
      create_project?: boolean;
    };

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate field lengths
    if (title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or less" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (idea && idea.length > 10000) {
      return NextResponse.json(
        { error: "Idea must be 10,000 characters or less" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (source_url && source_url.length > 2000) {
      return NextResponse.json(
        { error: "Source URL must be 2,000 characters or less" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (tags && tags.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 tags allowed" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Determine source type from metadata or default to "api"
    const sourceType: CaptureSourceType =
      (metadata?.source_type as CaptureSourceType) || "api";

    if (create_project) {
      // Create directly as a project
      const result = await createCaptureAsProject(validation.userId, {
        title: title.trim(),
        idea,
        sourceUrl: source_url,
        sourceTitle: source_title,
        selectedText: selected_text,
        sourceType,
        tags,
        metadata,
      });

      // Build project URL
      const baseUrl = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
      const projectUrl = `${baseUrl}/projects/${result.localId}/request`;

      return NextResponse.json(
        {
          success: true,
          project: {
            id: result.projectId,
            local_id: result.localId,
            name: title.trim(),
            url: projectUrl,
          },
        },
        { headers: corsHeaders }
      );
    } else {
      // Create as inbox capture
      const capture = await createCapture({
        clerk_user_id: validation.userId,
        title: title.trim(),
        idea: idea || null,
        source_url: source_url || null,
        source_title: source_title || null,
        selected_text: selected_text || null,
        source_type: sourceType,
        tags: tags || null,
        metadata: metadata || null,
      });

      return NextResponse.json(
        {
          success: true,
          capture: {
            id: capture.id,
            title: capture.title,
            created_at: capture.created_at,
          },
        },
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Error creating capture:", error);
    return NextResponse.json(
      { error: "Failed to create capture" },
      { status: 500, headers: corsHeaders }
    );
  }
}
