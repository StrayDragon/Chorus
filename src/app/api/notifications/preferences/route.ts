// src/app/api/notifications/preferences/route.ts
// Notifications API — Get and update notification preferences

import { NextRequest } from "next/server";
import { withErrorHandler, parseBody } from "@/lib/api-handler";
import { success, errors } from "@/lib/api-response";
import { getAuthContext, isUser } from "@/lib/auth";
import * as notificationService from "@/services/notification.service";
import type { NotificationPreferenceFields } from "@/services/notification.service";

// GET /api/notifications/preferences — Get preferences
export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await getAuthContext(request);
  if (!auth) {
    return errors.unauthorized();
  }

  const ownerType = isUser(auth) ? "user" : "agent";
  const ownerUuid = auth.actorUuid;

  const preferences = await notificationService.getPreferences(
    auth.companyUuid,
    ownerType,
    ownerUuid
  );

  return success(preferences);
});

// PUT /api/notifications/preferences — Update preferences
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const auth = await getAuthContext(request);
  if (!auth) {
    return errors.unauthorized();
  }

  const ownerType = isUser(auth) ? "user" : "agent";
  const ownerUuid = auth.actorUuid;

  const body = await parseBody<NotificationPreferenceFields>(request);

  const preferences = await notificationService.updatePreferences(
    auth.companyUuid,
    ownerType,
    ownerUuid,
    body
  );

  return success(preferences);
});
