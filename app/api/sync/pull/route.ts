import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { pullChanges, fullPull } from "@/lib/sync/pull";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lastSyncedAt, localData, fullSync } = body;

    if (fullSync) {
      const result = await fullPull(userId);
      return NextResponse.json(result);
    }

    if (!localData) {
      return NextResponse.json(
        { error: "localData is required for incremental sync" },
        { status: 400 }
      );
    }

    const result = await pullChanges(userId, lastSyncedAt, localData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Pull sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
