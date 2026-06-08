"use client";

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

/** Einfache Sicherheitsabfrage, z. B. vor dem Löschen. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Löschen",
  cancelLabel = "Abbrechen",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" size="lg" onClick={onConfirm}>
            {confirmLabel}
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
