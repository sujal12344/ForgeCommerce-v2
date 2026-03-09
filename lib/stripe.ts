import Stripe from "stripe";

// Lazy singleton – initialized on first use (runtime), not at import time (build).
// This prevents Next.js from throwing during `next build` when the env var
// isn't available in the Docker build stage.
let _stripe: Stripe | undefined;

function getInstance(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key)
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    return getInstance()[prop as keyof Stripe];
  },
});
