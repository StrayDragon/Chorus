// src/lib/auth-client.ts
// Client-side auth utilities for managing access tokens

// Token storage key
const ACCESS_TOKEN_KEY = "chorus_access_token";
const TOKEN_EXPIRY_KEY = "chorus_token_expiry";

// Token refresh threshold (refresh when less than 2 minutes remaining)
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000;

// Store access token
export function storeAccessToken(token: string): void {
  if (typeof window === "undefined") return;

  // Decode JWT to get expiry (without verification - just for timing)
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiryMs = payload.exp * 1000;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryMs.toString());
  } catch {
    // If decode fails, still store but without expiry tracking
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

// Get access token
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Clear access token
export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

// Check if token needs refresh
export function tokenNeedsRefresh(): boolean {
  if (typeof window === "undefined") return false;

  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return true;

  const expiryMs = parseInt(expiryStr, 10);
  return Date.now() + REFRESH_THRESHOLD_MS > expiryMs;
}

// Check if token is expired
export function isTokenExpired(): boolean {
  if (typeof window === "undefined") return true;

  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryStr) return true;

  const expiryMs = parseInt(expiryStr, 10);
  return Date.now() > expiryMs;
}

// Refresh access token
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (data.success && data.data.accessToken) {
      storeAccessToken(data.data.accessToken);
      return data.data.accessToken;
    }

    return null;
  } catch {
    return null;
  }
}

// Get valid access token (refresh if needed)
export async function getValidAccessToken(): Promise<string | null> {
  const token = getAccessToken();

  if (!token || isTokenExpired()) {
    // Token missing or expired, try to refresh
    return refreshAccessToken();
  }

  if (tokenNeedsRefresh()) {
    // Token will expire soon, refresh in background
    refreshAccessToken().catch(() => {
      // Ignore background refresh errors
    });
  }

  return token;
}

// Create authenticated fetch wrapper
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidAccessToken();

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// Create fetch hook for SWR or React Query
export function createAuthFetcher() {
  return async (url: string) => {
    const response = await authFetch(url);
    if (!response.ok) {
      const error = new Error("Fetch failed");
      throw error;
    }
    return response.json();
  };
}
