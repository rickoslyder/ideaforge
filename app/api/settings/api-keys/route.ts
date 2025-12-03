import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getApiKeys, createApiKey } from "@/lib/db/queries/api-keys";
import { encryptApiKey } from "@/lib/crypto/api-keys";
import type { Provider } from "@/lib/llm/types";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const keys = await getApiKeys(userId);
    const apiKeys = keys.map((k) => ({
      id: k.id,
      provider: k.provider,
      name: k.name,
      isDefault: k.is_default,
      createdAt: k.created_at,
      hasKey: !!k.encrypted_key,
    }));

    return Response.json({ apiKeys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return new Response("Failed to fetch API keys", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { provider, key, name, endpointUrl, isDefault } = body as {
      provider: Provider;
      key: string;
      name?: string;
      endpointUrl?: string;
      isDefault?: boolean;
    };

    if (!provider || !key) {
      return new Response("Provider and key are required", { status: 400 });
    }

    const encryptedKey = await encryptApiKey(key, userId);

    await createApiKey({
      clerk_user_id: userId,
      provider,
      name: name || null,
      encrypted_key: encryptedKey,
      endpoint_url: endpointUrl || null,
      is_default: isDefault ?? true,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error creating API key:", error);
    return new Response("Failed to create API key", { status: 500 });
  }
}
