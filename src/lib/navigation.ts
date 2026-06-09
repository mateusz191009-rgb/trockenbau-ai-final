import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  HardHat,
  FolderOpen,
  FileText,
  Settings,
} from "lucide-react";

export interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "customers", href: "/kunden", icon: Users },
  { key: "projects", href: "/projekte", icon: HardHat },
  { key: "files", href: "/dateien", icon: FolderOpen },
  { key: "offers", href: "/angebote", icon: FileText },
  { key: "settings", href: "/einstellungen", icon: Settings },
];
