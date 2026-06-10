"use client";

import { Badge } from "@/components/ui/Badge";
import { angebotStatusStyles } from "@/lib/status";
import { useStatusLabels } from "@/hooks/useStatusLabels";
import type { AngebotStatus } from "@/types";

export function AngebotStatusBadge({ status }: { status: AngebotStatus }) {
  const { angebotStatusLabel } = useStatusLabels();
  const style = angebotStatusStyles[status];
  return (
    <Badge className={style.className} dot={style.dot}>
      {angebotStatusLabel(status)}
    </Badge>
  );
}
