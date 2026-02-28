import { stripe } from "@/lib/stripe";
import prisma from "@/prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Missing Stripe-Signature header", { status: 400 });
  }

  const webhookSecret = process.env.WEBHOOK_SIGNING_SECRET;
  if (!webhookSecret) {
    return new NextResponse("Missing WEBHOOK_SIGNING_SECRET", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message =
      err instanceof Stripe.errors.StripeSignatureVerificationError
        ? err.message
        : "Unknown webhook error";
    return new NextResponse(`Webhook error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    const addressComponents = [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country,
    ];

    const addressJoin = addressComponents.filter(Boolean).join(", ");

    const orderId = session?.metadata?.orderId;
    if (!orderId) {
      return new NextResponse("Missing orderId in session metadata", {
        status: 400,
      });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: {
            id: orderId,
          },
          data: {
            name: session?.customer_details?.name ?? "",
            email: session?.customer_details?.email ?? "",
            isPaid: true,
            address: addressJoin,
            phone: session?.customer_details?.phone || "",
          },
          include: {
            orderItems: true,
          },
        });
        const productIds = order.orderItems
          .map((item) => item.productId)
          .filter((id): id is string => typeof id === "string");

        if (productIds.length === 0) {
          console.warn(
            "checkout.session.completed: no product IDs found for order",
            orderId,
          );
          return;
        }

        await tx.product.updateMany({
          where: {
            id: {
              in: productIds,
            },
          },
          data: {
            archived: true,
          },
        });
      });
    } catch (err) {
      console.error("Failed to process checkout.session.completed:", err);
      return new NextResponse("Order processing failed", { status: 500 });
    }
  }
  return NextResponse.json({}, { status: 200 });
}
