/**
 * Tiny className combiner — joins truthy values with a space.
 * Avoids an extra dependency while keeping conditional classes readable.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a number as EUR currency (no decimals). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a number with thousands separators. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-DE").format(value);
}

/** Human-friendly date, e.g. "8 Jun 2026". */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Return initials from a full name, e.g. "Anna Becker" -> "AB". */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
