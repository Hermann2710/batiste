import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertSiteAccess } from "@/lib/guards";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret)
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const body = (await request.json().catch(() => null)) as {
    siteId?: unknown;
  } | null;
  const siteId = typeof body?.siteId === "string" ? body.siteId : undefined;
  try {
    if (siteId) await assertSiteAccess(siteId);
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `batiste/${siteId ?? session.user.id}`;
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
