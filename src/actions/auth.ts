"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { rateLimit } from "@/lib/utils";
import { normalizeLocale } from "@/i18n/messages";
import { auth, signIn as authSignIn, signOut as authSignOut } from "@/auth";
import { AuthError } from "next-auth";

export interface AuthState {
  error?:
    | "invalid_credentials"
    | "email_taken"
    | "rate_limited"
    | "validation"
    | "unknown";
}

export interface ProfileState {
  ok?: boolean;
  error?: "unauthorized" | "validation" | "unknown";
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = credentialsSchema.extend({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
});

const profileSchema = z.object({
  firstName: z.string().trim().max(100),
  lastName: z.string().trim().max(100),
  avatarUrl: z.string().trim().url().or(z.literal("")),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

async function clientKey(prefix: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${prefix}:${ip}`;
}

export async function signInAction(
  rawLocale: string,
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = normalizeLocale(rawLocale);

  if (!rateLimit(await clientKey("signin"), 8, 60_000))
    return { error: "rate_limited" };

  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? "")
      .toLowerCase()
      .trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: "validation" };

  try {
    await authSignIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: `/${locale}/dashboard`,
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "invalid_credentials" };
    throw error;
  }
  return {};
}

export async function signUpAction(
  rawLocale: string,
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = normalizeLocale(rawLocale);

  if (!rateLimit(await clientKey("signup"), 5, 60_000))
    return { error: "rate_limited" };

  const parsed = registerSchema.safeParse({
    email: String(formData.get("email") ?? "")
      .toLowerCase()
      .trim(),
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
      name:
        [parsed.data.firstName, parsed.data.lastName]
          .filter(Boolean)
          .join(" ") || null,
      firstName: parsed.data.firstName ?? null,
      lastName: parsed.data.lastName ?? null,
    })
    .returning();

  await authSignIn("credentials", {
    email: created.email,
    password: parsed.data.password,
    redirectTo: `/${locale}/onboarding`,
  });
  return {};
}

export async function signOutAction(rawLocale: string) {
  const locale = normalizeLocale(rawLocale);
  await authSignOut({ redirectTo: `/${locale}` });
}

export async function updateProfileAction(
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" };
  const parsed = profileSchema.safeParse({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
  });
  if (!parsed.success) return { error: "validation" };
  try {
    await db
      .update(users)
      .set({
        firstName: parsed.data.firstName || null,
        lastName: parsed.data.lastName || null,
        avatarUrl: parsed.data.avatarUrl || null,
        name:
          [parsed.data.firstName, parsed.data.lastName]
            .filter(Boolean)
            .join(" ") || null,
        image: parsed.data.avatarUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
    return { ok: true };
  } catch {
    return { error: "unknown" };
  }
}

export async function changePasswordAction(
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "unauthorized" };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
  });
  if (!parsed.success) return { error: "validation" };

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const user = rows[0];
  if (!user?.passwordHash) return { error: "unknown" };

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) return { error: "invalid_credentials" as ProfileState["error"] };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  try {
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));
    return { ok: true };
  } catch {
    return { error: "unknown" };
  }
}
