import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "batiste-dev-secret-change-me";
const COOKIE_NAME = "batiste_session";

export interface Session {
  userId: string;
  email: string;
  expiresAt: number;
}

export async function createSession(userId: string, email: string): Promise<string> {
  const payload: Session = {
    userId,
    email,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 jours
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = jwt.verify(token, JWT_SECRET) as Session;
    if (session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return user[0] || null;
}

export function setSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
}
