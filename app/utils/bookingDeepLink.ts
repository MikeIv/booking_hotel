import { MAX_GUESTS_PER_ROOM } from "~/utils/bookingSearch";
import { parseDateApi } from "~/utils/dateFormat";
import { getRouteQueryString } from "~/utils/routeQuery";
import { normalizeChildAges, type ChildAge } from "~/utils/age";

export const BOOKING_DEEP_LINK_QUERY_KEYS = [
  "check_in",
  "check_out",
  "rooms",
  "adults",
  "children",
  "child_ages",
  "promo",
  "checkInDate",
  "checkOutDate",
] as const;

/** Ключ Nuxt useState: deep-link пришёл на страницу, которая запускает поиск сама. */
export const BOOKING_DEEP_LINK_PENDING_SEARCH_KEY =
  "booking-deep-link-pending-search";

/** Страницы поиска: переход с ukraina-hotel.ru ведёт прямо сюда. */
export const BOOKING_DEEP_LINK_SEARCH_PATHS = [
  "/rooms",
  "/multi-rooms",
] as const;

/**
 * Нужно ли странице запускать поиск сразу после deep-link.
 * `applied` — результат applyBookingDeepLinkFromQuery: невалидные даты поиск не запускают.
 */
export function shouldAutoSearchAfterDeepLink(
  applied: boolean,
  path: string,
): boolean {
  if (!applied) return false;
  return (BOOKING_DEEP_LINK_SEARCH_PATHS as readonly string[]).includes(path);
}

export type BookingDeepLinkGuestRoom = {
  adults: number;
  children: number;
  childrenAges: ChildAge[];
};

export type BookingDeepLinkPayload = {
  date: [Date, Date];
  guests: {
    rooms: number;
    roomList: BookingDeepLinkGuestRoom[];
  };
  promoCode: string | null;
};

const MAX_ROOMS = 5;

function getDeepLinkDateStrings(
  query: Record<string, unknown>,
): { checkIn: string; checkOut: string } | null {
  const checkIn =
    getRouteQueryString(query, "check_in") ??
    getRouteQueryString(query, "checkInDate");
  const checkOut =
    getRouteQueryString(query, "check_out") ??
    getRouteQueryString(query, "checkOutDate");

  if (!checkIn || !checkOut) return null;
  return { checkIn, checkOut };
}

function parseNonNegativeInt(value: string | null, fallback: number): number {
  if (value == null) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((part) => part.trim());
}

function parseChildAges(raw: string | null, childrenCount: number): ChildAge[] {
  if (childrenCount === 0) return [];
  return normalizeChildAges(
    splitCsv(raw).map((part) => {
      if (!part) return null;
      const parsed = Number.parseInt(part, 10);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    }),
    childrenCount,
  );
}

function clampRoomGuests(adults: number, children: number) {
  if (adults + children <= MAX_GUESTS_PER_ROOM) {
    return { adults, children };
  }

  const nextAdults = Math.min(adults, MAX_GUESTS_PER_ROOM);
  return {
    adults: nextAdults,
    children: Math.max(0, MAX_GUESTS_PER_ROOM - nextAdults),
  };
}

function pickCsvValue(
  values: string[],
  index: number,
  fallback: string,
): string {
  return values[index] ?? values[0] ?? fallback;
}

function buildRoomList(
  roomsCount: number,
  adultsRaw: string | null,
  childrenRaw: string | null,
  childAgesRaw: string | null,
): BookingDeepLinkGuestRoom[] {
  const adultsParts = splitCsv(adultsRaw);
  const childrenParts = splitCsv(childrenRaw);
  const childAgeGroups = childAgesRaw?.includes("|")
    ? childAgesRaw.split("|").map((group) => group.trim())
    : null;

  const roomList: BookingDeepLinkGuestRoom[] = [];

  for (let index = 0; index < roomsCount; index += 1) {
    const adults = parseNonNegativeInt(
      pickCsvValue(adultsParts, index, "1"),
      index === 0 ? 1 : 0,
    );
    const children = parseNonNegativeInt(
      pickCsvValue(childrenParts, index, "0"),
      0,
    );
    const agesSource = childAgeGroups
      ? (childAgeGroups[index] ?? childAgeGroups[0] ?? "")
      : (childAgesRaw ?? "");
    const clamped = clampRoomGuests(adults, children);
    roomList.push({
      adults: clamped.adults,
      children: clamped.children,
      childrenAges: parseChildAges(agesSource || null, clamped.children),
    });
  }

  if (roomList[0] && roomList.every((room) => room.adults === 0)) {
    roomList[0] = { ...roomList[0], adults: 1 };
  }

  return roomList;
}

