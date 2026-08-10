import { describe, it, expect } from "vitest";
import {
  formatDateApi,
  formatDateNumeric,
  formatDateLong,
  formatWeekdayLong,
  formatDateStringNumeric,
  formatDateStringLong,
} from "~/utils/dateFormat";

describe("dateFormat contracts", () => {
  describe("formatDateApi (ex booking store)", () => {
    it("форматирует Date в локальный YYYY-MM-DD", () => {
      const date = new Date(2026, 3, 15, 12, 0, 0); // 15 Apr local
      expect(formatDateApi(date)).toBe("2026-04-15");
    });

    it("возвращает строку как есть", () => {
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

    it("бросает на невалидной дате", () => {
      expect(() => formatDateApi(new Date("invalid"))).toThrow(
        /Неверный формат/,
      );
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

    it("long из ISO-строки", () => {
      const result = formatDateStringLong("2026-04-15", "ru-RU");
      expect(result).toMatch(/15/);
    });

    it("пустая строка → тире", () => {
      expect(formatDateStringNumeric(undefined)).toBe("—");
      expect(formatDateStringLong(undefined)).toBe("—");
    });
  });
});
