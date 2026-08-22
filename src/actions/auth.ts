"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/session";
import { rateLimit } from "@/lib/utils";
import { normalizeLocale } from "@/i18n/messages";

export interface AuthState {
  error?: "invalid_credentials" | "email_taken" | "rate_limited" | "validation" | "unknown";
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = credentialsSchema.extend({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
});

async function clientKey(prefix: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${prefix}:${ip}`;
}

export async function openSession(userId: string, email: string) {
  const token = await createSession(userId, email);
  const store = await cookies();
  store.set("batiste_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function signInAction(
  rawLocale: string,
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const locale = normalizeLocale(rawLocale);

  if (!rateLimit(await clientKey("signin"), 8, 60_000)) return { error: "rate_limited" };

  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: "validation" };

  const rows = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const user = rows[0];
  if (!user) return { error: "invalid_credentials" };

  const valid = user.passwordHash
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;
  if (!valid) return { error: "invalid_credentials" };

  await openSession(user.id, user.email);
  redirect(`/${locale}/dashboard`);
}

export async function signUpAction(
  rawLocale: string,
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const locale = normalizeLocale(rawLocale);

  if (!rateLimit(await clientKey("signup"), 5, 60_000)) return { error: "rate_limited" };

  const parsed = registerSchema.safeParse({
    email: String(formData.get("email") ?? "").toLowerCase().trim(),
    password: String(formData.get("password") ?? ""),
    firstName: String(formData.get("firstName") ?? "").trim() || undefined,
    lastName: String(formData.get("lastName") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { error: "validation" };

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing.length) return { error: "email_taken" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const [created] = await db
    .insert(users)
    .values({
      email: parsed.data.email,
      passwordHash,
      firstName: parsed.data.firstName ?? null,
      lastName: parsed.data.lastName ?? null,
    })
    .returning();

  await openSession(created.id, created.email);
  redirect(`/${locale}/onboarding`);
}

export async function signOutAction(rawLocale: string) {
  const locale = normalizeLocale(rawLocale);
  const store = await cookies();
  store.delete("batiste_session");
  redirect(`/${locale}`);
}
