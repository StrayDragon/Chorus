"use server";

import { revalidatePath } from "next/cache";
import { getServerAuthContext } from "@/lib/auth-server";
import { approveProposal, rejectProposal, getProposalByUuid } from "@/services/proposal.service";

export async function approveProposalAction(proposalUuid: string) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 验证 proposal 存在且属于该公司
    const proposal = await getProposalByUuid(auth.companyUuid, proposalUuid);
    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    // 只有 pending 状态的 proposal 可以被审批
    if (proposal.status !== "pending") {
      return { success: false, error: "Proposal is not pending review" };
    }

    await approveProposal(proposalUuid, auth.companyUuid, auth.actorUuid);

    revalidatePath(`/projects/${proposal.projectUuid}/proposals/${proposalUuid}`);
    revalidatePath(`/projects/${proposal.projectUuid}/proposals`);

    return { success: true };
  } catch (error) {
    console.error("Failed to approve proposal:", error);
    return { success: false, error: "Failed to approve proposal" };
  }
}

export async function rejectProposalAction(proposalUuid: string, reviewNote?: string) {
  const auth = await getServerAuthContext();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 验证 proposal 存在且属于该公司
    const proposal = await getProposalByUuid(auth.companyUuid, proposalUuid);
    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    // 只有 pending 状态的 proposal 可以被拒绝
    if (proposal.status !== "pending") {
      return { success: false, error: "Proposal is not pending review" };
    }

    await rejectProposal(proposalUuid, auth.actorUuid, reviewNote || "");

    revalidatePath(`/projects/${proposal.projectUuid}/proposals/${proposalUuid}`);
    revalidatePath(`/projects/${proposal.projectUuid}/proposals`);

    return { success: true };
  } catch (error) {
    console.error("Failed to reject proposal:", error);
    return { success: false, error: "Failed to reject proposal" };
  }
}
