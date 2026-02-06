"use server";

import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";
import { createProject } from "@/services/project.service";
import { createIdea } from "@/services/idea.service";

interface CreateProjectInput {
  name: string;
  description: string;
  ideas: string[];
}

export async function createProjectAction(input: CreateProjectInput) {
  const auth = await getServerAuthContext();
  if (!auth) {
    redirect("/login");
  }

  try {
    // Create project
    const project = await createProject({
      companyUuid: auth.companyUuid,
      name: input.name,
      description: input.description,
    });

    // Create ideas if any
    const validIdeas = input.ideas.filter((idea) => idea.trim());
    for (const ideaContent of validIdeas) {
      await createIdea({
        companyUuid: auth.companyUuid,
        projectUuid: project.uuid,
        title: ideaContent.slice(0, 100),
        content: ideaContent,
        createdByUuid: auth.actorUuid,
      });
    }

    return { success: true, projectUuid: project.uuid };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}
