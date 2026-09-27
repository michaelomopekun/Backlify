import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { UserRepository } from "db";

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    const trimmedName = name.trim().slice(0, 100);
    const updated = await UserRepository.updateUser(user.id, { name: trimmedName });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("Failed to update profile:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
