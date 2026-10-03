const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// local calendar date as YYYY-MM-DD (toISOString would shift the day in UTC+ time zones)
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "2026-10-10" or "2026-10-10T00:00:00.000Z" -> "Sat, 10 Oct 2026"
export function formatISODate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${d} ${MONTHS[m - 1]} ${y}`;
}

export interface DateOption {
  iso: string;
  label: string;
}

// today + the next `days` days
export function upcomingDates(days = 30): DateOption[] {
  const options: DateOption[] = [];
  const base = new Date();
  for (let i = 0; i <= days; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const iso = toISODate(d);
    const prefix = i === 0 ? "Today · " : i === 1 ? "Tomorrow · " : "";
    options.push({ iso, label: `${prefix}${formatISODate(iso)}` });
  }
  return options;
}

// whole days between a calendar date (YYYY-MM-DD) and today (local)
export function daysAgo(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - Date.UTC(y, m - 1, d)) / 86400000);
}

// iso + n days (as YYYY-MM-DD)
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

// today and the previous `days` days, newest first
export function pastDates(days = 89): DateOption[] {
  const options: DateOption[] = [];
  const base = new Date();
  for (let i = 0; i <= days; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
    const iso = toISODate(d);
    const label =
      i === 0 ? `Today · ${formatISODate(iso)}` : i === 1 ? `Yesterday · ${formatISODate(iso)}` : `${formatISODate(iso)} (${i} days ago)`;
    options.push({ iso, label });
  }
  return options;
}
