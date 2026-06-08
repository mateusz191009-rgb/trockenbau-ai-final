import type { Metadata } from "next";
import { Plus, Users, Building2, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { customers } from "@/data/mock";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  const totalValue = customers.reduce((s, c) => s + c.totalValue, 0);
  const activeCustomers = customers.filter((c) => c.activeProjects > 0).length;

  const summary = [
    {
      label: "Total Customers",
      value: String(customers.length),
      icon: Users,
    },
    {
      label: "With Active Jobs",
      value: String(activeCustomers),
      icon: Building2,
    },
    {
      label: "Portfolio Value",
      value: formatCurrency(totalValue),
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Your client relationships and account health at a glance."
        actions={
          <Button size="md">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {s.label}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {s.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </div>
  );
}
