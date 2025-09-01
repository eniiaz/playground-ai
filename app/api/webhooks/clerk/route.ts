import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { UserSyncService } from "@/lib/user-sync";

// Clerk webhook events we want to handle
type ClerkWebhookEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      verification?: { status: string };
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
    created_at: number;
    updated_at: number;
    last_sign_in_at: number | null;
  };
};

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 500 }
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get body
  const payload = await req.text();

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkWebhookEvent;

  // Verify the payload
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Handle the webhook
  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await UserSyncService.syncUserProfile({
          id: evt.data.id,
          emailAddresses: evt.data.email_addresses.map(email => ({
            emailAddress: email.email_address,
            verification: email.verification,
          })),
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          imageUrl: evt.data.image_url,
          createdAt: evt.data.created_at,
          updatedAt: evt.data.updated_at,
          lastSignInAt: evt.data.last_sign_in_at,
        });
        console.log(`User ${evt.type}: ${evt.data.id}`);
        break;

      case "user.deleted":
        await UserSyncService.deleteUser(evt.data.id);
        console.log(`User deleted: ${evt.data.id}`);
        break;

      default:
        console.log(`Unhandled webhook event: ${evt.type}`);
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
