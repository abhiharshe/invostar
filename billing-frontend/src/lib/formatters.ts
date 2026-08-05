/**
 * Native Intl-based formatting helpers (No external date libraries used)
 */

export function formatDate(
  dateInput: string | Date | number | null | undefined,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateTime(
  dateInput: string | Date | number | null | undefined,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatRelativeTime(
  dateInput: string | Date | number | null | undefined,
  locale = "en-US"
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (Math.abs(days) > 0) return rtf.format(days, "day");
  if (Math.abs(hours) > 0) return rtf.format(hours, "hour");
  if (Math.abs(minutes) > 0) return rtf.format(minutes, "minute");
  return rtf.format(diffInSeconds, "second");
}

export function formatCurrency(
  amount: number | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(
  value: number | null | undefined,
  locale = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat(locale, options).format(value);
}
