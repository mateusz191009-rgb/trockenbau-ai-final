import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StatKachelProps {
  label: string;
  wert: number | string;
  icon: LucideIcon;
  href: string;
}

/** Große, klar lesbare Kennzahl-Kachel fürs Dashboard. */
export function StatKachel({ label, wert, icon: Icon, href }: StatKachelProps) {
  return (
    <Link href={href} className="block">
      <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-card">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <p className="text-3xl font-bold leading-tight text-slate-900 dark:text-white">
            {wert}
          </p>
          <p className="truncate text-base text-slate-500 dark:text-slate-400">
            {label}
          </p>
        </div>
      </Card>
    </Link>
  );
}
