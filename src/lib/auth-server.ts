// src/lib/auth-server.ts
// Server-side auth utilities for Server Components and Server Actions
// Reads OIDC token from HTTP-only cookie

import { cookies } from "next/headers";
import { verifyOidcAccessToken } from "./oidc-auth";
import type { UserAuthContext } from "@/types/auth";

/**
 * Get auth context from HTTP-only cookie
 * Use this in Server Components and Server Actions
 */
export async function getServerAuthContext(): Promise<UserAuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("oidc_access_token")?.value;

  if (!token) {
    return null;
  }

  return verifyOidcAccessToken(token);
}
