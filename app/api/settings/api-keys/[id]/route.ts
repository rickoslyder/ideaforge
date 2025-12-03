import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteApiKey } from "@/lib/db/queries/api-keys";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteApiKey(id, userId);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return new Response("Failed to delete API key", { status: 500 });
  }
}
