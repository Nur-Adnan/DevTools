import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Zod schema to validate the incoming Clerk user payload structure
const clerkUserSchema = z.object({
  id: z.string().min(1, "Clerk User ID is required"),
  email_addresses: z
    .array(
      z.object({
        email_address: z.string().email("Invalid email address format"),
      })
    )
    .min(1, "At least one email address is required"),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
});

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
    // Parse and validate the event payload with Zod
    const validationResult = clerkUserSchema.safeParse(evt.data);
    if (!validationResult.success) {
      console.error("Clerk Webhook payload schema validation error:", validationResult.error.flatten());
      return new Response("Error: Invalid Clerk webhook payload structure", {
        status: 400,
      });
    }

    const { id, email_addresses, first_name, last_name } = validationResult.data;
    const firstEmailObj = email_addresses[0];
    if (!firstEmailObj) {
      return new Response("Error: No email address provided", {
        status: 400,
      });
    }
    const email = firstEmailObj.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

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
