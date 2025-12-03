import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { pushChanges } from "@/lib/sync/push";
import type { QueuedChange } from "@/lib/sync/queue";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const changes = body.changes as QueuedChange[];

    if (!Array.isArray(changes)) {
      return NextResponse.json(
        { error: "Invalid request: changes must be an array" },
        { status: 400 }
      );
    }

    if (changes.length === 0) {
      return NextResponse.json({
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
      });
    }

    // Validate changes
    for (const change of changes) {
      if (!change.entityType || !change.operation || !change.localId) {
        return NextResponse.json(
          { error: "Invalid change: missing required fields" },
          { status: 400 }
        );
      }
    }

    const summary = await pushChanges(changes, userId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Push sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
