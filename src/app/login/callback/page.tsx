"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserManager,
  getStoredOidcConfig,
  clearOidcConfig,
  extractUserInfo,
} from "@/lib/oidc";
import { storeAccessToken } from "@/lib/auth-client";

export default function OidcCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Processing login...");

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get stored OIDC config
      const oidcConfig = getStoredOidcConfig();
      if (!oidcConfig) {
        setError("Session expired. Please start login again.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      setStatus("Completing authentication...");

      // Create UserManager with same config
      const userManager = createUserManager(oidcConfig);

      // Complete the signin process
      const user = await userManager.signinRedirectCallback();

      if (!user) {
        throw new Error("No user returned from OIDC provider");
      }

      setStatus("Creating session...");

      // Extract user info from OIDC response
      const userInfo = extractUserInfo(user);

      // Send to backend to create session
      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyUuid: oidcConfig.companyUuid,
          oidcSub: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          accessToken: userInfo.accessToken,
          refreshToken: userInfo.refreshToken,
          expiresAt: userInfo.expiresAt,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to create session");
      }

      // Store access token for Bearer auth
      if (data.data.accessToken) {
        storeAccessToken(data.data.accessToken);
      }

      // Clear stored config
      clearOidcConfig();

      setStatus("Login successful! Redirecting...");

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      console.error("OIDC callback error:", err);
      setError(
        err instanceof Error ? err.message : "Authentication failed"
      );
      clearOidcConfig();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] p-4">
      <div className="w-full max-w-[400px] rounded-xl border border-[#E5E2DC] bg-white p-10">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-12 w-12 text-[#171717]"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <h1 className="text-[28px] font-semibold text-[#171717]">Chorus</h1>
        </div>

        {/* Status */}
        {error ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
              {error}
            </div>
            <button
              onClick={() => router.push("/login")}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-[#171717] text-sm font-medium text-white transition-colors hover:bg-[#2C2C2C]"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              {/* Spinner */}
              <svg
                className="h-5 w-5 animate-spin text-[#171717]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm text-[#737373]">{status}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
