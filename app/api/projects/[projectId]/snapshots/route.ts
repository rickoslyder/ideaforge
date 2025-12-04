import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSnapshots, createSnapshotFromProject } from "@/lib/db/queries/snapshots";
import { getProject } from "@/lib/db/queries/projects";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshots = await getSnapshots(params.projectId);
    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error("Error fetching snapshots:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch snapshots" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const trigger = body.trigger || "manual";

    // Get current project state
    const project = await getProject(params.projectId, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create snapshot from current state
    const snapshot = await createSnapshotFromProject(project, trigger);

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("Error creating snapshot:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create snapshot" },
      { status: 500 }
    );
  }
}
