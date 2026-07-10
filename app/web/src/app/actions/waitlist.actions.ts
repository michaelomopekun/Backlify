"use server";

import { Resend } from "resend";

export async function getWaitlistCount() {
  const apiKey = process.env.RESEND_API_KEY;
  const baseCount = 0;

  if (!apiKey) return baseCount;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.contacts.list();

    if (error || !data || !data.data) {
      return baseCount;
    }

    // Add the true count of Resend contacts to the base momentum count!
    return baseCount + data.data.length;
  } catch (e) {
    return baseCount;
  }
}

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email")?.toString();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { error: "Server configuration error: Resend is not configured." };
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { error: "Failed to join waitlist. Please try again later." };
    }

    return { success: true };
  } catch (e) {
    console.error("Failed to join waitlist:", e);
    return { error: "An unexpected error occurred." };
  }
}
