import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "db";

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

    const user = await UserRepository.getUserByEmail(email);

    return NextResponse.json({
      success: true,
      exists: Boolean(user),
      hasPassword: Boolean(user?.passwordHash),
    });
  } catch (error) {
    console.error("Error checking email status:", error);
    return NextResponse.json(
      { success: false, exists: false, hasPassword: false },
      { status: 500 }
    );
  }
}