export function hasBookingDeepLinkParams(
  query: Record<string, unknown>,
): boolean {
  return getDeepLinkDateStrings(query) !== null;
}

export function isBookingDeepLinkNavigation(
  toQuery: Record<string, unknown>,
  fromQuery: Record<string, unknown>,
): boolean {
  return (
    hasBookingDeepLinkParams(toQuery) || hasBookingDeepLinkParams(fromQuery)
  );
}

/** На cold start route.query может опаздывать — читаем window.location.search. */
export function getRouteQueryWithLocationFallback(
  routeQuery: Record<string, unknown>,
): Record<string, unknown> {
  if (hasBookingDeepLinkParams(routeQuery)) return routeQuery;
  if (typeof window === "undefined") return routeQuery;

  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return routeQuery;

  const fromLocation = Object.fromEntries(params.entries());
  return hasBookingDeepLinkParams(fromLocation) ? fromLocation : routeQuery;
}

export function parseBookingDeepLink(
  query: Record<string, unknown>,
): BookingDeepLinkPayload | null {
  const dates = getDeepLinkDateStrings(query);
  if (!dates) return null;

  let checkIn: Date;
  let checkOut: Date;
  try {
    checkIn = parseDateApi(dates.checkIn);
    checkOut = parseDateApi(dates.checkOut);
  } catch {
    return null;
  }

  if (checkOut.getTime() <= checkIn.getTime()) return null;

  const rooms = Math.min(
    Math.max(parseNonNegativeInt(getRouteQueryString(query, "rooms"), 1), 1),
    MAX_ROOMS,
  );

  return {
    date: [checkIn, checkOut],
    guests: {
      rooms,
      roomList: buildRoomList(
        rooms,
        getRouteQueryString(query, "adults"),
        getRouteQueryString(query, "children"),
        getRouteQueryString(query, "child_ages"),
      ),
    },
    promoCode: getRouteQueryString(query, "promo"),
  };
}

export function omitBookingDeepLinkQuery(
  query: Record<string, unknown>,
): Record<string, string> {
  const next: Record<string, string> = {};
  const skip = new Set<string>(BOOKING_DEEP_LINK_QUERY_KEYS);

  for (const [key, value] of Object.entries(query)) {
    if (skip.has(key)) continue;
    if (typeof value === "string" && value.trim() !== "") {
      next[key] = value;
    }
  }

  return next;
}

type BookingDeepLinkStore = {
  setDate: (value: [Date, Date] | null) => void;
  setGuests: (value: BookingDeepLinkPayload["guests"]) => void;
  setPromoCode: (value: string) => void;
};

export function applyBookingDeepLinkPayload(
  store: BookingDeepLinkStore,
  payload: BookingDeepLinkPayload,
) {
  store.setDate(payload.date);
  store.setGuests(payload.guests);
  if (payload.promoCode) {
    store.setPromoCode(payload.promoCode);
  }
}

type ApplyBookingDeepLinkDeps = {
  query: Record<string, unknown>;
  path: string;
  hash?: string;
  store: BookingDeepLinkStore;
  routerReplace: (location: {
    path: string;
    hash?: string;
    query: Record<string, string>;
  }) => Promise<unknown>;
};

/**
 * Query с ukraina-hotel.ru → store формы.
 *
 * Возвращает `true` только когда payload распарсен и применён к store
 * (URL чистится в любом случае, если параметры deep-link есть).
 * Автопоиск запускает страница по флагу BOOKING_DEEP_LINK_PENDING_SEARCH_KEY —
 * иначе поиск остаётся только по кнопке «Поиск».
 */
export async function applyBookingDeepLinkFromQuery(
  deps: ApplyBookingDeepLinkDeps,
): Promise<boolean> {
  if (!hasBookingDeepLinkParams(deps.query)) return false;

  const payload = parseBookingDeepLink(deps.query);

  await deps.routerReplace({
    path: deps.path,
    hash: deps.hash || undefined,
    query: omitBookingDeepLinkQuery(deps.query),
  });

  if (!payload) return false;

  applyBookingDeepLinkPayload(deps.store, payload);
  return true;
}
