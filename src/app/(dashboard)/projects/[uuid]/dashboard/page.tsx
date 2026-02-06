// src/app/(dashboard)/projects/[uuid]/dashboard/page.tsx
// Server Component - 数据在服务端获取，UUID 从 URL 获取

import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerAuthContext } from "@/lib/auth-server";
import { getProjectStats, projectExists } from "@/services/project.service";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const auth = await getServerAuthContext();
  if (!auth) {
    redirect("/login");
  }

  const { uuid: projectUuid } = await params;
  const t = await getTranslations();

  // 验证项目存在
  const exists = await projectExists(auth.companyUuid, projectUuid);
  if (!exists) {
    redirect("/projects");
  }

  // 获取项目统计数据
  const stats = await getProjectStats(auth.companyUuid, projectUuid);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2C2C2C]">{t("dashboard.title")}</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={`/projects/${projectUuid}/ideas`}>
          <Card className="cursor-pointer border-[#E5E0D8] p-5 transition-all hover:border-[#C67A52] hover:shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF3E0]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#E65100]">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-[#2C2C2C]">{stats.ideas.total}</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">{t("nav.ideas")}</span>
              {stats.ideas.open > 0 && (
                <span className="rounded bg-[#FFF3E0] px-2 py-0.5 text-xs font-medium text-[#E65100]">
                  {stats.ideas.open} {t("status.open")}
                </span>
              )}
            </div>
          </Card>
        </Link>

        <Link href={`/projects/${projectUuid}/tasks`}>
          <Card className="cursor-pointer border-[#E5E0D8] p-5 transition-all hover:border-[#C67A52] hover:shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3F2FD]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#1976D2]">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-[#2C2C2C]">{stats.tasks.total}</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">{t("nav.tasks")}</span>
              {stats.tasks.inProgress > 0 && (
                <span className="rounded bg-[#E8F5E9] px-2 py-0.5 text-xs font-medium text-[#5A9E6F]">
                  {stats.tasks.inProgress} {t("status.active")}
                </span>
              )}
            </div>
          </Card>
        </Link>

        <Link href={`/projects/${projectUuid}/proposals`}>
          <Card className="cursor-pointer border-[#E5E0D8] p-5 transition-all hover:border-[#C67A52] hover:shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3E5F5]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#7B1FA2]">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-[#2C2C2C]">{stats.proposals.total}</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">{t("nav.proposals")}</span>
              {stats.proposals.pending > 0 && (
                <span className="rounded bg-[#FFF3E0] px-2 py-0.5 text-xs font-medium text-[#E65100]">
                  {stats.proposals.pending} {t("status.pending")}
                </span>
              )}
            </div>
          </Card>
        </Link>

        <Link href={`/projects/${projectUuid}/documents`}>
          <Card className="cursor-pointer border-[#E5E0D8] p-5 transition-all hover:border-[#C67A52] hover:shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5E9]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#5A9E6F]">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="text-2xl font-semibold text-[#2C2C2C]">{stats.documents.total}</div>
            <div className="text-sm text-[#6B6B6B]">{t("nav.documents")}</div>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#E5E0D8] p-6">
          <h2 className="mb-4 text-lg font-medium text-[#2C2C2C]">{t("dashboard.quickActions")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={`/projects/${projectUuid}/ideas`}>
              <Button variant="outline" className="w-full justify-start border-[#E5E0D8] text-[#6B6B6B] hover:border-[#C67A52] hover:text-[#C67A52]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t("dashboard.addNewIdea")}
              </Button>
            </Link>
            <Link href={`/projects/${projectUuid}/proposals`}>
              <Button variant="outline" className="w-full justify-start border-[#E5E0D8] text-[#6B6B6B] hover:border-[#C67A52] hover:text-[#C67A52]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {t("dashboard.reviewProposals")}
              </Button>
            </Link>
            <Link href={`/projects/${projectUuid}/tasks`}>
              <Button variant="outline" className="w-full justify-start border-[#E5E0D8] text-[#6B6B6B] hover:border-[#C67A52] hover:text-[#C67A52]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                {t("dashboard.viewTaskBoard")}
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start border-[#E5E0D8] text-[#6B6B6B] hover:border-[#C67A52] hover:text-[#C67A52]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                </svg>
                {t("dashboard.manageAgents")}
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="border-[#E5E0D8] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-[#2C2C2C]">{t("dashboard.recentActivity")}</h2>
            <Link href={`/projects/${projectUuid}/activity`} className="text-sm text-[#C67A52] hover:underline">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="flex h-32 items-center justify-center text-sm text-[#9A9A9A]">
            {t("dashboard.activityPlaceholder")}
          </div>
        </Card>
      </div>
    </div>
  );
}
