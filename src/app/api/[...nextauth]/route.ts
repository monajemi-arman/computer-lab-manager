import { LoginCredentials } from "@/types/user";
import NextAuth from "next-auth";
import CredentialsProviders from "next-auth/providers/credentials";

const authOptions = {
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
  })
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };