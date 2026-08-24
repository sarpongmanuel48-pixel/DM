import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";

/**
 * DM's own dashboard identity (4A: "Sign up — Google / email"). Apple is
 * deliberately not offered — it needs an active $99/yr Apple Developer
 * Program membership plus App Store review, not worth it for a pilot with
 * a handful of creators. Revisit if there's real demand.
 *
 * Entirely separate from the read-only "Connect Whop" OAuth flow in
 * lib/whop/oauth.ts, which happens as its own onboarding step afterward.
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
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
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    // Database session strategy doesn't attach `id` to session.user by
    // default — every route in this app depends on it being there.
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
