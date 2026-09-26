import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/current-user";
import { OrganizationRepository } from "db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ success: false, error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey);
    const body = await req.json().catch(() => ({}));
    const { orgId } = body;

    if (!orgId) {
      return NextResponse.json({ success: false, error: "Missing orgId" }, { status: 400 });
    }

    const org = await OrganizationRepository.getOrganizationById(orgId);
    if (!org || !org.customerId) {
      return NextResponse.json(
        { success: false, error: "No active Stripe customer found for this organization." },
        { status: 400 }
      );
    }

    const appUrl = process.env.APP_URL || "https://backlify.space";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.customerId,
      return_url: `${appUrl}/dashboard/org/${orgId}/settings`,
    });

    return NextResponse.json({ success: true, url: portalSession.url });
  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create customer portal session." },
      { status: 500 }
    );
  }
}
