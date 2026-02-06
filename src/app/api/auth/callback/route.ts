// src/app/api/auth/callback/route.ts
// OIDC Callback API - Registers user in database
// UUID-Based Architecture: All operations use UUIDs
// Stores OIDC access token in HTTP-only cookie for Server Actions

import { NextRequest, NextResponse } from "next/server";
import { errors } from "@/lib/api-response";
import { findOrCreateUserByOidc, getCompanyByUuid } from "@/services/user.service";

// POST /api/auth/callback
// Body: { companyUuid, oidcSub, email, name?, accessToken }
// Creates or updates user in database after OIDC login
// Stores access token in HTTP-only cookie for Server Actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyUuid, oidcSub, email, name, accessToken } = body;

    // Validate required fields
    if (!companyUuid || !oidcSub || !email) {
      return errors.badRequest("Missing required fields: companyUuid, oidcSub, email");
    }

    // Get company
    const company = await getCompanyByUuid(companyUuid);
    if (!company) {
      return errors.notFound("Company not found");
    }

    if (!company.oidcEnabled) {
      return errors.badRequest("OIDC is not enabled for this company");
    }

    // Find or create user in database (UUID-based)
    const user = await findOrCreateUserByOidc({
      oidcSub,
      email,
      name,
      companyUuid: company.uuid,
    });

    // Create response with user info
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          uuid: user.uuid,
          email: user.email,
          name: user.name,
        },
        company: {
          uuid: company.uuid,
          name: company.name,
        },
      },
    });

    // Store access token in HTTP-only cookie for Server Actions
    if (accessToken) {
      response.cookies.set("oidc_access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 3600, // 1 hour (OIDC tokens typically expire in 1 hour)
      });
    }

    return response;
  } catch (error) {
    console.error("OIDC callback error:", error);
    return errors.internal("Failed to process OIDC callback");
  }
}
