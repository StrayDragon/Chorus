// src/services/user.service.ts
// User service for OIDC-authenticated users

import { prisma } from "@/lib/prisma";

// User creation/update input from OIDC
export interface OidcUserInput {
  oidcSub: string;
  email: string;
  name?: string;
  companyId: number;
}

// Find or create user by OIDC subject
export async function findOrCreateUserByOidc(input: OidcUserInput) {
  const { oidcSub, email, name, companyId } = input;

  // First try to find existing user by OIDC subject in this company
  let user = await prisma.user.findFirst({
    where: {
      oidcSub,
      companyId,
    },
    select: {
      id: true,
      uuid: true,
      email: true,
      name: true,
      oidcSub: true,
      companyId: true,
      company: {
        select: {
          uuid: true,
          name: true,
        },
      },
    },
  });

  if (user) {
    // Update user info if changed
    if (user.email !== email || user.name !== name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email, name },
        select: {
          id: true,
          uuid: true,
          email: true,
          name: true,
          oidcSub: true,
          companyId: true,
          company: {
            select: {
              uuid: true,
              name: true,
            },
          },
        },
      });
    }
    return user;
  }

  // Check if user exists by email (might have been pre-created)
  const existingByEmail = await prisma.user.findFirst({
    where: {
      email,
      companyId,
    },
  });

  if (existingByEmail) {
    // Link OIDC subject to existing user
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: { oidcSub, name },
      select: {
        id: true,
        uuid: true,
        email: true,
        name: true,
        oidcSub: true,
        companyId: true,
        company: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
    });
  }

  // Create new user
  return prisma.user.create({
    data: {
      email,
      name,
      oidcSub,
      companyId,
    },
    select: {
      id: true,
      uuid: true,
      email: true,
      name: true,
      oidcSub: true,
      companyId: true,
      company: {
        select: {
          uuid: true,
          name: true,
        },
      },
    },
  });
}

// Get user by ID with company info
export async function getUserById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      uuid: true,
      email: true,
      name: true,
      oidcSub: true,
      companyId: true,
      company: {
        select: {
          uuid: true,
          name: true,
          oidcIssuer: true,
          oidcClientId: true,
        },
      },
    },
  });
}

// Get user by UUID
export async function getUserByUuid(uuid: string) {
  return prisma.user.findFirst({
    where: { uuid },
    select: {
      id: true,
      uuid: true,
      email: true,
      name: true,
      oidcSub: true,
      companyId: true,
      company: {
        select: {
          uuid: true,
          name: true,
        },
      },
    },
  });
}

// Get company by UUID (for OIDC callback)
export async function getCompanyByUuid(uuid: string) {
  return prisma.company.findFirst({
    where: { uuid },
    select: {
      id: true,
      uuid: true,
      name: true,
      oidcIssuer: true,
      oidcClientId: true,
      oidcEnabled: true,
    },
  });
}
