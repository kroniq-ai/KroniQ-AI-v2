import { NextResponse } from "next/server";
import { publicSiteUrlField } from "@/lib/waitlist/public-site-url";

/** Public, cacheable config for the client (canonical site URL for referral links). */
export async function GET() {
  return NextResponse.json(
    publicSiteUrlField(),
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
