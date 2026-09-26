import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/current-user";
import { OrganizationRepository } from "db";
import { BILLING_CONFIG } from "shared";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { success: false, error: "Stripe is not configured. Missing STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const body = await req.json().catch(() => ({}));
    const { orgId } = body;

    if (!orgId) {
      return NextResponse.json({ success: false, error: "Organization ID is required." }, { status: 400 });
    }

    const org = await OrganizationRepository.getOrganizationById(orgId);
    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found." }, { status: 404 });
    }

    // Verify user membership / permission
    const members = await OrganizationRepository.getOrganizationMembers(orgId);
    const isMember = members.some((m) => m.userId === user.id || m.email === user.email);
    if (!isMember && org.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden: Not an organization member." }, { status: 403 });
    }

    const appUrl = process.env.APP_URL || "https://backlify.space";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: BILLING_CONFIG.STRIPE.CURRENCY,
            unit_amount: BILLING_CONFIG.STRIPE.PRO_MONTHLY_PRICE_USD * 100, // $3.00 = 300 cents
            recurring: {
              interval: "month",
            },
            product_data: {
              name: "Backlify Pro Plan",
              description: "50 GB Cloud Storage, Hourly Backups, Automated DR Drills & Custom Webhooks.",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orgId,
        userId: user.id,
        plan: "pro",
        provider: "stripe",
      },
      subscription_data: {
        metadata: {
          orgId,
          userId: user.id,
          plan: "pro",
        },
      },
      success_url: `${appUrl}/dashboard/org/${orgId}/settings?billing=success`,
      cancel_url: `${appUrl}/dashboard/org/${orgId}/settings?billing=canceled`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create Stripe checkout session." },
      { status: 500 }
    );
  }
}
