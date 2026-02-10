"use server";

import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";
import {
  getSessionsForTask,
  type TaskSessionInfo,
} from "@/services/session.service";

export async function getTaskSessionsAction(taskUuid: string): Promise<{
  success: boolean;
  data?: TaskSessionInfo[];
  error?: string;
}> {
  const auth = await getServerAuthContext();
  if (!auth) {
    redirect("/login");
  }

  try {
    const sessions = await getSessionsForTask(auth.companyUuid, taskUuid);
    return { success: true, data: sessions };
  } catch (error) {
    console.error("Failed to fetch task sessions:", error);
    return { success: false, error: "Failed to fetch task sessions" };
  }
}
