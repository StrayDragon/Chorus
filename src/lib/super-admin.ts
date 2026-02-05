// src/lib/super-admin.ts
// Super Admin 认证工具

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { SuperAdminAuthContext } from "@/types/auth";

const COOKIE_NAME = "admin_session";
const TOKEN_EXPIRY = "24h";

// 获取 JWT 签名密钥
function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

// 检查邮箱是否是 Super Admin
export function isSuperAdminEmail(email: string): boolean {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) {
    return false;
  }
  return email.toLowerCase() === superAdminEmail.toLowerCase();
}

// 验证 Super Admin 密码
export async function verifySuperAdminPassword(
  password: string
): Promise<boolean> {
  const passwordHash = process.env.SUPER_ADMIN_PASSWORD_HASH;
  if (!passwordHash) {
    console.error("SUPER_ADMIN_PASSWORD_HASH is not set");
    return false;
  }
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

// 创建 Admin JWT Token
export async function createAdminToken(): Promise<string> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  if (!email) {
    throw new Error("SUPER_ADMIN_EMAIL is not set");
  }

  return new SignJWT({ type: "super_admin", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

// 验证 Admin JWT Token
export async function verifyAdminToken(
  token: string
): Promise<SuperAdminAuthContext | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type === "super_admin" && typeof payload.email === "string") {
      return {
        type: "super_admin",
        email: payload.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// 从请求中获取 Super Admin 认证上下文
export async function getSuperAdminFromRequest(
  request: NextRequest
): Promise<SuperAdminAuthContext | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyAdminToken(token);
}

// 设置 Admin Cookie
export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

// 清除 Admin Cookie
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

// 获取 Cookie 名称（用于客户端检查）
export function getAdminCookieName(): string {
  return COOKIE_NAME;
}
