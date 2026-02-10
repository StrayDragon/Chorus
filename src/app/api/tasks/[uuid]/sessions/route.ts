// src/app/api/tasks/[uuid]/sessions/route.ts
// Task Sessions API - get active sessions for a task
// UUID-Based Architecture: All operations use UUIDs

import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/api-handler";
import { success, errors } from "@/lib/api-response";
import { getAuthContext, isUser } from "@/lib/auth";
import { getSessionsForTask } from "@/services/session.service";

type RouteContext = { params: Promise<{ uuid: string }> };

// GET /api/tasks/[uuid]/sessions - Get active sessions for a task
export const GET = withErrorHandler<{ uuid: string }>(
  async (request: NextRequest, context: RouteContext) => {
    const auth = await getAuthContext(request);
    if (!auth) {
      return errors.unauthorized();
    }

    if (!isUser(auth)) {
      return errors.forbidden("Only users can view task sessions");
    }

    const { uuid } = await context.params;
    const sessions = await getSessionsForTask(auth.companyUuid, uuid);

    return success(sessions);
  }
);
