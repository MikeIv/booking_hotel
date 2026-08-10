/**
 * Единые форматтеры дат (локальный календарный день, без UTC-сдвига).
 */

/** API / ключи календаря: YYYY-MM-DD в локальном часовом поясе */
export function formatDateApi(value: Date | string): string {
  if (typeof value === "string") return value;
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw new Error(`Неверный формат даты: ${String(value)}`);
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Отображение: ДД.ММ.ГГГГ */
export function formatDateNumeric(
  date: Date | null | undefined,
  empty = "--.--.----",
): string {
  if (!date || isNaN(date.getTime())) return empty;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}.${month}.${year}`;
}

/** Отображение: «15 апреля» (день + длинный месяц) */
export function formatDateLong(
  date: Date | null | undefined,
  locale = "ru-RU",
  empty = "",
): string {
  if (!date || isNaN(date.getTime())) return empty;
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
  });
}

/** День недели с заглавной: «Понедельник» */
export function formatWeekdayLong(
  date: Date | null | undefined,
  locale = "ru-RU",
  empty = "",
): string {
  if (!date || isNaN(date.getTime())) return empty;
  const weekday = date.toLocaleDateString(locale, { weekday: "long" });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

/** Парсинг строки даты (ISO / Date-parseable) → formatDateNumeric */
export function formatDateStringNumeric(
  dateString: string | undefined,
  empty = "—",
): string {
  if (!dateString) return empty;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return empty;
  return formatDateNumeric(date, empty);
}

/** Парсинг строки → formatDateLong */
export function formatDateStringLong(
  dateString: string | undefined,
  locale = "ru-RU",
  empty = "—",
): string {
  if (!dateString) return empty;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return empty;
  return formatDateLong(date, locale, empty);
}

/** Парсинг строки → formatWeekdayLong */
export function formatWeekdayStringLong(
  dateString: string | undefined,
  locale = "ru-RU",
  empty = "",
): string {
  if (!dateString) return empty;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return empty;
  return formatWeekdayLong(date, locale, empty);
}
