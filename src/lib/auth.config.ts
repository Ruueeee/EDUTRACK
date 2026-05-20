import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

/**
 * Edge-safe NextAuth configuration.
 * This file must NOT import anything that requires Node.js runtime
 * (e.g., Prisma, bcrypt, mariadb driver).
 * It is used by middleware.ts which runs in Edge Runtime.
 */
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [], // Providers are added in the full auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const tokenWithRole = token as typeof token & { id?: string; role?: Role };
                tokenWithRole.id = user.id;
                tokenWithRole.role = (user as { role?: Role }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                const tokenWithRole = token as typeof token & { id?: string; role?: Role };
                session.user.id = tokenWithRole.id as string;
                session.user.role = tokenWithRole.role as Role;
            }
            return session;
        },
    },
};
