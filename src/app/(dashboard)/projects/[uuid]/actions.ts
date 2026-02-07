"use server";

import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";
import { getProject, deleteProject } from "@/services/project.service";

export async function deleteProjectAction(projectUuid: string) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }

  const project = await getProject(auth.companyUuid, projectUuid);
  if (!project) {
    return { success: false, error: "Project not found" };
  }

  try {
    await deleteProject(projectUuid);
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }

  redirect("/projects");
}
