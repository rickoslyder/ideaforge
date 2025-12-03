import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSnapshot, createSnapshotFromProject } from "@/lib/db/queries/snapshots";
import { getProject, updateProject } from "@/lib/db/queries/projects";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; snapshotId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the snapshot to restore
    const snapshot = await getSnapshot(params.snapshotId);
    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }

    // Get current project to create backup
    const currentProject = await getProject(params.projectId, userId);
    if (!currentProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create backup snapshot before restore
    await createSnapshotFromProject(currentProject, "auto");

    // Restore project from snapshot
    const snapshotData = snapshot.snapshot_data;
    await updateProject(params.projectId, userId, {
      name: snapshotData.name,
      current_phase: snapshotData.current_phase,
      request_content: snapshotData.request_content,
      spec_content: snapshotData.spec_content,
      spec_config: snapshotData.spec_config,
      plan_content: snapshotData.plan_content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restoring snapshot:", error);
    return NextResponse.json(
      { error: "Failed to restore snapshot" },
      { status: 500 }
    );
  }
}
