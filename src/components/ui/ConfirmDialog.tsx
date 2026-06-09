"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations("common");

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onCancel}>
            {cancelLabel ?? t("cancel")}
          </Button>
          <Button variant="danger" size="lg" onClick={onConfirm}>
            {confirmLabel ?? t("delete")}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <p className="pt-1 text-base text-slate-600 dark:text-slate-300">
          {message}
        </p>
      </div>
    </Modal>
  );
}
