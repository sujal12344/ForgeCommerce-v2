import { stripe } from "@/lib/stripe";
import prisma from "@/prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL!, // || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json("Invalid JSON body", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { productIds } = body;

  const { storeId } = await params;
  if (
    !Array.isArray(productIds) ||
    productIds.length === 0 ||
    !productIds.every(id => typeof id === "string" && id.length > 0)
  ) {
    return NextResponse.json("Product id's needed", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const uniqueProductIds = [...new Set(productIds)];

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: uniqueProductIds,
      },
      storeId,
      archived: false,
    },
  });

  if (products.length !== uniqueProductIds.length) {
    return NextResponse.json("One or more products not found or unavailable", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Count occurrences of each productId to handle quantity
  const quantityMap = productIds.reduce(
    (acc: Record<string, number>, id: string) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    },
    {}
  );

  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach(product => {
    items.push({
      quantity: quantityMap[product.id],
      price_data: {
        currency: "USD",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price.toNumber() * 100,
      },
    });
  });

  if (!process.env.FRONTEND_URL) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500, headers: corsHeaders }
    );
  }

  const order = await prisma.order.create({
    data: {
      storeId,
      isPaid: false,
      orderItems: {
        create: uniqueProductIds.map((id: string) => ({
          quantity: quantityMap[id],
          price: products.find(p => p.id === id)!.price,
          product: { connect: { id } },
        })),
      },
      name: "",
      email: "", // Populated by webhook after payment
    },
  });

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      line_items: items,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      success_url: `${process.env.FRONTEND_URL}/cart?success=1`,
      cancel_url: `${process.env.FRONTEND_URL}/cart?cancel=1`,
      metadata: { orderId: order.id },
    });
  } catch (error) {
    await prisma.order.delete({ where: { id: order.id } });
    console.error("Stripe session creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json({ url: session.url }, { headers: corsHeaders });
}
