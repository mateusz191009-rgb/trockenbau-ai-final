import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import type { ChartPoint } from "@/types";

interface RevenueChartProps {
  data: ChartPoint[];
}

const WIDTH = 720;
const HEIGHT = 240;
const PAD_X = 8;
const PAD_Y = 20;

/**
 * Dependency-free responsive SVG area chart.
 * Builds a smooth-ish polyline + gradient fill from the data series.
 */
export function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_Y * 2;

  const points = data.map((d, i) => {
    const x = PAD_X + (i / (data.length - 1)) * innerW;
    const y = PAD_Y + innerH - ((d.value - min) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(
    1,
  )} ${HEIGHT - PAD_Y} L ${points[0].x.toFixed(1)} ${HEIGHT - PAD_Y} Z`;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Monthly billed revenue (€ thousands)</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            €{total.toLocaleString("en-US")}k
          </p>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            +18.6% YoY
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-56 w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label="Revenue trend chart"
          >
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1={PAD_X}
                x2={WIDTH - PAD_X}
                y1={PAD_Y + innerH * t}
                y2={PAD_Y + innerH * t}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth={1}
              />
            ))}

            <path d={areaPath} fill="url(#revFill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#f97316"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {points.map((p) => (
              <circle
                key={p.label}
                cx={p.x}
                cy={p.y}
                r={3}
                className="fill-white stroke-brand-500"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* X axis labels */}
          <div className="mt-3 flex justify-between px-1 text-[11px] font-medium text-slate-400">
            {data.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
