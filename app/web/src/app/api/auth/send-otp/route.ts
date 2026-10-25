import { NextRequest, NextResponse } from "next/server";
import { generateAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const result = await generateAndSendOtp(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, cooldownSeconds: result.cooldownSeconds },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
      cooldownSeconds: result.cooldownSeconds,
    });
  } catch (error: any) {
    console.error("Error in send-otp route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch verification code. Please try again." },
      { status: 500 }
    );
  }
}
