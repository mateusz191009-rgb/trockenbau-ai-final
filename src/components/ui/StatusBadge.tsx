import { Badge } from "@/components/ui/Badge";
import { projektStatusMeta } from "@/lib/status";
import type { ProjektStatus } from "@/types";

export function StatusBadge({ status }: { status: ProjektStatus }) {
  const meta = projektStatusMeta[status];
  return (
    <Badge className={meta.className} dot={meta.dot}>
      {meta.label}
    </Badge>
  );
}
