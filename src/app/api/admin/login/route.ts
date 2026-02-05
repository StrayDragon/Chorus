// src/app/api/admin/login/route.ts
// Super Admin 密码登录 API

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, parseBody } from "@/lib/api-handler";
import { errors } from "@/lib/api-response";
import {
  isSuperAdminEmail,
  verifySuperAdminPassword,
  createAdminToken,
  setAdminCookie,
} from "@/lib/super-admin";

interface LoginRequest {
  email: string;
  password: string;
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await parseBody<LoginRequest>(request);

  // 验证输入
  if (!body.email || typeof body.email !== "string") {
    return errors.validationError({ email: "Email is required" });
  }
  if (!body.password || typeof body.password !== "string") {
    return errors.validationError({ password: "Password is required" });
  }

  const email = body.email.trim().toLowerCase();

  // 验证是否是 Super Admin 邮箱
  if (!isSuperAdminEmail(email)) {
    return errors.unauthorized("Invalid credentials");
  }

  // 验证密码
  const isValid = await verifySuperAdminPassword(body.password);
  if (!isValid) {
    return errors.unauthorized("Invalid credentials");
  }

  // 创建 JWT Token
  const token = await createAdminToken();

  // 创建响应并设置 Cookie
  const response = NextResponse.json({
    success: true,
    data: {
      email,
      redirectTo: "/admin",
    },
  });

  setAdminCookie(response, token);

  return response;
});
