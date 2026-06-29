import { NextRequest, NextResponse } from "next/server";
import { logEmailEvent } from "@/app/lib/email-funnel-actions";
import { isValidFunnelType, type EmailFunnelType } from "@/app/lib/email-funnel-types";

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  const sendId = req.nextUrl.searchParams.get("sid") || undefined;
  const typeParam = req.nextUrl.searchParams.get("t") || "welcome";
  const email = req.nextUrl.searchParams.get("e") || "";

  if (!target) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  let destination: URL;
  try {
    destination = new URL(target);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (sendId && email && isValidFunnelType(typeParam)) {
    const result = await logEmailEvent({
      sendId,
      emailType: typeParam as EmailFunnelType,
      eventType: "click",
      recipientEmail: email,
      linkUrl: destination.toString(),
    });
    if (!result.ok) {
      console.error("[track/click]", result.error);
    }
  }

  return NextResponse.redirect(destination);
}
