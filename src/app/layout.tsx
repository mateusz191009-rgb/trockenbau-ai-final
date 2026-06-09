import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/store/AuthContext";
import { DataProvider } from "@/store/DataContext";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trockenbau AI",
    template: "%s · Trockenbau AI",
  },
  description:
    "Einfache Verwaltung für Trockenbau-Betriebe: Kunden, Baustellen, Dateien und Angebote.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased text-[15px] sm:text-base">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <DataProvider>
              <AppShell>{children}</AppShell>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
