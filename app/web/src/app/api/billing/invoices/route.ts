import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/current-user";
import { OrganizationRepository } from "db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ success: false, error: "Missing orgId parameter" }, { status: 400 });
    }

    // Verify organization exists
    const org = await OrganizationRepository.getOrganizationById(orgId);
    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    // Verify user is a member of this organization
    const members = await OrganizationRepository.getOrganizationMembers(orgId);
    const isMember = org.userId === user.id || members.some((m) => m.userId === user.id || m.email.toLowerCase() === user.email.toLowerCase());
    if (!isMember) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // Fetch invoices from Stripe if customerId exists
    if (org.customerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const stripeInvoices = await stripe.invoices.list({
          customer: org.customerId,
          limit: 24,
        });

        const invoices = stripeInvoices.data.map((inv) => ({
          id: inv.id,
          number: inv.number || `INV-${inv.id.substring(3, 11).toUpperCase()}`,
          date: new Date(inv.created * 1000).toISOString(),
          amount: (inv.amount_paid ?? inv.total ?? 0) / 100,
          currency: (inv.currency || "usd").toUpperCase(),
          status: (inv.status || "paid").toUpperCase(),
          pdfUrl: inv.invoice_pdf || null,
          hostedUrl: inv.hosted_invoice_url || null,
        }));

        return NextResponse.json({ success: true, invoices });
      } catch (stripeErr) {
        console.error("Failed to fetch Stripe invoices:", stripeErr);
        // Fall back to empty array instead of breaking the entire UI
        return NextResponse.json({ success: true, invoices: [] });
      }
    }

    // If using Paystack or Free plan without Stripe customer
    return NextResponse.json({ success: true, invoices: [] });
  } catch (error: any) {
    console.error("Invoices API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load invoices." },
      { status: 500 }
    );
  }
}
