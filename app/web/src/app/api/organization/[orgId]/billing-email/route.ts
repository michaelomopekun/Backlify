import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/current-user";
import { OrganizationRepository } from "db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await params;
    const body = await req.json().catch(() => ({}));
    const { billingEmail } = body;

    if (!billingEmail || typeof billingEmail !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = billingEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address format." },
        { status: 400 }
      );
    }

    const org = await OrganizationRepository.getOrganizationById(orgId);
    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    // Verify user is an owner or admin of this organization
    const members = await OrganizationRepository.getOrganizationMembers(orgId);
    const userMember = members.find(
      (m) => m.userId === user.id || m.email.toLowerCase() === user.email.toLowerCase()
    );
    const isOwnerOrAdmin = org.userId === user.id || userMember?.role === "owner" || userMember?.role === "admin";
    if (!isOwnerOrAdmin) {
      return NextResponse.json(
        { success: false, error: "Only organization owners and admins can update billing details." },
        { status: 403 }
      );
    }

    // Update organization billing email in database
    await OrganizationRepository.updateOrganization(orgId, {
      billingEmail: trimmedEmail,
    });

    // Optionally sync with Stripe Customer
    if (org.customerId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.customers.update(org.customerId, {
          email: trimmedEmail,
        });
      } catch (stripeErr) {
        console.warn("Could not sync billing email to Stripe customer:", stripeErr);
      }
    }

    return NextResponse.json({
      success: true,
      billingEmail: trimmedEmail,
      message: "Billing email updated successfully.",
    });
  } catch (error: any) {
    console.error("Update billing email error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update billing email." },
      { status: 500 }
    );
  }
}
