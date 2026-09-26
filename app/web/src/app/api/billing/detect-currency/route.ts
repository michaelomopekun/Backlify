import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "US";

  const isNigeria = country.toUpperCase() === "NG";

  return NextResponse.json({
    country: country.toUpperCase(),
    currency: isNigeria ? "NGN" : "USD",
    gateway: isNigeria ? "paystack" : "stripe",
    price: isNigeria ? 2000 : 3,
    symbol: isNigeria ? "₦" : "$",
    formattedPrice: isNigeria ? "₦2,000 / month" : "$3 / month",
  });
}
