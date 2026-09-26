import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const clientTz = url.searchParams.get("tz") || req.headers.get("x-timezone") || "";

  const headerCountry =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry");

  // Fallback to timezone heuristics (e.g. Africa/Lagos) if deployed without geo-headers or on localhost
  let country = headerCountry;
  if (!country) {
    if (clientTz.toLowerCase().includes("lagos")) {
      country = "NG";
    } else {
      country = "US";
    }
  }

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
