// src/app/api/admin/session/route.ts
// Super Admin 会话检查和登出 API

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/api-handler";
import { success, errors } from "@/lib/api-response";
import {
  getSuperAdminFromRequest,
  clearAdminCookie,
} from "@/lib/super-admin";

// GET /api/admin/session - 检查当前会话
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await getSuperAdminFromRequest(request);

  if (!auth) {
    return errors.unauthorized("Not authenticated");
  }

  return success({
    authenticated: true,
    email: auth.email,
  });
});

// DELETE /api/admin/session - 登出
export const DELETE = withErrorHandler(async () => {
  const response = NextResponse.json({
    success: true,
    data: {
      message: "Logged out successfully",
      redirectTo: "/login",
    },
  });

  clearAdminCookie(response);

  return response;
});
