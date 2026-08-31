import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";

/**
 * Standalone sign-in only — email magic-link + Google, exactly the setup
 * this repo used before the Whop-embedded pivot (commit a84e4d4). The
 * Whop-embedded path (lib/whop/dashboard-auth.ts) never touches this;
 * it verifies Whop's own x-whop-user-token instead. "Database" session
 * strategy is required here, not a preference — the Resend (email)
 * provider needs an adapter to persist verification tokens.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM,
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
