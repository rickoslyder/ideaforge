import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateApiKey } from "@/lib/db/queries/api-keys";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    await updateApiKey(id, userId, { is_default: true });
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error setting default API key:", error);
    return new Response("Failed to set default API key", { status: 500 });
  }
}
