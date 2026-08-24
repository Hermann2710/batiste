import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import authConfig from "@/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
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
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1);
        if (
          !user?.passwordHash ||
          !(await bcrypt.compare(parsed.data.password, user.passwordHash))
        )
          return null;
        return {
          id: user.id,
          email: user.email,
          name:
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      if (!user.id || !user.email || !profile?.sub) return false;
      await db
        .update(users)
        .set({
          name: user.name,
          image: user.image,
          firstName: profile.given_name ?? null,
          lastName: profile.family_name ?? null,
          avatarUrl: user.image ?? null,
          emailVerified: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId)
        session.user.id = token.userId as string;
      return session;
    },
  },
});
