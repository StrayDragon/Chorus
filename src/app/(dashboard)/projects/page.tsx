// Server Component - 数据在服务端获取，零客户端 JS
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getServerAuthContext } from "@/lib/auth-server";
import { listProjects } from "@/services/project.service";

export default async function ProjectsPage() {
  // 服务端认证
  const auth = await getServerAuthContext();
  if (!auth) {
    redirect("/login");
  }

  // 服务端获取翻译
  const t = await getTranslations();

  // 调用 Service 层获取数据
  const { projects } = await listProjects({
    companyUuid: auth.companyUuid,
    skip: 0,
    take: 100,
  });

  // 转换数据格式
  const projectList = projects.map((p) => ({
    uuid: p.uuid,
    name: p.name,
    description: p.description,
    counts: {
      ideas: p._count.ideas,
      tasks: p._count.tasks,
      documents: p._count.documents,
    },
  }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2C2C2C]">
            {t("projects.title")}
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            {t("projects.subtitle")}
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-[#C67A52] hover:bg-[#B56A42] text-white">
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("projects.newProject")}
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {projectList.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-[#E5E0D8]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F2EC]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-[#C67A52]"
            >
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              <line x1="12" y1="10" x2="12" y2="16" />
              <line x1="9" y1="13" x2="15" y2="13" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-[#2C2C2C]">
            {t("projects.noProjects")}
          </h3>
          <p className="mb-6 max-w-sm text-sm text-[#6B6B6B]">
            {t("projects.noProjectsDesc")}
          </p>
          <Link href="/projects/new">
            <Button className="bg-[#C67A52] hover:bg-[#B56A42] text-white">
              {t("projects.createFirst")}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project) => (
            <Link key={project.uuid} href={`/projects/${project.uuid}`}>
              <Card className="group cursor-pointer border-[#E5E0D8] p-5 transition-all hover:border-[#C67A52] hover:shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF3E0]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-[#C67A52]"
                    >
                      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-1 font-medium text-[#2C2C2C] group-hover:text-[#C67A52]">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-[#6B6B6B]">
                    {project.description}
                  </p>
                )}
                <div className="flex gap-4 text-xs text-[#9A9A9A]">
                  <span>
                    {project.counts.ideas} {t("projects.ideas")}
                  </span>
                  <span>
                    {project.counts.tasks} {t("projects.tasks")}
                  </span>
                  <span>
                    {project.counts.documents} {t("projects.docs")}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
