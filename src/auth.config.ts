import type { NextAuthConfig } from "next-auth";

export default {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [],
  pages: { signIn: "/fr/login" },
} satisfies NextAuthConfig;
