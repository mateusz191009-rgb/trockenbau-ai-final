import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  HardHat,
  Users,
  CalendarDays,
  FileText,
  Sparkles,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  /** Routes that exist as real pages in this starter. */
  enabled: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, enabled: true },
      {
        label: "Projects",
        href: "/projects",
        icon: HardHat,
        badge: "28",
        enabled: true,
      },
      { label: "Customers", href: "/customers", icon: Users, enabled: true },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Schedule",
        href: "/schedule",
        icon: CalendarDays,
        enabled: false,
      },
      { label: "Invoices", href: "/invoices", icon: FileText, enabled: false },
      {
        label: "AI Assistant",
        href: "/assistant",
        icon: Sparkles,
        badge: "New",
        enabled: false,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        enabled: false,
      },
    ],
  },
];
