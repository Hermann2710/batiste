import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { normalizeLocale } from "@/i18n/messages";

const stateCookie = "batiste_google_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = normalizeLocale(url.searchParams.get("locale") ?? "fr");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!clientId) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=google_not_configured`, url.origin));
  }

  const state = randomBytes(32).toString("hex");
  const store = await cookies();
  store.set(stateCookie, `${state}:${locale}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", `${appUrl}/api/auth/google/callback`);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  return NextResponse.redirect(googleUrl);
}