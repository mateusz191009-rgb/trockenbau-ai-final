"use client";

import * as React from "react";
import { usePathname } from "@/i18n/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

// Seiten ohne Sidebar/Topbar (Landing, Anmeldung, Rechtliches).
const OHNE_RAHMEN = [
  "/",
  "/login",
  "/registrieren",
  "/passwort-vergessen",
  "/neues-passwort",
  "/auth",
  "/impressum",
  "/datenschutz",
  "/kontakt",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  const ohneRahmen = OHNE_RAHMEN.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (ohneRahmen) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
