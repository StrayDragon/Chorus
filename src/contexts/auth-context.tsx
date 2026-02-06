"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { UserManager } from "oidc-client-ts";
import {
  createUserManager,
  getStoredOidcConfig,
  extractUserInfo,
  type OidcConfig,
} from "@/lib/oidc";
import {
  storeAccessToken,
  clearAccessToken,
  getValidAccessToken,
  authFetch,
} from "@/lib/auth-client";

// User info from session
interface UserInfo {
  uuid: string;
  email: string;
  name?: string;
}

// Company info from session
interface CompanyInfo {
  uuid: string;
  name: string;
}

// Auth context state
interface AuthContextState {
  user: UserInfo | null;
  company: CompanyInfo | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | null>(null);

// Token refresh interval (check every 5 minutes)
const REFRESH_CHECK_INTERVAL = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userManager, setUserManager] = useState<UserManager | null>(null);

  // Fetch current session
  const fetchSession = useCallback(async () => {
    try {
      // Use authFetch to include Bearer token
      const response = await authFetch("/api/auth/session");
      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setCompany(data.data.company);

        // Check if OIDC tokens need refresh
        if (data.data.oidc?.needsRefresh && userManager) {
          await refreshOidcTokens();
        }

        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [userManager]);

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSession();
      setLoading(false);
    };

    init();
  }, []);

  // Set up OIDC UserManager for token refresh
  useEffect(() => {
    const oidcConfig = getStoredOidcConfig();
    if (oidcConfig) {
      const manager = createUserManager(oidcConfig);
      setUserManager(manager);

      // Set up automatic token refresh event handlers
      manager.events.addAccessTokenExpiring(() => {
        console.log("Access token expiring, refreshing...");
        refreshOidcTokens();
      });

      manager.events.addAccessTokenExpired(() => {
        console.log("Access token expired");
        handleSessionExpired();
      });

      manager.events.addSilentRenewError((err) => {
        console.error("Silent renew error:", err);
        handleSessionExpired();
      });

      return () => {
        manager.events.removeAccessTokenExpiring(() => {});
        manager.events.removeAccessTokenExpired(() => {});
        manager.events.removeSilentRenewError(() => {});
      };
    }
  }, []);

  // Periodic session refresh check
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchSession();
    }, REFRESH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user, fetchSession]);

  // Refresh OIDC tokens using silent renew
  const refreshOidcTokens = async () => {
    if (!userManager) return;

    try {
      const renewedUser = await userManager.signinSilent();
      if (renewedUser) {
        const userInfo = extractUserInfo(renewedUser);

        // Update backend session with new tokens
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oidcAccessToken: userInfo.accessToken,
            oidcRefreshToken: userInfo.refreshToken,
            oidcExpiresAt: userInfo.expiresAt,
          }),
        });

        const data = await response.json();

        // Store new access token
        if (data.success && data.data.accessToken) {
          storeAccessToken(data.data.accessToken);
        }
      }
    } catch (err) {
      console.error("Failed to refresh OIDC tokens:", err);
    }
  };

  // Handle session expired
  const handleSessionExpired = () => {
    setUser(null);
    setCompany(null);
    setError("Session expired. Please log in again.");
    router.push("/login");
  };

  // Logout
  const logout = async () => {
    try {
      // Clear backend session
      await fetch("/api/auth/session", { method: "DELETE" });

      // Clear local access token
      clearAccessToken();

      // Clear OIDC session if available
      if (userManager) {
        try {
          await userManager.signoutRedirect();
        } catch {
          // OIDC logout may fail if provider doesn't support it
        }
      }

      setUser(null);
      setCompany(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      // Clear token and redirect even on error
      clearAccessToken();
      router.push("/login");
    }
  };

  // Manual session refresh
  const refreshSession = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        loading,
        error,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook to require authentication
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push("/login");
    }
  }, [auth.loading, auth.user, router]);

  return auth;
}
