"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompanyDetail {
  uuid: string;
  name: string;
  emailDomains: string[];
  oidcIssuer: string | null;
  oidcClientId: string | null;
  oidcEnabled: boolean;
  userCount: number;
  agentCount: number;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [emailDomains, setEmailDomains] = useState("");
  const [oidcIssuer, setOidcIssuer] = useState("");
  const [oidcClientId, setOidcClientId] = useState("");
  const [oidcEnabled, setOidcEnabled] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [uuid]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${uuid}`);
      const data = await response.json();

      if (data.success) {
        const c = data.data;
        setCompany(c);
        setName(c.name);
        setEmailDomains(c.emailDomains.join(", "));
        setOidcIssuer(c.oidcIssuer || "");
        setOidcClientId(c.oidcClientId || "");
        setOidcEnabled(c.oidcEnabled);
      } else {
        setError(data.error?.message || "Company not found");
      }
    } catch {
      setError("Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Parse email domains
      const domains = emailDomains
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const response = await fetch(`/api/admin/companies/${uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          emailDomains: domains,
          oidcIssuer: oidcIssuer.trim() || null,
          oidcClientId: oidcClientId.trim() || null,
          oidcEnabled,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Failed to update company");
        return;
      }

      setSuccess("Company updated successfully");
      fetchCompany();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${company?.name}"? This action cannot be undone and will delete all associated data.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/companies/${uuid}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/companies");
      } else {
        const data = await response.json();
        setError(data.error?.message || "Failed to delete company");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/companies">
            <Button variant="ghost" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
        </div>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error || "Company not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/companies">
            <Button variant="ghost" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">
              Created {new Date(company.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          Delete Company
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.userCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.agentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.projectCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the company name and email domains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailDomains">Email Domains</Label>
              <Input
                id="emailDomains"
                value={emailDomains}
                onChange={(e) => setEmailDomains(e.target.value)}
                placeholder="acme.com, acme.org"
                disabled={saving}
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated list of email domains
              </p>
            </div>
          </CardContent>
        </Card>

        {/* OIDC Config */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>OIDC Configuration</CardTitle>
                <CardDescription>
                  Configure OpenID Connect for user authentication
                </CardDescription>
              </div>
              {oidcEnabled ? (
                <Badge variant="success">Enabled</Badge>
              ) : (
                <Badge variant="warning">Disabled</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="oidcEnabled"
                checked={oidcEnabled}
                onChange={(e) => setOidcEnabled(e.target.checked)}
                disabled={saving}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="oidcEnabled">Enable OIDC Authentication</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oidcIssuer">OIDC Issuer URL</Label>
              <Input
                id="oidcIssuer"
                value={oidcIssuer}
                onChange={(e) => setOidcIssuer(e.target.value)}
                placeholder="https://auth.example.com"
                disabled={saving || !oidcEnabled}
              />
              <p className="text-sm text-muted-foreground">
                The OIDC provider&apos;s issuer URL (e.g., Auth0, Okta, Google)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oidcClientId">Client ID</Label>
              <Input
                id="oidcClientId"
                value={oidcClientId}
                onChange={(e) => setOidcClientId(e.target.value)}
                placeholder="your-client-id"
                disabled={saving || !oidcEnabled}
              />
              <p className="text-sm text-muted-foreground">
                The OAuth 2.0 Client ID from your OIDC provider (PKCE mode, no secret needed)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900 dark:text-green-100">
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Link href="/admin/companies">
            <Button type="button" variant="outline" disabled={saving}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
