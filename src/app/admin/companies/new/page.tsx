"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Key, Plus, ArrowLeft } from "lucide-react";

export default function NewCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    emailDomain: "",
    oidcIssuer: "",
    oidcClientId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          emailDomains: [formData.emailDomain.trim()],
          oidcIssuer: formData.oidcIssuer.trim(),
          oidcClientId: formData.oidcClientId.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Failed to create company");
        return;
      }

      router.push(`/admin/companies/${data.data.uuid}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-background px-8 py-6">
      {/* Back Link */}
      <div className="mb-6">
        <Link href="/admin/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
      </div>

      {/* Title Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Create Company
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a new company and configure OIDC authentication
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">
                Basic Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Acme Corporation"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailDomain">Email Domain</Label>
              <Input
                id="emailDomain"
                value={formData.emailDomain}
                onChange={(e) =>
                  setFormData({ ...formData, emailDomain: e.target.value })
                }
                placeholder="e.g., acme.com"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Users with this email domain will be routed to this company
              </p>
            </div>
          </CardContent>
        </Card>

        {/* OIDC Configuration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">
                  OIDC Configuration
                </CardTitle>
              </div>
              <Badge variant="destructive" className="text-[11px]">
                Required
              </Badge>
            </div>
            <CardDescription>
              Configure OpenID Connect (PKCE) for single sign-on authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oidcIssuer">OIDC Issuer URL</Label>
              <Input
                id="oidcIssuer"
                type="url"
                value={formData.oidcIssuer}
                onChange={(e) =>
                  setFormData({ ...formData, oidcIssuer: e.target.value })
                }
                placeholder="https://login.microsoftonline.com/tenant-id/v2.0"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                The OpenID Connect discovery endpoint URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oidcClientId">Client ID</Label>
              <Input
                id="oidcClientId"
                value={formData.oidcClientId}
                onChange={(e) =>
                  setFormData({ ...formData, oidcClientId: e.target.value })
                }
                placeholder="e.g., 12345678-abcd-efgh-ijkl-123456789012"
                required
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={
              loading ||
              !formData.name ||
              !formData.emailDomain ||
              !formData.oidcIssuer ||
              !formData.oidcClientId
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {loading ? "Creating..." : "Create Company"}
          </Button>
          <Link href="/admin/companies">
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
