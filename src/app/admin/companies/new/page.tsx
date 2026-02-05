"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emailDomains, setEmailDomains] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Parse email domains
      const domains = emailDomains
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          emailDomains: domains,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Failed to create company");
        return;
      }

      // 跳转到公司详情页
      router.push(`/admin/companies/${data.data.uuid}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold">New Company</h1>
          <p className="text-muted-foreground">Register a new organization</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            Enter the basic information for the new company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailDomains">Email Domains</Label>
              <Input
                id="emailDomains"
                value={emailDomains}
                onChange={(e) => setEmailDomains(e.target.value)}
                placeholder="acme.com, acme.org"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated list of email domains. Users with these email domains will be routed to this company&apos;s OIDC login.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Company"}
              </Button>
              <Link href="/admin/companies">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
