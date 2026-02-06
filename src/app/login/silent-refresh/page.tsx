"use client";

import { useEffect } from "react";
import { UserManager } from "oidc-client-ts";

// Silent refresh page for OIDC token renewal
// This page is loaded in a hidden iframe by oidc-client-ts
export default function SilentRefreshPage() {
  useEffect(() => {
    // Create a minimal UserManager just to handle the callback
    const userManager = new UserManager({
      authority: "", // Not needed for callback processing
      client_id: "", // Not needed for callback processing
      redirect_uri: "", // Not needed for callback processing
    });

    // Process the silent renew callback
    userManager.signinSilentCallback().catch((err) => {
      console.error("Silent refresh callback error:", err);
    });
  }, []);

  // Return empty - this page runs in a hidden iframe
  return null;
}
