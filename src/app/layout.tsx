import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trockenbau AI — Contractor Platform",
    template: "%s · Trockenbau AI",
  },
  description:
    "AI-powered operations dashboard for drywall contractors: projects, customers, scheduling, and insights.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
