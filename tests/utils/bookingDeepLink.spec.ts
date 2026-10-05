import { describe, expect, it, vi } from "vitest";
import {
  applyBookingDeepLinkFromQuery,
  BOOKING_DEEP_LINK_SEARCH_PATHS,
  getRouteQueryWithLocationFallback,
  hasBookingDeepLinkParams,
  isBookingDeepLinkNavigation,
  omitBookingDeepLinkQuery,
  parseBookingDeepLink,
  shouldAutoSearchAfterDeepLink,
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

  it("isBookingDeepLinkNavigation учитывает query в from при replace", () => {
    expect(
      isBookingDeepLinkNavigation(
        {},
        { check_in: "2026-09-15", check_out: "2026-09-17" },
      ),
    ).toBe(true);
    expect(
      isBookingDeepLinkNavigation(
        { check_in: "2026-09-15", check_out: "2026-09-17" },
        {},
      ),
    ).toBe(true);
    expect(isBookingDeepLinkNavigation({}, {})).toBe(false);
  });

  it("getRouteQueryWithLocationFallback читает window.location.search", () => {
    const { pathname, search } = window.location;
    window.history.replaceState(
      {},
      "",
      "/?check_in=2026-09-15&check_out=2026-09-17",
    );

    expect(getRouteQueryWithLocationFallback({})).toEqual({
      check_in: "2026-09-15",
      check_out: "2026-09-17",
    });

    window.history.replaceState({}, "", `${pathname}${search}`);
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

describe("applyBookingDeepLinkFromQuery", () => {
  const dates = {
    check_in: "2026-09-15",
    check_out: "2026-09-17",
    adults: "2",
  };

  function createDeps(
    overrides: {
      query?: Record<string, unknown>;
      path?: string;
    } = {},
  ) {
    const store = {
      setDate: vi.fn(),
      setGuests: vi.fn(),
      setPromoCode: vi.fn(),
    };
    const routerReplace = vi.fn().mockResolvedValue(undefined);

    return {
      store,
      routerReplace,
      deps: {
        query: dates,
        path: "/",
        store,
        routerReplace,
        ...overrides,
      },
    };
  }

  it("чистит query, заполняет store и возвращает true", async () => {
    const { store, routerReplace, deps } = createDeps();

    const applied = await applyBookingDeepLinkFromQuery(deps);

    expect(applied).toBe(true);
    expect(routerReplace).toHaveBeenCalledWith({
      path: "/",
      hash: undefined,
      query: {},
    });
    expect(store.setDate).toHaveBeenCalledOnce();
    expect(store.setGuests).toHaveBeenCalledOnce();
    expect(store.setPromoCode).not.toHaveBeenCalled();
  });

  it("без дат ничего не делает и возвращает false", async () => {
    const { store, routerReplace, deps } = createDeps({ query: {} });

    const applied = await applyBookingDeepLinkFromQuery(deps);

    expect(applied).toBe(false);
    expect(routerReplace).not.toHaveBeenCalled();
    expect(store.setDate).not.toHaveBeenCalled();
  });

  it("невалидные даты чистит URL, store не трогает и возвращает false", async () => {
    const { store, routerReplace, deps } = createDeps({
      query: { check_in: "invalid", check_out: "2026-09-17", uuid: "keep" },
    });

    const applied = await applyBookingDeepLinkFromQuery(deps);

    expect(applied).toBe(false);
    expect(routerReplace).toHaveBeenCalledWith({
      path: "/",
      hash: undefined,
      query: { uuid: "keep" },
    });
    expect(store.setDate).not.toHaveBeenCalled();
  });
});

describe("shouldAutoSearchAfterDeepLink", () => {
  it("автопоиск только на страницах поиска", () => {
    expect(shouldAutoSearchAfterDeepLink(true, "/rooms")).toBe(true);
    expect(shouldAutoSearchAfterDeepLink(true, "/multi-rooms")).toBe(true);
    expect(shouldAutoSearchAfterDeepLink(true, "/")).toBe(false);
    expect(shouldAutoSearchAfterDeepLink(true, "/cabinet")).toBe(false);
  });

  it("без применённого deep-link поиск не запускаем", () => {
    for (const path of BOOKING_DEEP_LINK_SEARCH_PATHS) {
      expect(shouldAutoSearchAfterDeepLink(false, path)).toBe(false);
    }
  });
});
