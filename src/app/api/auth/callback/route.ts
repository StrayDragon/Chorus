// src/app/api/auth/callback/route.ts
// OIDC Callback API - Creates user session from OIDC tokens

import { NextRequest, NextResponse } from "next/server";
import { success, errors } from "@/lib/api-response";
import {
  createUserAccessToken,
  createUserRefreshToken,
  setUserSessionCookies,
  type UserSessionPayload,
} from "@/lib/user-session";
import { findOrCreateUserByOidc, getCompanyByUuid } from "@/services/user.service";

// POST /api/auth/callback
// Body: { companyUuid, oidcSub, email, name?, accessToken, refreshToken?, expiresAt? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyUuid, oidcSub, email, name, accessToken, refreshToken, expiresAt } = body;

    // Validate required fields
    if (!companyUuid || !oidcSub || !email || !accessToken) {
      return errors.badRequest("Missing required fields: companyUuid, oidcSub, email, accessToken");
    }

    // Get company
    const company = await getCompanyByUuid(companyUuid);
    if (!company) {
      return errors.notFound("Company not found");
    }

    if (!company.oidcEnabled) {
      return errors.badRequest("OIDC is not enabled for this company");
    }

    // Find or create user
    const user = await findOrCreateUserByOidc({
      oidcSub,
      email,
      name,
      companyId: company.id,
    });

    // Create session payload
    const sessionPayload: UserSessionPayload = {
      type: "user",
      userId: user.id,
      userUuid: user.uuid,
      companyId: user.companyId,
      companyUuid: company.uuid,
      email: user.email || email, // Use provided email as fallback
      name: user.name || undefined,
      oidcSub: user.oidcSub || oidcSub, // Use provided oidcSub as fallback
      oidcAccessToken: accessToken,
      oidcRefreshToken: refreshToken,
      oidcExpiresAt: expiresAt,
    };

    // Create tokens
    const [userAccessToken, userRefreshToken] = await Promise.all([
      createUserAccessToken(sessionPayload),
      createUserRefreshToken(sessionPayload),
    ]);

    // Build response with cookies and token
    const response = NextResponse.json(
      success({
        user: {
          uuid: user.uuid,
          email: user.email,
          name: user.name,
        },
        company: {
          uuid: company.uuid,
          name: company.name,
        },
        // Return access token for Bearer auth
        accessToken: userAccessToken,
      })
    );

    // Set session cookies
    setUserSessionCookies(response, userAccessToken, userRefreshToken);

    return response;
  } catch (error) {
    console.error("OIDC callback error:", error);
    return errors.internal("Failed to process OIDC callback");
  }
}
