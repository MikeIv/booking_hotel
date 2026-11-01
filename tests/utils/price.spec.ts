import { describe, expect, it } from "vitest";
import { formatPrice } from "~/utils/price";

describe("formatPrice", () => {
  it("группирует тысячи пробелом", () => {
    expect(formatPrice(42000)).toBe("42 000");
    expect(formatPrice(21600)).toBe("21 600");
    expect(formatPrice(24000)).toBe("24 000");
    expect(formatPrice(1500000)).toBe("1 500 000");
  });

  it("не добавляет пробел к числам меньше 1000", () => {
    expect(formatPrice(0)).toBe("0");
    expect(formatPrice(500)).toBe("500");
    expect(formatPrice(999)).toBe("999");
  });

  it("принимает строку и округляет дробную часть", () => {
    expect(formatPrice("21600")).toBe("21 600");
    expect(formatPrice(21600.4)).toBe("21 600");
  });

  it("возвращает 0 для пустых и нечисловых значений", () => {
    expect(formatPrice(null)).toBe("0");
    expect(formatPrice(undefined)).toBe("0");
    expect(formatPrice("abc")).toBe("0");
  });
});
