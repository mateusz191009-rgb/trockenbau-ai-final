import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ProjectsTable } from "@/components/projects/ProjectsTable";
import { activity, projects, revenueSeries, stats } from "@/data/mock";

export default function DashboardPage() {
  const recentProjects = projects
    .filter((p) => p.status !== "completed")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back, Anna. Here's what's happening across your sites today."
        actions={
          <>
            <Button variant="outline" size="md">
              Export
            </Button>
            <Button size="md">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Chart + activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueChart data={revenueSeries} />
        <ActivityFeed items={activity} />
      </div>

      {/* Recent projects */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>
              Ongoing sites that need attention
            </CardDescription>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="px-0 pb-0 pt-3">
          <ProjectsTable projects={recentProjects} compact />
        </CardContent>
      </Card>
    </div>
  );
}
