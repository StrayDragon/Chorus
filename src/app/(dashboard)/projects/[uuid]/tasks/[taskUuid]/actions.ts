"use server";

import { revalidatePath } from "next/cache";
import { getServerAuthContext } from "@/lib/auth-server";
import { claimTask, getTaskByUuid, updateTask } from "@/services/task.service";

export async function claimTaskAction(taskUuid: string) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 验证 task 存在且属于该公司
    const task = await getTaskByUuid(auth.companyUuid, taskUuid);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // 只有 open 状态的 task 可以被认领
    if (task.status !== "open") {
      return { success: false, error: "Task is not available for claiming" };
    }

    await claimTask({
      taskUuid,
      companyUuid: auth.companyUuid,
      assigneeType: auth.type,
      assigneeUuid: auth.actorUuid,
      assignedByUuid: auth.actorUuid,
    });

    revalidatePath(`/projects/${task.projectUuid}/tasks/${taskUuid}`);
    revalidatePath(`/projects/${task.projectUuid}/tasks`);

    return { success: true };
  } catch (error) {
    console.error("Failed to claim task:", error);
    return { success: false, error: "Failed to claim task" };
  }
}

export async function updateTaskStatusAction(taskUuid: string, newStatus: string) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 验证 task 存在且属于该公司
    const task = await getTaskByUuid(auth.companyUuid, taskUuid);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await updateTask(taskUuid, { status: newStatus });

    revalidatePath(`/projects/${task.projectUuid}/tasks/${taskUuid}`);
    revalidatePath(`/projects/${task.projectUuid}/tasks`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return { success: false, error: "Failed to update task status" };
  }
}
