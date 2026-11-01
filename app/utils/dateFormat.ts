/**
 * Единые форматтеры дат (локальный календарный день, без UTC-сдвига).
 */

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const HH_MM_TIME_RE = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

function toLocalYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Календарный день в локальной зоне.
 * - `YYYY-MM-DD` → локальная полночь (не UTC-парсинг `new Date("YYYY-MM-DD")`)
 * - ISO datetime → локальный день инстанта
 */
export function parseDateApi(value: Date | string): Date {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new Error(`Неверный формат даты: ${String(value)}`);
    }
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Неверный формат даты: ${String(value)}`);
  }

  const trimmed = value.trim();
  const dateOnly = DATE_ONLY_RE.exec(trimmed);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Неверный формат даты: ${String(value)}`);
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/** API / ключи календаря / persist: YYYY-MM-DD в локальном часовом поясе */
export function formatDateApi(value: Date | string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (DATE_ONLY_RE.test(trimmed)) {
      return trimmed;
    }
    return toLocalYmd(parseDateApi(trimmed));
  }

  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw new Error(`Неверный формат даты: ${String(value)}`);
  }

  return toLocalYmd(value);
}

/**
 * API additional.start_at / end_at: локальное время отеля (YYYY-MM-DDTHH:mm:ss),
 * без суффикса Z — иначе бэкенд/PDF сдвигает время на offset часового пояса.
 */
export function formatDateTimeApi(date: Date, time: string): string | null {
  if (!date || !time) return null;
  if (!HH_MM_TIME_RE.test(time)) {
    if (import.meta.dev) {
      console.warn(`Неверный формат времени: ${time}. Ожидается HH:mm.`);
    }
    return null;
  }
  return `${formatDateApi(date)}T${time}:00`;
}

function parseDateString(dateString: string | undefined): Date | null {
  if (!dateString) return null;
  try {
    return parseDateApi(dateString);
  } catch {
    return null;
  }
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
  const date = parseDateString(dateString);
  return date ? formatDateNumeric(date, empty) : empty;
}

/** Парсинг строки → formatDateLong */
export function formatDateStringLong(
  dateString: string | undefined,
  locale = "ru-RU",
  empty = "—",
): string {
  const date = parseDateString(dateString);
  return date ? formatDateLong(date, locale, empty) : empty;
}

/** Парсинг строки → formatWeekdayLong */
export function formatWeekdayStringLong(
  dateString: string | undefined,
  locale = "ru-RU",
  empty = "",
): string {
  const date = parseDateString(dateString);
  return date ? formatWeekdayLong(date, locale, empty) : empty;
}
