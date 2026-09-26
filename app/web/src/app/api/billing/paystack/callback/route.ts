import { NextRequest, NextResponse } from "next/server";
import { OrganizationRepository } from "db";
import { logger } from "shared";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const orgId = searchParams.get("orgId");

  const appUrl = process.env.APP_URL || "https://backlify.space";

  if (!reference || !orgId) {
    return NextResponse.redirect(`${appUrl}/dashboard/org?error=missing_reference`);
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    logger.error("Missing PAYSTACK_SECRET_KEY in callback");
    return NextResponse.redirect(`${appUrl}/dashboard/org/${orgId}/settings?error=paystack_not_configured`);
  }

  try {
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status && verifyData.data.status === "success") {
      const data = verifyData.data;
      const targetOrgId = data.metadata?.orgId || orgId;
      const customerCode = data.customer?.customer_code;
      const subscriptionCode = data.subscription?.subscription_code || reference;

      // Renew 30 days from now
      const nextRenewal = new Date();
      nextRenewal.setDate(nextRenewal.getDate() + 30);

      await OrganizationRepository.updateSubscription(targetOrgId, {
        plan: "pro",
        billingProvider: "paystack",
        subscriptionId: subscriptionCode,
        customerId: customerCode || null,
        subscriptionStatus: "active",
        subscriptionEndsAt: nextRenewal,
      });

      logger.info({ orgId: targetOrgId, reference }, "Organization upgraded to Pro via Paystack verification");

      return NextResponse.redirect(`${appUrl}/dashboard/org/${targetOrgId}/settings?billing=success`);
    } else {
      logger.warn({ verifyData }, "Paystack transaction verification failed or pending");
      return NextResponse.redirect(`${appUrl}/dashboard/org/${orgId}/settings?billing=failed`);
    }
  } catch (error) {
    logger.error({ error, reference }, "Error verifying Paystack callback");
    return NextResponse.redirect(`${appUrl}/dashboard/org/${orgId}/settings?billing=error`);
  }
}
