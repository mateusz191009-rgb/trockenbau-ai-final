"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Inhalt der Fußzeile (Buttons). */
  footer?: React.ReactNode;
  size?: "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  // ESC schließt, Body-Scroll sperren, solange offen.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl",
          "animate-fade-in dark:bg-slate-900 sm:rounded-3xl",
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
