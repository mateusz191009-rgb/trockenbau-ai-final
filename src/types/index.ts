export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "on_hold"
  | "completed";

export type CustomerType = "residential" | "commercial" | "industrial";

export interface Project {
  id: string;
  name: string;
  customer: string;
  status: ProjectStatus;
  progress: number; // 0 - 100
  budget: number;
  spent: number;
  area: number; // m² of drywall
  startDate: string;
  dueDate: string;
  lead: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  type: CustomerType;
  location: string;
  activeProjects: number;
  totalValue: number;
  joinedDate: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  delta: number; // percentage change vs previous period
  trend: "up" | "down";
  icon: "projects" | "revenue" | "customers" | "area";
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: "project" | "customer" | "invoice" | "ai";
}

export interface ChartPoint {
  label: string;
  value: number;
}
