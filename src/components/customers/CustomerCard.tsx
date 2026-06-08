import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { customerTypeMeta } from "@/lib/status";
import { formatCurrency } from "@/lib/utils";
import type { Customer } from "@/types";

export function CustomerCard({ customer }: { customer: Customer }) {
  const type = customerTypeMeta[customer.type];

  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={customer.name} className="h-11 w-11 text-sm" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {customer.name}
            </p>
            <p className="text-xs text-slate-400">{customer.contact}</p>
          </div>
        </div>
        <Badge className={type.className} dot={type.dot}>
          {type.label}
        </Badge>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{customer.email}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-slate-400" />
          {customer.phone}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          {customer.location}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-400">Active Projects</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {customer.activeProjects}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Lifetime Value</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatCurrency(customer.totalValue)}
          </p>
        </div>
      </div>
    </Card>
  );
}
