import { describe, it, expect } from "vitest";
import {
  formatDateApi,
  parseDateApi,
  formatDateNumeric,
  formatDateLong,
  formatWeekdayLong,
  formatDateStringNumeric,
  formatDateStringLong,
  formatDateTimeApi,
} from "~/utils/dateFormat";

describe("dateFormat contracts", () => {
  describe("formatDateTimeApi (additional start_at / end_at)", () => {
    it("возвращает локальное время без суффикса Z", () => {
      const date = new Date(2026, 3, 15);
      expect(formatDateTimeApi(date, "12:00")).toBe("2026-04-15T12:00:00");
    });

    it("отклоняет неверный формат времени", () => {
      const date = new Date(2026, 3, 15);
      expect(formatDateTimeApi(date, "25:00")).toBeNull();
    });
  });

  describe("formatDateApi (ex booking store)", () => {
    it("форматирует Date в локальный YYYY-MM-DD", () => {
      const date = new Date(2026, 3, 15, 12, 0, 0); // 15 Apr local
      expect(formatDateApi(date)).toBe("2026-04-15");
    });

    it("возвращает YYYY-MM-DD строку как есть", () => {
      expect(formatDateApi("2026-04-15")).toBe("2026-04-15");
    });

    it("не сдвигает день у раннего локального времени (vs toISOString)", () => {
      // 00:30 локально при UTC+N → toISOString уже предыдущий UTC-день
      const early = new Date(2026, 3, 15, 0, 30, 0);
      expect(formatDateApi(early)).toBe("2026-04-15");
      if (early.getTimezoneOffset() < 0) {
        expect(early.toISOString().split("T")[0]).toBe("2026-04-14");
      }
    });

    it("из ISO datetime берёт локальный день, не UTC-префикс", () => {
      // Локальная полночь 15.04 при UTC+ → ISO с датой 14.04
      const localMidnight = new Date(2026, 3, 15, 0, 0, 0);
      if (localMidnight.getTimezoneOffset() < 0) {
        const iso = localMidnight.toISOString();
        expect(iso.startsWith("2026-04-14")).toBe(true);
        expect(formatDateApi(iso)).toBe("2026-04-15");
      }
    });

    it("бросает на невалидной дате", () => {
      expect(() => formatDateApi(new Date("invalid"))).toThrow(
        /Неверный формат/,
      );
    });
  });

  describe("parseDateApi", () => {
    it("YYYY-MM-DD → локальная полночь без UTC-сдвига", () => {
      const date = parseDateApi("2026-08-15");
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(7);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(0);
    });

    it("нормализует Date до календарного дня", () => {
      const date = parseDateApi(new Date(2026, 7, 15, 18, 45, 0));
      expect(formatDateApi(date)).toBe("2026-08-15");
      expect(date.getHours()).toBe(0);
    });
  });

  describe("formatDateNumeric (ex useDateLocale / DatePicker)", () => {
    it("форматирует ДД.ММ.ГГГГ", () => {
      expect(formatDateNumeric(new Date(2026, 3, 5))).toBe("05.04.2026");
    });

    it("пустая дата → плейсхолдер", () => {
      expect(formatDateNumeric(null)).toBe("--.--.----");
    });
  });

  describe("formatDateLong (ex BookingSummary / MultiCard)", () => {
    it("день + длинный месяц ru-RU", () => {
      const result = formatDateLong(new Date(2026, 3, 15), "ru-RU");
      expect(result).toMatch(/15/);
      expect(result.toLowerCase()).toMatch(/апр/);
    });

    it("null → пустая строка", () => {
      expect(formatDateLong(null)).toBe("");
    });
  });

  describe("formatWeekdayLong", () => {
    it("день недели с заглавной", () => {
      // 2026-04-15 — среда
      const result = formatWeekdayLong(new Date(2026, 3, 15), "ru-RU");
      expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("formatDateString* (ex Cabinet / BookingDetailsSummary)", () => {
    it("numeric из ISO-строки", () => {
      expect(formatDateStringNumeric("2026-04-15T12:00:00")).toMatch(
        /\d{2}\.\d{2}\.2026/,
      );
    });

    it("long из date-only без UTC-сдвига", () => {
      const result = formatDateStringLong("2026-04-15", "ru-RU");
      expect(result).toMatch(/15/);
    });

    it("пустая строка → тире", () => {
      expect(formatDateStringNumeric(undefined)).toBe("—");
      expect(formatDateStringLong(undefined)).toBe("—");
    });
  });
});
