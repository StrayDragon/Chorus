// src/app/(dashboard)/projects/[uuid]/proposals/[proposalUuid]/page.tsx
// Server Component - UUID 从 URL 获取

import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerAuthContext } from "@/lib/auth-server";
import { getProposal } from "@/services/proposal.service";
import { projectExists } from "@/services/project.service";
import { ProposalActions } from "./proposal-actions";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending Review", color: "bg-[#FFF3E0] text-[#E65100]" },
  approved: { label: "Approved", color: "bg-[#E8F5E9] text-[#5A9E6F]" },
  rejected: { label: "Rejected", color: "bg-[#FFEBEE] text-[#D32F2F]" },
  revised: { label: "Revised", color: "bg-[#E3F2FD] text-[#1976D2]" },
};

const typeConfig: Record<string, { label: string; icon: string }> = {
  prd: { label: "PRD", icon: "📋" },
  tasks: { label: "Task Breakdown", icon: "📝" },
  doc_update: { label: "Document Update", icon: "📄" },
  tech_spec: { label: "Tech Spec", icon: "⚙️" },
};

interface PageProps {
  params: Promise<{ uuid: string; proposalUuid: string }>;
}

export default async function ProposalDetailPage({ params }: PageProps) {
  const auth = await getServerAuthContext();
  if (!auth) {
    redirect("/login");
  }

  const { uuid: projectUuid, proposalUuid } = await params;
  const t = await getTranslations();

  // 验证项目存在
  const exists = await projectExists(auth.companyUuid, projectUuid);
  if (!exists) {
    redirect("/projects");
  }

  // 获取 Proposal 详情
  const proposal = await getProposal(auth.companyUuid, proposalUuid);
  if (!proposal) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-[#6B6B6B]">{t("proposals.proposalNotFound")}</div>
        <Link href={`/projects/${projectUuid}/proposals`} className="mt-4 text-[#C67A52] hover:underline">
          {t("proposals.backToProposals")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href={`/projects/${projectUuid}/proposals`} className="text-[#6B6B6B] hover:text-[#2C2C2C]">
          {t("nav.proposals")}
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
        <span className="text-[#2C2C2C]">{proposal.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F2EC] text-2xl">
            {typeConfig[proposal.outputType]?.icon || "📋"}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <Badge className={statusConfig[proposal.status]?.color || ""}>
                {statusConfig[proposal.status]?.label || proposal.status}
              </Badge>
              <span className="text-sm text-[#6B6B6B]">
                {typeConfig[proposal.outputType]?.label || proposal.outputType}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#2C2C2C]">{proposal.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-[#6B6B6B]">
              <span>{t("common.created")} {new Date(proposal.createdAt).toLocaleDateString()}</span>
              {proposal.createdBy && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M12 8V4H8" />
                      <rect width="16" height="12" x="4" y="8" rx="2" />
                    </svg>
                    {proposal.createdBy.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <ProposalActions
          proposalUuid={proposalUuid}
          projectUuid={projectUuid}
          status={proposal.status}
        />
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="border-[#E5E0D8] p-6">
            <h2 className="mb-4 text-lg font-medium text-[#2C2C2C]">{t("common.content")}</h2>
            <div className="prose prose-sm max-w-none text-[#6B6B6B]">
              {proposal.outputData ? (
                <div className="whitespace-pre-wrap rounded-lg bg-[#F5F2EC] p-4 font-mono text-sm">
                  {typeof proposal.outputData === "string"
                    ? proposal.outputData
                    : JSON.stringify(proposal.outputData, null, 2)}
                </div>
              ) : (
                <p className="text-sm text-[#9A9A9A] italic">{t("common.noContent")}</p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <Card className="border-[#E5E0D8] p-4">
            <h3 className="mb-3 text-sm font-medium text-[#6B6B6B]">{t("common.details")}</h3>
            <dl className="space-y-2">
              <div className="flex justify-between text-sm">
                <dt className="text-[#9A9A9A]">{t("common.status")}</dt>
                <dd className="font-medium text-[#2C2C2C]">
                  {statusConfig[proposal.status]?.label || proposal.status}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#9A9A9A]">{t("common.type")}</dt>
                <dd className="font-medium text-[#2C2C2C]">
                  {typeConfig[proposal.outputType]?.label || proposal.outputType}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#9A9A9A]">{t("common.created")}</dt>
                <dd className="font-medium text-[#2C2C2C]">
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#9A9A9A]">{t("common.updated")}</dt>
                <dd className="font-medium text-[#2C2C2C]">
                  {new Date(proposal.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Actions */}
          {proposal.status === "pending" && (
            <Card className="border-[#C67A52] bg-[#FFFBF8] p-4">
              <div className="flex items-center gap-2 text-sm text-[#E65100]">
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {t("proposals.awaitingReview")}
              </div>
              <p className="mt-2 text-xs text-[#6B6B6B]">
                {t("proposals.reviewInstructions")}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
