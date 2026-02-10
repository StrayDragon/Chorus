"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, ListTodo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Streamdown } from "streamdown";
import {
  addDocumentDraftAction,
  addTaskDraftAction,
  updateDocumentDraftAction,
  updateTaskDraftAction,
  removeDocumentDraftAction,
  removeTaskDraftAction,
} from "./actions";

interface DocumentDraft {
  uuid: string;
  type: string;
  title: string;
  content: string;
}

interface TaskDraft {
  uuid: string;
  title: string;
  description?: string;
  storyPoints?: number;
  priority?: string;
  acceptanceCriteria?: string;
}

interface ProposalEditorProps {
  proposalUuid: string;
  projectUuid: string;
  status: string;
  documentDrafts: DocumentDraft[] | null;
  taskDrafts: TaskDraft[] | null;
}

export function ProposalEditor({
  proposalUuid,
  status,
  documentDrafts,
  taskDrafts,
}: ProposalEditorProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Document draft dialog state
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentDraft | null>(null);
  const [docType, setDocType] = useState("prd");
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");

  // Task draft dialog state
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDraft | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskStoryPoints, setTaskStoryPoints] = useState("");
  const [taskAcceptanceCriteria, setTaskAcceptanceCriteria] = useState("");

  const [error, setError] = useState<string | null>(null);

  // Only allow editing for draft proposals
  const canEdit = status === "draft";

  // Document draft handlers
  const openAddDocDialog = () => {
    setEditingDoc(null);
    setDocType("prd");
    setDocTitle("");
    setDocContent("");
    setShowDocDialog(true);
  };

  const openEditDocDialog = (doc: DocumentDraft) => {
    setEditingDoc(doc);
    setDocType(doc.type);
    setDocTitle(doc.title);
    setDocContent(doc.content);
    setShowDocDialog(true);
  };

  const handleSaveDoc = () => {
    if (!docTitle.trim()) {
      setError(t("proposals.titleRequired"));
      return;
    }

    setError(null);
    startTransition(async () => {
      let result;
      if (editingDoc) {
        result = await updateDocumentDraftAction(proposalUuid, editingDoc.uuid, {
          type: docType,
          title: docTitle.trim(),
          content: docContent,
        });
      } else {
        result = await addDocumentDraftAction(proposalUuid, {
          type: docType,
          title: docTitle.trim(),
          content: docContent,
        });
      }

      if (result.success) {
        setShowDocDialog(false);
        router.refresh();
      } else {
        setError(result.error || t("proposals.failedToSaveDocDraft"));
      }
    });
  };

  const handleDeleteDoc = (doc: DocumentDraft) => {
    if (!confirm(t("common.confirmDelete"))) return;

    startTransition(async () => {
      const result = await removeDocumentDraftAction(proposalUuid, doc.uuid);
      if (result.success) {
        router.refresh();
      }
    });
  };

  // Task draft handlers
  const openAddTaskDialog = () => {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskStoryPoints("");
    setTaskAcceptanceCriteria("");
    setShowTaskDialog(true);
  };

  const openEditTaskDialog = (task: TaskDraft) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskPriority(task.priority || "medium");
    setTaskStoryPoints(task.storyPoints?.toString() || "");
    setTaskAcceptanceCriteria(task.acceptanceCriteria || "");
    setShowTaskDialog(true);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) {
      setError(t("proposals.titleRequired"));
      return;
    }

    setError(null);
    startTransition(async () => {
      const taskData = {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
        storyPoints: taskStoryPoints ? parseFloat(taskStoryPoints) : undefined,
        acceptanceCriteria: taskAcceptanceCriteria.trim() || undefined,
      };

      let result;
      if (editingTask) {
        result = await updateTaskDraftAction(proposalUuid, editingTask.uuid, taskData);
      } else {
        result = await addTaskDraftAction(proposalUuid, taskData);
      }

      if (result.success) {
        setShowTaskDialog(false);
        router.refresh();
      } else {
        setError(result.error || t("proposals.failedToSaveTaskDraft"));
      }
    });
  };

  const handleDeleteTask = (task: TaskDraft) => {
    if (!confirm(t("common.confirmDelete"))) return;

    startTransition(async () => {
      const result = await removeTaskDraftAction(proposalUuid, task.uuid);
      if (result.success) {
        router.refresh();
      }
    });
  };

  const hasDocuments = documentDrafts && documentDrafts.length > 0;
  const hasTasks = taskDrafts && taskDrafts.length > 0;

  return (
    <>
      {/* Document Drafts Section */}
      <Card className="border-[#E5E0D8] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-medium text-[#2C2C2C]">
            <FileText className="h-5 w-5 text-[#C67A52]" />
            {t("proposals.documentDrafts")} ({documentDrafts?.length || 0})
          </h2>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={openAddDocDialog}
              className="border-[#C67A52] text-[#C67A52] hover:bg-[#FFFBF8]"
            >
              + {t("proposals.addDocumentDraft")}
            </Button>
          )}
        </div>
        {hasDocuments ? (
          <div className="space-y-4">
            {documentDrafts.map((doc) => (
              <div key={doc.uuid} className="rounded-lg border border-[#E5E0D8] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {t(`proposals.docType${doc.type === "prd" ? "Prd" : doc.type === "tech_design" ? "TechDesign" : doc.type === "adr" ? "Adr" : doc.type === "spec" ? "Spec" : "Guide"}`)}
                    </Badge>
                    <span className="font-medium text-[#2C2C2C]">{doc.title}</span>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDocDialog(doc)}
                        className="h-7 text-xs text-[#6B6B6B] hover:text-[#2C2C2C]"
                      >
                        {t("proposals.editDraft")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDoc(doc)}
                        disabled={isPending}
                        className="h-7 text-xs text-[#D32F2F] hover:bg-[#FFEBEE] hover:text-[#D32F2F]"
                      >
                        {t("proposals.deleteDraft")}
                      </Button>
                    </div>
                  )}
                </div>
                {doc.content && (
                  <div className="prose prose-sm max-w-none rounded-lg bg-[#F5F2EC] p-4 text-[#6B6B6B]">
                    <Streamdown>{doc.content}</Streamdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#9A9A9A]">{t("proposals.emptyContainer")}</p>
        )}
      </Card>

      {/* Task Drafts Section */}
      <Card className="border-[#E5E0D8] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-medium text-[#2C2C2C]">
            <ListTodo className="h-5 w-5 text-[#C67A52]" />
            {t("proposals.taskDrafts")} ({taskDrafts?.length || 0})
          </h2>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={openAddTaskDialog}
              className="border-[#C67A52] text-[#C67A52] hover:bg-[#FFFBF8]"
            >
              + {t("proposals.addTaskDraft")}
            </Button>
          )}
        </div>
        {hasTasks ? (
          <div className="space-y-3">
            {taskDrafts.map((task) => (
              <div key={task.uuid} className="rounded-lg border border-[#E5E0D8] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-[#2C2C2C]">{task.title}</span>
                  <div className="flex items-center gap-2">
                    {task.priority && (
                      <Badge variant="outline" className="text-xs">
                        {t(`priority.${task.priority}`)}
                      </Badge>
                    )}
                    {task.storyPoints && (
                      <span className="text-xs text-[#6B6B6B]">{task.storyPoints}h</span>
                    )}
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditTaskDialog(task)}
                          className="h-7 text-xs text-[#6B6B6B] hover:text-[#2C2C2C]"
                        >
                          {t("proposals.editDraft")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task)}
                          disabled={isPending}
                          className="h-7 text-xs text-[#D32F2F] hover:bg-[#FFEBEE] hover:text-[#D32F2F]"
                        >
                          {t("proposals.deleteDraft")}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {task.description && <p className="mb-2 text-sm text-[#6B6B6B]">{task.description}</p>}
                {task.acceptanceCriteria && (
                  <div className="mt-2 rounded bg-[#F5F2EC] p-3">
                    <div className="mb-1 text-xs font-medium text-[#9A9A9A]">
                      {t("tasks.acceptanceCriteria")}
                    </div>
                    <div className="prose prose-sm max-w-none text-[#6B6B6B]">
                      <Streamdown>{task.acceptanceCriteria}</Streamdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#9A9A9A]">{t("proposals.emptyContainer")}</p>
        )}
      </Card>

      {/* Document Draft Dialog */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDoc ? t("proposals.editDraft") : t("proposals.addDocumentDraft")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-[#6B6B6B]">
                {t("proposals.documentType")}
              </Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="border-[#E5E0D8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prd">{t("proposals.docTypePrd")}</SelectItem>
                  <SelectItem value="tech_design">{t("proposals.docTypeTechDesign")}</SelectItem>
                  <SelectItem value="adr">{t("proposals.docTypeAdr")}</SelectItem>
                  <SelectItem value="spec">{t("proposals.docTypeSpec")}</SelectItem>
                  <SelectItem value="guide">{t("proposals.docTypeGuide")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block text-[#6B6B6B]">
                {t("proposals.documentTitle")} *
              </Label>
              <Input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder={t("proposals.titlePlaceholder")}
                className="border-[#E5E0D8]"
              />
            </div>
            <div>
              <Label className="mb-2 block text-[#6B6B6B]">
                {t("proposals.documentContent")}
              </Label>
              <Textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="h-64 resize-none border-[#E5E0D8] font-mono"
                placeholder="# Document Title&#10;&#10;Write your content in Markdown..."
              />
            </div>
            {error && (
              <div className="rounded-lg bg-[#FFEBEE] p-3 text-sm text-[#D32F2F]">{error}</div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDocDialog(false)}
                disabled={isPending}
                className="border-[#E5E0D8]"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSaveDoc}
                disabled={isPending}
                className="bg-[#C67A52] text-white hover:bg-[#B56A42]"
              >
                {isPending ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Draft Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? t("proposals.editDraft") : t("proposals.addTaskDraft")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-[#6B6B6B]">
                {t("proposals.taskTitle")} *
              </Label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder={t("proposals.titlePlaceholder")}
                className="border-[#E5E0D8]"
              />
            </div>
            <div>
              <Label className="mb-2 block text-[#6B6B6B]">
                {t("proposals.taskDescription")}
              </Label>
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="h-24 resize-none border-[#E5E0D8]"
                placeholder={t("proposals.descriptionPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-[#6B6B6B]">
                  {t("proposals.taskPriority")}
                </Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger className="border-[#E5E0D8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("priority.low")}</SelectItem>
                    <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                    <SelectItem value="high">{t("priority.high")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block text-[#6B6B6B]">
                  {t("proposals.taskStoryPoints")}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={taskStoryPoints}
                  onChange={(e) => setTaskStoryPoints(e.target.value)}
                  placeholder={t("proposals.storyPointsPlaceholder")}
                  className="border-[#E5E0D8]"
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block text-[#6B6B6B]">
                {t("proposals.taskAcceptanceCriteria")}
              </Label>
              <Textarea
                value={taskAcceptanceCriteria}
                onChange={(e) => setTaskAcceptanceCriteria(e.target.value)}
                className="h-32 resize-none border-[#E5E0D8] font-mono"
                placeholder="- [ ] Criterion 1&#10;- [ ] Criterion 2"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-[#FFEBEE] p-3 text-sm text-[#D32F2F]">{error}</div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTaskDialog(false)}
                disabled={isPending}
                className="border-[#E5E0D8]"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSaveTask}
                disabled={isPending}
                className="bg-[#C67A52] text-white hover:bg-[#B56A42]"
              >
                {isPending ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
