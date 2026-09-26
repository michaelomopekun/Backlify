import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { OrganizationRepository } from "db";
import { logger } from "shared";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    logger.error("Missing PAYSTACK_SECRET_KEY for webhook verification");
    return NextResponse.json({ error: "Paystack webhook unconfigured" }, { status: 500 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing x-paystack-signature header" }, { status: 400 });
    }

    const hash = crypto.createHmac("sha512", paystackSecretKey).update(rawBody).digest("hex");

    if (hash !== signature) {
      logger.error("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    logger.info({ event: event.event }, "Received Paystack webhook event");

    switch (event.event) {
      case "charge.success": {
        const data = event.data;
        const orgId = data.metadata?.orgId;

        if (orgId) {
          const nextRenewal = new Date();
          nextRenewal.setDate(nextRenewal.getDate() + 30);

          await OrganizationRepository.updateSubscription(orgId, {
            plan: "pro",
            billingProvider: "paystack",
            subscriptionId: data.subscription?.subscription_code || data.reference,
            customerId: data.customer?.customer_code || null,
            subscriptionStatus: "active",
            subscriptionEndsAt: nextRenewal,
          });

          logger.info({ orgId, reference: data.reference }, "Upgraded organization to Pro via Paystack webhook");
        }
        break;
      }

      case "subscription.disable":
      case "subscription.not_renew": {
        const data = event.data;
        const orgId = data.metadata?.orgId;

        if (orgId) {
          await OrganizationRepository.updateSubscription(orgId, {
            plan: "free",
            billingProvider: "paystack",
            subscriptionStatus: "canceled",
          });

          logger.info({ orgId }, "Downgraded organization via Paystack subscription disabled webhook");
        }
        break;
      }

      default:
        logger.info({ event: event.event }, "Unhandled Paystack event");
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error({ error }, "Error handling Paystack webhook");
    return NextResponse.json({ error: error?.message || "Webhook error" }, { status: 500 });
  }
}
