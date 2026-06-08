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
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Kunden", href: "/kunden", icon: Users },
  { label: "Projekte", href: "/projekte", icon: HardHat },
  { label: "Dateien", href: "/dateien", icon: FolderOpen },
  { label: "Angebote", href: "/angebote", icon: FileText },
  { label: "Einstellungen", href: "/einstellungen", icon: Settings },
];
