import { Layers } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Zentrierte Karte für alle Anmelde-Seiten. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
            <Layers className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-base text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-base text-slate-500 dark:text-slate-400">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
