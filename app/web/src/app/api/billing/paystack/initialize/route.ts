import { NextRequest, NextResponse } from "next/server";
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

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { success: false, error: "Paystack is not configured. Missing PAYSTACK_SECRET_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { orgId } = body;

    if (!orgId) {
      return NextResponse.json({ success: false, error: "Organization ID is required." }, { status: 400 });
    }

    const org = await OrganizationRepository.getOrganizationById(orgId);
    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found." }, { status: 404 });
    }

    const members = await OrganizationRepository.getOrganizationMembers(orgId);
    const isMember = members.some((m) => m.userId === user.id || m.email === user.email);
    if (!isMember && org.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden: Not an organization member." }, { status: 403 });
    }

    const appUrl = process.env.APP_URL || "https://backlify.space";

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: BILLING_CONFIG.PAYSTACK.PRO_MONTHLY_PRICE_KOBO, // ₦2,000.00
        email: user.email,
        currency: BILLING_CONFIG.PAYSTACK.CURRENCY,
        metadata: {
          orgId,
          userId: user.id,
          plan: "pro",
          provider: "paystack",
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: "Backlify Pro (Monthly)",
            },
            {
              display_name: "Organization",
              variable_name: "org_name",
              value: org.name,
            },
          ],
        },
        callback_url: `${appUrl}/api/billing/paystack/callback?orgId=${orgId}`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { success: false, error: paystackData.message || "Failed to initialize Paystack transaction." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });
  } catch (error: any) {
    console.error("Paystack Initialize Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to initiate Paystack checkout." },
      { status: 500 }
    );
  }
}
