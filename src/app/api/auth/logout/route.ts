// src/app/api/auth/logout/route.ts
// Clears HTTP-only cookie on logout

import { NextResponse } from "next/server";

// POST /api/auth/logout - Clear auth cookie
export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the OIDC access token cookie
  response.cookies.set("oidc_access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  return response;
}
