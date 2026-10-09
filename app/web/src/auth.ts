import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { UserRepository } from "db";
import { authConfig } from "./auth.config";
import { verifyOtp } from "@/lib/otp";
import { verifyPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "backlify-production-secret-token-key-32chars-min",
  trustHost: true,
session: {
  strategy: "jwt",
  maxAge: 30 * 60, // 30 minutes (in seconds)
  updateAge: 15 * 60, // token is refreshed/extended (every 15 mins)
},
jwt: {
  maxAge: 30 * 60, // 30 minutes
},

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "credentials",
      name: "Work Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || typeof credentials.email !== "string") {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
          return null;
        }

        // 1. Verification via OTP code (Vercel style 6-digit code)
        if (credentials.code && typeof credentials.code === "string") {
          const otpResult = await verifyOtp(normalizedEmail, credentials.code);
          if (!otpResult.success) {
            throw new Error(otpResult.error || "Invalid verification code");
          }

          const user = await UserRepository.findOrCreateUser({
            email: normalizedEmail,
            name: normalizedEmail.split("@")[0],
            emailVerified: new Date(),
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        // 2. Verification via Password
        if (credentials.password && typeof credentials.password === "string") {
          const user = await UserRepository.getUserByEmail(normalizedEmail);
          if (!user || !user.passwordHash) {
            throw new Error("No password set for this account. Please use code or Google/GitHub.");
          }

          const isValid = verifyPassword(credentials.password, user.passwordHash);
          if (!isValid) {
            throw new Error("Incorrect password. Please try again.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // Sync/verify user in PostgreSQL and auto-provision initial org
        const dbUser = await UserRepository.findOrCreateUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });

        // Mutate user object with the canonical database ID
        user.id = dbUser.id;
        return true;
      } catch (err) {
        console.error("Error syncing user during signIn callback:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || session.user.id;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
