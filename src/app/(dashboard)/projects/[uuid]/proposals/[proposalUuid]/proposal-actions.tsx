"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { approveProposalAction, rejectProposalAction } from "./actions";

interface ProposalActionsProps {
  proposalUuid: string;
  projectUuid: string;
  status: string;
}

export function ProposalActions({ proposalUuid, status }: ProposalActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveProposalAction(proposalUuid);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    if (!confirm("Are you sure you want to reject this proposal?")) return;

    startTransition(async () => {
      const result = await rejectProposalAction(proposalUuid);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex gap-2">
      {status === "pending" && (
        <>
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isPending}
            className="border-[#D32F2F] text-[#D32F2F] hover:bg-[#FFEBEE]"
          >
            {t("common.reject")}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-[#5A9E6F] hover:bg-[#4A8E5F] text-white"
          >
            {isPending ? t("common.processing") : t("common.approve")}
          </Button>
        </>
      )}
      <Button
        variant="outline"
        className="border-[#E5E0D8] text-[#6B6B6B]"
        onClick={() => router.back()}
      >
        {t("common.back")}
      </Button>
    </div>
  );
}
