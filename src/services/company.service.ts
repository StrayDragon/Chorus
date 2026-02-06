// src/services/company.service.ts
// Company 服务层 (Super Admin Operations)

import { prisma } from "@/lib/prisma";
import { CompanyCreateInput, CompanyUpdateInput } from "@/types/admin";

// ===== 分页参数 =====
export interface PaginationParams {
  skip: number;
  take: number;
}

// ===== 列表 =====
export async function listCompanies({ skip, take }: PaginationParams) {
  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        uuid: true,
        name: true,
        emailDomains: true,
        oidcEnabled: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            agents: true,
          },
        },
      },
    }),
    prisma.company.count(),
  ]);

  return { companies, total };
}

// ===== 获取详情 (by UUID) =====
export async function getCompanyByUuid(uuid: string) {
  return prisma.company.findFirst({
    where: { uuid },
    select: {
      id: true,
      uuid: true,
      name: true,
      emailDomains: true,
      oidcIssuer: true,
      oidcClientId: true,
      oidcEnabled: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          agents: true,
          projects: true,
        },
      },
    },
  });
}

// ===== 通过邮箱域名查找 Company =====
export async function getCompanyByEmailDomain(email: string) {
  // 提取邮箱域名
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    return null;
  }

  // 查找包含该域名的 Company
  return prisma.company.findFirst({
    where: {
      emailDomains: {
        has: domain,
      },
      oidcEnabled: true,
    },
    select: {
      uuid: true,
      name: true,
      oidcIssuer: true,
      oidcClientId: true,
    },
  });
}

// ===== 创建 =====
export async function createCompany(data: CompanyCreateInput) {
  // 处理邮箱域名（转小写）
  const emailDomains = (data.emailDomains || []).map((d) => d.toLowerCase());

  // 判断 OIDC 是否启用（需要 issuer 和 clientId）
  const oidcEnabled = !!(data.oidcIssuer && data.oidcClientId);

  return prisma.company.create({
    data: {
      name: data.name,
      emailDomains,
      oidcIssuer: data.oidcIssuer || null,
      oidcClientId: data.oidcClientId || null,
      oidcEnabled,
    },
    select: {
      uuid: true,
      name: true,
      emailDomains: true,
      oidcIssuer: true,
      oidcClientId: true,
      oidcEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// ===== 更新 =====
export async function updateCompany(id: number, data: CompanyUpdateInput) {
  // 处理邮箱域名（转小写）
  const updateData: CompanyUpdateInput = { ...data };
  if (data.emailDomains) {
    updateData.emailDomains = data.emailDomains.map((d) => d.toLowerCase());
  }

  return prisma.company.update({
    where: { id },
    data: updateData,
    select: {
      uuid: true,
      name: true,
      emailDomains: true,
      oidcIssuer: true,
      oidcClientId: true,
      oidcEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// ===== 删除 =====
export async function deleteCompany(id: number) {
  // 注意: 这会删除 Company 及其所有关联数据
  // 由于使用 relationMode = "prisma"，需要手动处理级联删除
  return prisma.$transaction(async (tx) => {
    // 获取 company 信息
    const company = await tx.company.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    // 删除关联数据（按依赖顺序）
    await tx.activity.deleteMany({ where: { companyId: id } });
    await tx.comment.deleteMany({ where: { companyId: id } });
    await tx.proposal.deleteMany({ where: { companyId: id } });
    await tx.task.deleteMany({ where: { companyId: id } });
    await tx.document.deleteMany({ where: { companyId: id } });
    await tx.idea.deleteMany({ where: { companyId: id } });
    await tx.project.deleteMany({ where: { companyId: id } });
    await tx.apiKey.deleteMany({ where: { companyId: id } });
    await tx.agent.deleteMany({ where: { companyId: id } });
    await tx.user.deleteMany({ where: { companyId: id } });

    // 最后删除 Company
    return tx.company.delete({ where: { id } });
  });
}

// ===== 统计 =====
export async function getCompanyStats() {
  const [totalCompanies, totalUsers, totalAgents] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.agent.count(),
  ]);

  return { totalCompanies, totalUsers, totalAgents };
}

// ===== 检查邮箱域名是否已被使用 =====
export async function isEmailDomainTaken(
  domain: string,
  excludeCompanyId?: number
) {
  const company = await prisma.company.findFirst({
    where: {
      emailDomains: {
        has: domain.toLowerCase(),
      },
      ...(excludeCompanyId ? { id: { not: excludeCompanyId } } : {}),
    },
    select: { id: true },
  });

  return !!company;
}
