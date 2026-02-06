"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { claimTaskAction } from "./actions";

interface TaskActionsProps {
  taskUuid: string;
  projectUuid: string;
  status: string;
}

export function TaskActions({ taskUuid, status }: TaskActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClaim = () => {
    startTransition(async () => {
      const result = await claimTaskAction(taskUuid);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex gap-2">
      {status === "open" && (
        <Button
          onClick={handleClaim}
          disabled={isPending}
          className="bg-[#C67A52] hover:bg-[#B56A42] text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {isPending ? t("common.processing") : t("tasks.claimTask")}
        </Button>
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
