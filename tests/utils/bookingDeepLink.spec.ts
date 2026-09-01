import { describe, expect, it } from "vitest";
import {
  hasBookingDeepLinkParams,
  omitBookingDeepLinkQuery,
  parseBookingDeepLink,
} from "~/utils/bookingDeepLink";
import { formatDateApi } from "~/utils/dateFormat";

describe("bookingDeepLink", () => {
  it("hasBookingDeepLinkParams требует обе даты", () => {
    expect(hasBookingDeepLinkParams({ check_in: "2026-09-15" })).toBe(false);
    expect(
      hasBookingDeepLinkParams({
        check_in: "2026-09-15",
        check_out: "2026-09-17",
      }),
    ).toBe(true);
    expect(
      hasBookingDeepLinkParams({
        checkInDate: "2026-09-15",
        checkOutDate: "2026-09-17",
      }),
    ).toBe(true);
  });

  it("parseBookingDeepLink заполняет одну комнату", () => {
    const payload = parseBookingDeepLink({
      check_in: "2026-09-15",
      check_out: "2026-09-17",
      adults: "2",
      children: "1",
      child_ages: "7",
      promo: "SUMMER",
    });

    expect(payload).not.toBeNull();
    expect(formatDateApi(payload!.date[0])).toBe("2026-09-15");
    expect(formatDateApi(payload!.date[1])).toBe("2026-09-17");
    expect(payload!.guests).toEqual({
      rooms: 1,
      roomList: [{ adults: 2, children: 1, childrenAges: [7] }],
    });
    expect(payload!.promoCode).toBe("SUMMER");
  });

  it("parseBookingDeepLink отклоняет check_out <= check_in", () => {
    expect(
      parseBookingDeepLink({
        check_in: "2026-09-17",
        check_out: "2026-09-15",
      }),
    ).toBeNull();
  });

  it("parseBookingDeepLink отклоняет невалидные даты", () => {
    expect(
      parseBookingDeepLink({
        check_in: "invalid",
        check_out: "2026-09-17",
      }),
    ).toBeNull();
  });

  it("parseBookingDeepLink поддерживает несколько номеров", () => {
    const payload = parseBookingDeepLink({
      check_in: "2026-09-15",
      check_out: "2026-09-17",
      rooms: "2",
      adults: "2,1",
      children: "0,1",
      child_ages: "0|5",
    });

    expect(payload?.guests.roomList).toEqual([
      { adults: 2, children: 0, childrenAges: [] },
      { adults: 1, children: 1, childrenAges: [5] },
    ]);
  });

  it("omitBookingDeepLinkQuery сохраняет прочие параметры", () => {
    expect(
      omitBookingDeepLinkQuery({
        check_in: "2026-09-15",
        check_out: "2026-09-17",
        adults: "2",
        uuid: "abc",
      }),
    ).toEqual({ uuid: "abc" });
  });
});
