// src/app/api/auth/session/route.ts
// User session API - Get current session and logout

import { NextRequest, NextResponse } from "next/server";
import { success, errors } from "@/lib/api-response";
import {
  getUserSessionFromRequest,
  getFullSessionFromRequest,
  clearUserSessionCookies,
} from "@/lib/user-session";
import { getUserById } from "@/services/user.service";

// GET /api/auth/session - Get current user session
export async function GET(request: NextRequest) {
  const session = await getUserSessionFromRequest(request);

  if (!session) {
    return errors.unauthorized("No active session");
  }

  // Get fresh user data from database
  const user = await getUserById(session.actorId);
  if (!user) {
    const response = NextResponse.json(errors.unauthorized("User not found"));
    clearUserSessionCookies(response);
    return response;
  }

  // Get OIDC token expiry info
  const fullSession = await getFullSessionFromRequest(request);
  const oidcExpiresAt = fullSession?.oidcExpiresAt;

  return NextResponse.json(
    success({
      user: {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
      },
      company: {
        uuid: user.company.uuid,
        name: user.company.name,
      },
      oidc: {
        expiresAt: oidcExpiresAt,
        needsRefresh: oidcExpiresAt ? Date.now() / 1000 > oidcExpiresAt - 60 : false,
      },
    })
  );
}

// DELETE /api/auth/session - Logout
export async function DELETE() {
  const response = NextResponse.json(success({ message: "Logged out" }));
  clearUserSessionCookies(response);
  return response;
}
