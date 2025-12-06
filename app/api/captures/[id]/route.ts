import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteCapture, convertCaptureToProject } from "@/lib/db/queries/captures";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/captures/[id]
 * Delete a capture
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id: captureId } = await context.params;
    await deleteCapture(captureId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting capture:", error);
    return new Response("Failed to delete capture", { status: 500 });
  }
}

/**
 * POST /api/captures/[id]
 * Convert capture to project
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id: captureId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { name } = body as { name?: string };

    const result = await convertCaptureToProject(captureId, userId, { name });

    return NextResponse.json({
      success: true,
      projectId: result.projectId,
    });
  } catch (error) {
    console.error("Error converting capture:", error);
    const message = error instanceof Error ? error.message : "Failed to convert capture";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
