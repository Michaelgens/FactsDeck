import { NextRequest, NextResponse } from "next/server";
import { logEmailEvent } from "@/app/lib/email-funnel-actions";
import { isValidFunnelType, type EmailFunnelType } from "@/app/lib/email-funnel-types";

const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const sendId = req.nextUrl.searchParams.get("sid") || undefined;
  const typeParam = req.nextUrl.searchParams.get("t") || "welcome";
  const email = req.nextUrl.searchParams.get("e") || "";

  if (sendId && email && isValidFunnelType(typeParam)) {
    const result = await logEmailEvent({
      sendId,
      emailType: typeParam as EmailFunnelType,
      eventType: "open",
      recipientEmail: email,
    });
    if (!result.ok) {
      console.error("[track/open]", result.error);
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
