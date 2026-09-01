import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import {
  BOOKING_DEEP_LINK_LOADING_MESSAGE,
  getRouteQueryWithLocationFallback,
  hasBookingDeepLinkParams,
  isBookingDeepLinkNavigation,
  omitBookingDeepLinkQuery,
  parseBookingDeepLink,
  prepareBookingDeepLinkOverlay,
  runBookingDeepLinkSearch,
  shouldHoldDeepLinkSearchOverlay,
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

  it("shouldHoldDeepLinkSearchOverlay только на главной с датами", () => {
    const query = { check_in: "2026-09-15", check_out: "2026-09-17" };
    expect(shouldHoldDeepLinkSearchOverlay(query, "/")).toBe(true);
    expect(shouldHoldDeepLinkSearchOverlay(query, "")).toBe(true);
    expect(shouldHoldDeepLinkSearchOverlay(query, "/rooms")).toBe(false);
    expect(shouldHoldDeepLinkSearchOverlay({}, "/")).toBe(false);
  });

  it("prepareBookingDeepLinkOverlay включает pending и loading", () => {
    const pending = { value: false };
    const store = {
      setLoading: vi.fn(),
      setServerRequest: vi.fn(),
    };

    expect(
      prepareBookingDeepLinkOverlay(
        { check_in: "2026-09-15", check_out: "2026-09-17" },
        "/",
        pending,
        store,
      ),
    ).toBe(true);
    expect(pending.value).toBe(true);
    expect(store.setLoading).toHaveBeenCalledWith(
      true,
      BOOKING_DEEP_LINK_LOADING_MESSAGE,
    );
    expect(store.setServerRequest).toHaveBeenCalledWith(true);
  });

  it("prepareBookingDeepLinkOverlay не трогает стор без дат", () => {
    const pending = { value: false };
    const store = {
      setLoading: vi.fn(),
      setServerRequest: vi.fn(),
    };

    expect(prepareBookingDeepLinkOverlay({}, "/", pending, store)).toBe(false);
    expect(pending.value).toBe(false);
    expect(store.setLoading).not.toHaveBeenCalled();
  });
});

describe("runBookingDeepLinkSearch", () => {
  const dates = { check_in: "2026-09-15", check_out: "2026-09-17" };

  function createDeps(
    overrides: {
      query?: Record<string, unknown>;
      path?: string;
    } = {},
  ) {
    const pending = ref(true);
    const store = {
      setDate: vi.fn(),
      setGuests: vi.fn(),
      setPromoCode: vi.fn(),
      setLoading: vi.fn(),
      setServerRequest: vi.fn(),
    };
    const routerReplace = vi.fn().mockResolvedValue(undefined);
    const submitSearch = vi.fn().mockResolvedValue(undefined);

    return {
      pending,
      store,
      routerReplace,
      submitSearch,
      deps: {
        query: dates,
        path: "/",
        pending,
        store,
        routerReplace,
        submitSearch,
        ...overrides,
      },
    };
  }

  it("автопоиск на / держит оверлей до submit и снимает pending", async () => {
    const { pending, store, submitSearch, routerReplace, deps } = createDeps();

    await runBookingDeepLinkSearch(deps);

    expect(routerReplace).toHaveBeenCalled();
    expect(store.setDate).toHaveBeenCalled();
    expect(store.setGuests).toHaveBeenCalled();
    expect(submitSearch).toHaveBeenCalledOnce();
    expect(pending.value).toBe(false);
    expect(store.setLoading).not.toHaveBeenCalledWith(false);
  });

  it("пустой path считает главной и запускает автопоиск", async () => {
    const { submitSearch, deps } = createDeps({ path: "" });

    await runBookingDeepLinkSearch(deps);

    expect(submitSearch).toHaveBeenCalledOnce();
  });

  it("без дат не вызывает replace и гасит pending", async () => {
    const { pending, store, routerReplace, submitSearch, deps } = createDeps({
      query: {},
    });
    pending.value = false;

    await runBookingDeepLinkSearch(deps);

    expect(routerReplace).not.toHaveBeenCalled();
    expect(submitSearch).not.toHaveBeenCalled();
    expect(store.setDate).not.toHaveBeenCalled();
    expect(pending.value).toBe(false);
  });

  it("без автопоиска (не /) снимает loading", async () => {
    const { pending, store, submitSearch, deps } = createDeps({
      path: "/personal",
    });

    await runBookingDeepLinkSearch(deps);

    expect(submitSearch).not.toHaveBeenCalled();
    expect(pending.value).toBe(false);
    expect(store.setLoading).toHaveBeenCalledWith(false);
    expect(store.setServerRequest).toHaveBeenCalledWith(false);
  });

  it("невалидные даты не стартуют поиск и гасят оверлей", async () => {
    const { pending, store, submitSearch, deps } = createDeps({
      query: { check_in: "invalid", check_out: "2026-09-17" },
    });

    await runBookingDeepLinkSearch(deps);

    expect(submitSearch).not.toHaveBeenCalled();
    expect(store.setDate).not.toHaveBeenCalled();
    expect(pending.value).toBe(false);
    expect(store.setLoading).toHaveBeenCalledWith(false);
  });
});
