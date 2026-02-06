"use server";

import { revalidatePath } from "next/cache";
import { getServerAuthContext } from "@/lib/auth-server";
import { claimIdea, getIdeaByUuid } from "@/services/idea.service";

export async function claimIdeaAction(ideaUuid: string) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 验证 idea 存在且属于该公司
    const idea = await getIdeaByUuid(auth.companyUuid, ideaUuid);
    if (!idea) {
      return { success: false, error: "Idea not found" };
    }

    // 只有 open 状态的 idea 可以被认领
    if (idea.status !== "open") {
      return { success: false, error: "Idea is not available for claiming" };
    }

    await claimIdea({
      ideaUuid,
      companyUuid: auth.companyUuid,
      assigneeType: auth.type,
      assigneeUuid: auth.actorUuid,
      assignedByUuid: auth.actorUuid,
    });

    revalidatePath(`/projects/${idea.projectUuid}/ideas/${ideaUuid}`);
    revalidatePath(`/projects/${idea.projectUuid}/ideas`);

    return { success: true };
  } catch (error) {
    console.error("Failed to claim idea:", error);
    return { success: false, error: "Failed to claim idea" };
  }
}
