import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { openSession } from "@/actions/auth";
import { normalizeLocale } from "@/i18n/messages";

type GoogleProfile = { sub: string; email: string; given_name?: string; family_name?: string; picture?: string };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fallback = new URL("/fr/login?error=google_failed", url.origin);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const store = await cookies();
  const saved = store.get("batiste_google_state")?.value;
  store.delete("batiste_google_state");

  if (!code || !state || !saved || saved.split(":")[0] !== state) return NextResponse.redirect(fallback);
  const locale = normalizeLocale(saved.split(":")[1] ?? "fr");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  if (!clientId || !clientSecret) return NextResponse.redirect(new URL(`/${locale}/login?error=google_not_configured`, url.origin));

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResponse.ok) return NextResponse.redirect(fallback);
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) return NextResponse.redirect(fallback);

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!profileResponse.ok) return NextResponse.redirect(fallback);
    const profile = (await profileResponse.json()) as GoogleProfile;
    const existing = await db.select().from(users).where(eq(users.googleId, profile.sub)).limit(1);
    let user = existing[0];

    if (!user) {
      const byEmail = await db.select().from(users).where(eq(users.email, profile.email.toLowerCase())).limit(1);
      user = byEmail[0];
      if (user) {
        const [linked] = await db.update(users).set({ googleId: profile.sub, avatarUrl: profile.picture ?? user.avatarUrl, emailVerified: true }).where(eq(users.id, user.id)).returning();
        user = linked;
      } else {
        const [created] = await db.insert(users).values({
          email: profile.email.toLowerCase(),
          googleId: profile.sub,
          firstName: profile.given_name ?? null,
          lastName: profile.family_name ?? null,
          avatarUrl: profile.picture ?? null,
          emailVerified: true,
        }).returning();
        user = created;
      }
    }

    await openSession(user.id, user.email);
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, url.origin));
  } catch {
    return NextResponse.redirect(new URL(`/${locale}/login?error=google_failed`, url.origin));
  }
}