import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Error: CLERK_WEBHOOK_SECRET is not configured", {
      status: 500,
    });
  }

  // Get SVIX headers for verification
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get raw request body for svix signature verification
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Invalid signature", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    if (!email) {
      return new Response("Error: No email address found for user", {
        status: 400,
      });
    }

    // Sync to user database
    await db.user.upsert({
      where: { id },
      update: {
        email,
        name,
      },
      create: {
        id,
        email,
        name,
      },
    });
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
