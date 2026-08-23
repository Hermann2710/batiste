import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import authConfig from "@/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email.toLowerCase())).limit(1);
        if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email, image: user.avatarUrl };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      if (!user.email || !profile?.sub) return false;
      const email = user.email.toLowerCase();
      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing) {
        if (!existing.googleId) {
          await db.update(users).set({ googleId: profile.sub, avatarUrl: user.image ?? existing.avatarUrl, emailVerified: true }).where(eq(users.id, existing.id));
        }
        return true;
      }
      await db.insert(users).values({ email, googleId: profile.sub, firstName: profile.given_name ?? null, lastName: profile.family_name ?? null, avatarUrl: user.image ?? null, emailVerified: true });
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
});