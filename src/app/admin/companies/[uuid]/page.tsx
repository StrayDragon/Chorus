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
import {
  Building2,
  Users,
  Bot,
  FolderKanban,
  ArrowLeft,
  Trash2,
  Key,
} from "lucide-react";

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

      // OIDC is enabled if both issuer and clientId are provided
      const oidcEnabled = !!(oidcIssuer.trim() && oidcClientId.trim());

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
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-full bg-background px-8 py-6">
        <div className="mb-6">
          <Link href="/admin/companies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Companies
            </Button>
          </Link>
        </div>
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error || "Company not found"}
        </div>
      </div>
    );
  }

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

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {company.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {new Date(company.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Company
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{company.userCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Agents
              </CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{company.agentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Projects
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{company.projectCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
              <p className="text-xs text-muted-foreground">
                Comma-separated list of email domains
              </p>
            </div>
          </CardContent>
        </Card>

        {/* OIDC Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">
                  OIDC Configuration
                </CardTitle>
              </div>
              {company.oidcEnabled ? (
                <Badge variant="success">Enabled</Badge>
              ) : (
                <Badge variant="warning">Not configured</Badge>
              )}
            </div>
            <CardDescription>
              Configure OpenID Connect (PKCE) for single sign-on authentication.
              OIDC will be enabled when both Issuer URL and Client ID are
              provided.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oidcIssuer">OIDC Issuer URL</Label>
              <Input
                id="oidcIssuer"
                type="url"
                value={oidcIssuer}
                onChange={(e) => setOidcIssuer(e.target.value)}
                placeholder="https://login.microsoftonline.com/tenant-id/v2.0"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                The OpenID Connect discovery endpoint URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oidcClientId">Client ID</Label>
              <Input
                id="oidcClientId"
                value={oidcClientId}
                onChange={(e) => setOidcClientId(e.target.value)}
                placeholder="e.g., 12345678-abcd-efgh-ijkl-123456789012"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                The OAuth 2.0 Client ID (PKCE mode, no secret needed)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center gap-3">
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
