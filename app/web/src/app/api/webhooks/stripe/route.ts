import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { OrganizationRepository } from "db";
import { logger } from "shared";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    logger.error("Missing Stripe API configuration for webhook");
    return NextResponse.json({ error: "Stripe webhook configuration missing" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      logger.error({ err }, "Stripe webhook signature verification failed");
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    logger.info({ eventType: event.type }, "Processing Stripe webhook event");

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;

        if (orgId) {
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

          await OrganizationRepository.updateSubscription(orgId, {
            plan: "pro",
            billingProvider: "stripe",
            subscriptionId: subscriptionId || null,
            customerId: customerId || null,
            subscriptionStatus: "active",
          });

          logger.info({ orgId, subscriptionId }, "Organization upgraded to Pro via Stripe Checkout");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.orgId;

        if (orgId) {
          const status = subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "canceled";
          const currentPeriodEnd = (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000)
            : null;

          await OrganizationRepository.updateSubscription(orgId, {
            plan: status === "active" ? "pro" : "free",
            billingProvider: "stripe",
            subscriptionStatus: status,
            subscriptionEndsAt: currentPeriodEnd,
          });

          logger.info({ orgId, status }, "Updated organization subscription via Stripe");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.orgId;

        if (orgId) {
          await OrganizationRepository.updateSubscription(orgId, {
            plan: "free",
            billingProvider: "stripe",
            subscriptionStatus: "canceled",
          });

          logger.info({ orgId }, "Organization downgraded to Free via Stripe subscription cancel");
        }
        break;
      }

      default:
        logger.info({ eventType: event.type }, "Unhandled Stripe event type");
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error({ error }, "Error handling Stripe webhook");
    return NextResponse.json({ error: error?.message || "Webhook processing error" }, { status: 500 });
  }
}
