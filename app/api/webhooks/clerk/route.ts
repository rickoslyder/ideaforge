import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/client";
import type { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the webhook event
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;

      case "user.updated":
        await handleUserUpdated(evt.data);
        break;

      case "user.deleted":
        if (evt.data.id) {
          await handleUserDeleted({ id: evt.data.id });
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}

interface ClerkUserData {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}

async function handleUserCreated(data: ClerkUserData) {
  const { id: clerkUserId } = data;

  // Create default user preferences
  const { error } = await supabase.from("user_preferences").insert({
    clerk_user_id: clerkUserId,
    default_model: null,
    theme: "system",
  });

  if (error && error.code !== "23505") {
    // Ignore duplicate key errors
    throw error;
  }

  console.log(`Created preferences for user: ${clerkUserId}`);
}

async function handleUserUpdated(data: ClerkUserData) {
  const { id: clerkUserId } = data;

  // Ensure user preferences exist
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (!existing) {
    await handleUserCreated(data);
  }

  console.log(`Updated user: ${clerkUserId}`);
}

async function handleUserDeleted(data: ClerkUserData) {
  const { id: clerkUserId } = data;

  // Soft delete all user projects
  await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("clerk_user_id", clerkUserId);

  // Delete user preferences
  await supabase
    .from("user_preferences")
    .delete()
    .eq("clerk_user_id", clerkUserId);

  // Delete API keys
  await supabase
    .from("api_keys")
    .delete()
    .eq("clerk_user_id", clerkUserId);

  console.log(`Deleted data for user: ${clerkUserId}`);
}
