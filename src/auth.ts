import { generateJwtPrivateKey } from "@/lib/token/generate-key";
import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { checkAccessPath } from "./lib/routes";

const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: "username", type: "text" },
        password: { label: "password", type: "password" }
      },
      async authorize(credentials: Partial<Record<"username" | "password", unknown>>) {
        if (!credentials || !credentials.username || !credentials.password ||
          typeof credentials.username !== 'string' || typeof credentials.password !== 'string' ||
          credentials.username.length <= 0 || credentials.password.length <= 0
        ) {
          return null;
        }
        // Build an absolute URL for server-side fetch.
        const baseUrl =
          process.env.NEXTAUTH_URL ??
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
        const url = new URL("/api/login", baseUrl).toString();

        const res = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        });
        const user = JSON.parse(await res.json());

        if (res.ok && user) {
          return user;
        }
        return null;
      }
    }),
  ],
  secret: generateJwtPrivateKey.key,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user.role == 'admin';
      const hasAccessPath = checkAccessPath(nextUrl.pathname, isLoggedIn, isAdmin);
      if (!hasAccessPath) return false;
      return true;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    }
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);