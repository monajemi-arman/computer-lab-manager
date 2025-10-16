import { generateJwtPrivateKey } from "@/lib/token/generate-key";
import { LoginCredentials } from "@/types/user";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProviders from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProviders({
    name: 'Credentials',
    credentials: {
      username: { label: "Username", type: "text" },
      password: {  label: "Password", type: "password" }
    },
    async authorize(credentials: LoginCredentials | undefined) {
      if (!credentials) {
        return null
      }
      const res = await fetch("/api/login", {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { "Content-Type": "application/json" }
      })
      const user = await res.json()

      if (res.ok && user) {
        return user
      }
      return null
    }
  }),
  ],
  secret: generateJwtPrivateKey.key,
  pages: {
    signIn: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);