// src/app/(dashboard)/projects/[uuid]/documents/[documentUuid]/page.tsx
// Server Component - UUID 从 URL 获取

import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerAuthContext } from "@/lib/auth-server";
import { getDocument } from "@/services/document.service";
import { projectExists } from "@/services/project.service";
import { DocumentActions } from "./document-actions";
import { DocumentContent } from "./document-content";

const docTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  prd: { label: "PRD", color: "bg-[#E3F2FD] text-[#1976D2]", icon: "📋" },
  spec: { label: "Spec", color: "bg-[#E8F5E9] text-[#5A9E6F]", icon: "📝" },
  design: { label: "Design", color: "bg-[#F3E5F5] text-[#7B1FA2]", icon: "🎨" },
  note: { label: "Note", color: "bg-[#FFF3E0] text-[#E65100]", icon: "📒" },
  other: { label: "Other", color: "bg-[#F5F5F5] text-[#6B6B6B]", icon: "📄" },
};

interface PageProps {
  params: Promise<{ uuid: string; documentUuid: string }>;
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const auth = await getServerAuthContext();
  if (!auth) {
    redirect("/login");
  }

  const { uuid: projectUuid, documentUuid } = await params;
  const t = await getTranslations();

  // 验证项目存在
  const exists = await projectExists(auth.companyUuid, projectUuid);
  if (!exists) {
    redirect("/projects");
  }

  // 获取 Document 详情
  const document = await getDocument(auth.companyUuid, documentUuid);
  if (!document) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-[#6B6B6B]">{t("documents.documentNotFound")}</div>
        <Link href={`/projects/${projectUuid}/documents`} className="mt-4 text-[#C67A52] hover:underline">
          {t("documents.backToDocuments")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href={`/projects/${projectUuid}/documents`} className="text-[#6B6B6B] hover:text-[#2C2C2C]">
          {t("nav.documents")}
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-[#9A9A9A]"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-[#2C2C2C]">{document.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F2EC] text-2xl">
            {docTypeConfig[document.type]?.icon || "📄"}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <Badge className={docTypeConfig[document.type]?.color || ""}>
                {docTypeConfig[document.type]?.label || document.type}
              </Badge>
              <span className="rounded bg-[#F5F2EC] px-2 py-0.5 text-xs font-medium text-[#6B6B6B]">
                v{document.version}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#2C2C2C]">{document.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-[#6B6B6B]">
              <span>{t("common.updated")} {new Date(document.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <DocumentActions
          documentUuid={documentUuid}
          projectUuid={projectUuid}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main Content */}
        <DocumentContent
          documentUuid={documentUuid}
          projectUuid={projectUuid}
          initialContent={document.content || ""}
        />

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Source Proposal */}
          {document.proposalUuid && (
            <Card className="border-[#E5E0D8] p-4">
              <h3 className="mb-3 text-sm font-medium text-[#6B6B6B]">{t("documents.sourceProposal")}</h3>
              <Link
                href={`/projects/${projectUuid}/proposals/${document.proposalUuid}`}
                className="flex items-center gap-2 text-sm text-[#C67A52] hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {t("documents.viewProposal")}
              </Link>
            </Card>
          )}

          {/* Details */}
          <Card className="border-[#E5E0D8] p-4">
            <h3 className="mb-3 text-sm font-medium text-[#6B6B6B]">{t("common.details")}</h3>
            <dl className="space-y-2">
              <div className="flex justify-between text-sm">
                <dt className="text-[#9A9A9A]">{t("common.type")}</dt>
                <dd className="font-medium text-[#2C2C2C]">
                  {docTypeConfig[document.type]?.label || document.type}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#9A9A9A]">{t("common.version")}</dt>
                <dd className="font-medium text-[#2C2C2C]">v{document.version}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#9A9A9A]">{t("common.created")}</dt>
                <dd className="font-medium text-[#2C2C2C]">
                  {new Date(document.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#9A9A9A]">{t("common.updated")}</dt>
                <dd className="font-medium text-[#2C2C2C]">
                  {new Date(document.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Version History */}
          <Card className="border-[#E5E0D8] p-4">
            <h3 className="mb-3 text-sm font-medium text-[#6B6B6B]">{t("documents.versionHistory")}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#2C2C2C]">v{document.version}</span>
                <span className="text-xs text-[#9A9A9A]">{t("status.current")}</span>
              </div>
              {document.version > 1 && (
                <p className="text-xs text-[#9A9A9A]">
                  {document.version - 1} {t("documents.previousVersions")}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
