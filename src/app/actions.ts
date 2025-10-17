"use server"

import { signIn } from "@/auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { CredentialsSignin } from "next-auth"

export async function loginAction(state: any, formData: FormData) { // eslint-disable-line
  try {
    await signIn("credentials", formData)
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    
    if (error instanceof CredentialsSignin) {
      return { error: "Invalid username or password" }
    }
    
    return { error: "An error occurred during login" }
  }
}