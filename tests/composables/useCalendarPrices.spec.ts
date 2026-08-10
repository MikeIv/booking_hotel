import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCalendarPrices } from "~/composables/useCalendarPrices";

const mockGet = vi.fn();

vi.stubGlobal("useApi", () => ({
  get: mockGet,
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

describe("useCalendarPrices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPriceForDate использует локальный YYYY-MM-DD, не UTC toISOString", async () => {
    mockGet.mockResolvedValue({
      success: true,
      payload: [{ date_at: "2026-04-15", min_price: 5000 }],
      message: null,
    });

    const api = useCalendarPrices();
    await api.fetchCalendarPrices(4, 2026);

    // 00:30 локально при UTC+N → toISOString уже предыдущий UTC-день
    const earlyLocal = new Date(2026, 3, 15, 0, 30, 0);
    expect(api.getPriceForDate(earlyLocal)).toBe(5000);

    if (earlyLocal.getTimezoneOffset() < 0) {
      expect(earlyLocal.toISOString().split("T")[0]).toBe("2026-04-14");
    }
  });

  it("getPriceForDate возвращает null если цены нет", () => {
    const { getPriceForDate } = useCalendarPrices();
    expect(getPriceForDate(new Date(2026, 0, 1, 12, 0, 0))).toBeNull();
  });
});
