import { format, isValid, parseISO } from "date-fns";

export function parseDateOnly(dateValue?: string | null): Date | undefined {
  if (!dateValue) return undefined;

  const parsedDate = parseISO(dateValue);
  return isValid(parsedDate) ? parsedDate : undefined;
}

export function formatDateOnly(
  dateValue?: string | null,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string {
  const parsedDate = parseDateOnly(dateValue);
  if (!parsedDate) return "-";

  return parsedDate.toLocaleDateString("id-ID", options);
}

export function formatDateInput(dateValue: Date | null | undefined): string {
  if (!dateValue) return "";

  return format(dateValue, "yyyy-MM-dd");
}