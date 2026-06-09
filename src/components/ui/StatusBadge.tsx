"use client";

import { Badge } from "@/components/ui/Badge";
import { projektStatusStyles } from "@/lib/status";
import { useStatusLabels } from "@/hooks/useStatusLabels";
import type { ProjektStatus } from "@/types";

export function StatusBadge({ status }: { status: ProjektStatus }) {
  const { projektStatusLabel } = useStatusLabels();
  const style = projektStatusStyles[status];
  return (
    <Badge className={style.className} dot={style.dot}>
      {projektStatusLabel(status)}
    </Badge>
  );
}
