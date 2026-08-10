import type { Room, RoomTariff, TariffGroup } from "~/types/room";
import type {
  SearchResponse,
  ApiRoomTariff,
  ApiRoomType,
  ApiGroupedRoom,
  ApiGroupedPayload,
  ApiUngroupedPayload,
  ApiRoomTariffPayload,
  ApiSearchPayload,
} from "~/types/booking";
import { normalizeRoomIndex } from "~/utils/multiBooking";
import { formatDateApi } from "~/utils/dateFormat";

/** Максимум гостей (взрослые + дети) в одном номере — синхрон с GuestsSelector */
export const MAX_GUESTS_PER_ROOM = 15;

export type SearchGuestRoom = {
  adults: number;
  children: number;
  childrenAges: number[];
};

export type PrepareSearchDataInput = {
  startDate: Date;
  endDate: Date;
  roomList: SearchGuestRoom[];
  promoCode?: string | null;
  roomTypeCode?: string;
  roomIndex?: number;
};

const EMPTY_FILTERS: SearchResponse["filters"] = {
  beds: [],
  views: [],
  balconies: [],
};

function ensureChildAges(count: number, ages: number[]): number[] {
  if (count === 0) return [];
  if (ages.length === count) return ages;
  return Array.from({ length: count }, (_, index) => ages[index] ?? 0);
}

function clampRoomGuests(adults: number, children: number) {
  let a = adults;
  let c = children;
  if (a + c > MAX_GUESTS_PER_ROOM) {
    a = Math.min(a, MAX_GUESTS_PER_ROOM);
    c = Math.max(0, MAX_GUESTS_PER_ROOM - a);
  }
  return { adults: a, children: c };
}

function toGuestPayload(room: SearchGuestRoom) {
  const { adults, children } = clampRoomGuests(room.adults, room.children);
  return {
    adults,
    childs: ensureChildAges(
      children,
      (room.childrenAges ?? []).slice(0, children),
    ),
  };
}

function normalizeMinPrice(
  price: number | string | null | undefined,
): number | null {
  if (price === null || price === undefined) return null;
  if (typeof price === "string") {
    const trimmed = price.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return price;
}

function toPriceNumber(price: number | string): number {
  return typeof price === "string" ? Number(price) : price;
}

function resolveRoomTypeCode(
  code: string | undefined,
  groupTitle: string,
): string | null {
  if (code && code.trim() !== "" && code !== groupTitle) return code;
  return null;
}

function mapTariffs(tariffs?: ApiRoomTariff[]): RoomTariff[] {
  if (!tariffs || tariffs.length === 0) return [];
  return tariffs.map((tariff) => {
    let cancellation_popover:
      | { title?: string; description?: string }
      | undefined;
    if (tariff.cancellation_popover) {
      cancellation_popover = tariff.cancellation_popover;
    } else if (tariff.cancellation_description && tariff.cancellation_free) {
      cancellation_popover = {
        title: "Бесплатная отмена",
        description: tariff.cancellation_description,
      };
    }

    return {
      rate_plan_code: tariff.rate_plan_code,
      title: tariff.title,
      price: toPriceNumber(tariff.price),
      price_for_register: tariff.price_for_register,
      room_prices: tariff.room_prices?.map((roomPrice) => ({
        room_index: normalizeRoomIndex(roomPrice.room_index),
        room_number: roomPrice.room_number,
        room_type_code: roomPrice.room_type_code,
        rate_plan_code: roomPrice.rate_plan_code,
        price: toPriceNumber(roomPrice.price),
        price_for_register: roomPrice.price_for_register,
        packages: roomPrice.packages,
      })),
      packages: tariff.packages ?? [],
      has_food: tariff.has_food,
      cancellation_free: tariff.cancellation_free,
      payment_types: tariff.payment_types ?? [],
      description:
        tariff.description ?? tariff.cancellation_description ?? null,
      cancellation_popover,
      group: tariff.group
        ? { id: tariff.group.id, title: tariff.group.title }
        : undefined,
    };
  });
}

function mapRoom(room: ApiRoomType, group?: ApiGroupedRoom): Room {
  return {
    id: room.id ?? room.room_type_code,
    room_type_code: room.room_type_code,
    title: room.title ?? group?.title ?? "",
    description: room.description ?? group?.description ?? null,
    max_occupancy: room.max_occupancy ?? group?.max_occupancy ?? 0,
    square: room.square ?? group?.square ?? 0,
    rooms: room.rooms ?? group?.rooms ?? 0,
    amenities:
      room.amenities && room.amenities.length > 0
        ? room.amenities
        : (group?.amenities ?? []),
    bed: room.bed ?? null,
    view: room.view ?? null,
    balcony: room.balcony ?? null,
    family: room.family ?? null,
    min_price: normalizeMinPrice(room.min_price ?? group?.min_price),
    price_for_register:
      room.price_for_register ?? group?.price_for_register ?? undefined,
    photos:
      room.photos && room.photos.length > 0
        ? room.photos
        : (group?.photos ?? []),
    tariffs: mapTariffs(room.tariffs),
    group_title: group?.title,
    group_description: group?.description ?? null,
  };
}

function mapGroupedRoom(group: ApiGroupedRoom): Room {
  const variantsSource = group.beds ?? group.room_type_codes ?? [];
  const variants = variantsSource.map((variant) => mapRoom(variant, group));
  const primaryVariant = variants[0];

  const roomTypeCode =
    resolveRoomTypeCode(primaryVariant?.room_type_code, group.title) ?? "";

  const tariffsSet = new Map<string, RoomTariff>();
  for (const variant of variants) {
    for (const tariff of variant.tariffs ?? []) {
      if (!tariffsSet.has(tariff.rate_plan_code)) {
        tariffsSet.set(tariff.rate_plan_code, tariff);
      }
    }
  }

  return {
    id: primaryVariant?.id ?? group.title,
    room_type_code: roomTypeCode,
    title: group.title ?? primaryVariant?.title ?? "",
    description: group.description ?? primaryVariant?.description ?? null,
    max_occupancy: group.max_occupancy ?? primaryVariant?.max_occupancy ?? 0,
    square: group.square ?? primaryVariant?.square ?? 0,
    rooms: group.rooms ?? primaryVariant?.rooms ?? 0,
    amenities:
      group.amenities && group.amenities.length > 0
        ? group.amenities
        : (primaryVariant?.amenities ?? []),
    bed: primaryVariant?.bed ?? null,
    view: primaryVariant?.view ?? null,
    balcony: primaryVariant?.balcony ?? null,
    family: primaryVariant?.family ?? null,
    min_price: normalizeMinPrice(group.min_price ?? primaryVariant?.min_price),
    price_for_register:
      group.price_for_register ?? primaryVariant?.price_for_register,
    photos:
      group.photos && group.photos.length > 0
        ? group.photos
        : (primaryVariant?.photos ?? []),
    tariffs: Array.from(tariffsSet.values()),
    room_type_codes: variants,
    group_title: group.title,
    group_description: group.description ?? null,
  } satisfies Room;
}

function extractTariffGroups(
  payload: ApiSearchPayload,
): TariffGroup[] | undefined {
  if (!payload || Array.isArray(payload) || !("tariff_groups" in payload)) {
    return undefined;
  }

  const groups = payload.tariff_groups;
  if (!groups?.length) return undefined;

  return groups.map(({ id, title }) => ({ id, title }));
}

/**
 * Объединяет дубликат Room при группировке:
 * мержит варианты (room_type_codes), обновляет min_price, фото и удобства.
 */
function mergeGroupedRoom(existing: Room, incoming: Room): void {
  const variantMap = new Map<string, Room>();
  (existing.room_type_codes ?? []).forEach((v, i) => {
    variantMap.set(v.room_type_code ?? v.id?.toString() ?? `v-${i}`, v);
  });
  (incoming.room_type_codes ?? []).forEach((v, i) => {
    variantMap.set(v.room_type_code ?? v.id?.toString() ?? `v-new-${i}`, v);
  });
  existing.room_type_codes = Array.from(variantMap.values());

  const incomingPrice = normalizeMinPrice(incoming.min_price);
  if (existing.min_price === null) {
    existing.min_price = incomingPrice;
  } else if (incomingPrice !== null) {
    existing.min_price = Math.min(existing.min_price, incomingPrice);
  }

  if (
    existing.price_for_register === undefined ||
    (incoming.price_for_register !== undefined &&
      incoming.price_for_register < existing.price_for_register)
  ) {
    existing.price_for_register = incoming.price_for_register;
  }

  if (!existing.photos?.length && incoming.photos?.length) {
    existing.photos = incoming.photos;
  }
  if (!existing.amenities?.length && incoming.amenities?.length) {
    existing.amenities = incoming.amenities;
  }
}

/**
 * Преобразует список ApiGroupedRoom[] в SearchResponse, объединяя дубликаты по ключу семейства/группы.
 * Используется для форматов 3 (ApiGroupedPayload) и 5 (устаревший массив без фильтров).
 */
function processGroupedRooms(
  groups: ApiGroupedRoom[],
  rawPayload: ApiSearchPayload,
  filters?: SearchResponse["filters"],
): SearchResponse {
  const groupedRooms = new Map<string, Room>();

  groups.forEach((group, index) => {
    const room = mapGroupedRoom(group);

    const firstVariant = group.beds?.[0] ?? group.room_type_codes?.[0];
    const key =
      firstVariant?.family?.id?.toString() ??
      firstVariant?.family?.title ??
      group.title ??
      room.room_type_code ??
      `group-${index}`;

    const existing = groupedRooms.get(key);
    if (existing) {
      mergeGroupedRoom(existing, room);
    } else {
      groupedRooms.set(key, room);
    }
  });

  const rooms = Array.from(groupedRooms.values());
  return {
    available: rooms.length > 0,
    rooms,
    packages: [],
    filters: filters ?? EMPTY_FILTERS,
    groupedByBed: true,
    rawPayload,
  };
}

/**
 * Нормализует сырой ответ API поиска в унифицированный `SearchResponse`.
 *
 * Поддерживаемые форматы ответа:
 * 1. `undefined` / falsy — нет данных
 * 2. `ApiRoomTariffPayload` (`{ room, packages? }`) — один номер с тарифами (страница /rooms/tariff)
 * 3. `ApiGroupedPayload` (`{ rooms: ApiGroupedRoom[], filters }`) — сгруппированные номера
 * 4. `ApiUngroupedPayload` (`{ rooms: ApiRoomType[], filters, packages? }`) — плоский список (multi_booking_mode)
 * 5. `ApiGroupedRoom[]` — устаревший массив без фильтров
 */
export function normalizeSearchPayload(
  payload: ApiSearchPayload,
  groupedByBed: boolean,
): SearchResponse {
  if (!payload) {
    return {
      available: false,
      rooms: [],
      packages: [],
      filters: EMPTY_FILTERS,
      groupedByBed,
      rawPayload: payload,
    };
  }

  if (!Array.isArray(payload) && "room" in payload && payload.room) {
    const p = payload as ApiRoomTariffPayload;
    return {
      available: true,
      rooms: [mapRoom(p.room)],
      packages: p.packages ?? [],
      filters: EMPTY_FILTERS,
      groupedByBed: false,
      tariffGroups: extractTariffGroups(payload),
      rawPayload: payload,
    };
  }

  if (Array.isArray(payload)) {
    return processGroupedRooms(payload, payload);
  }

  if (
    "rooms" in payload &&
    Array.isArray(payload.rooms) &&
    "filters" in payload
  ) {
    const firstRoom = payload.rooms.find((r) => r != null);

    if (!firstRoom) {
      const p = payload as ApiUngroupedPayload;
      return {
        available: false,
        rooms: [],
        packages: p.packages ?? [],
        filters: p.filters ?? EMPTY_FILTERS,
        groupedByBed: false,
        rawPayload: payload,
      };
    }

    if ("beds" in firstRoom || "room_type_codes" in firstRoom) {
      const p = payload as ApiGroupedPayload;
      return processGroupedRooms(p.rooms, payload, p.filters);
    }

    const p = payload as ApiUngroupedPayload;
    return {
      available: p.rooms.length > 0,
      rooms: p.rooms.map((r) => mapRoom(r)),
      packages: p.packages ?? [],
      filters: p.filters ?? EMPTY_FILTERS,
      groupedByBed: false,
      rawPayload: payload,
    };
  }

  const p = payload as ApiUngroupedPayload;
  const rooms = (p.rooms ?? []).map((r) => mapRoom(r));
  return {
    available: rooms.length > 0,
    rooms,
    packages: p.packages ?? [],
    filters: p.filters ?? EMPTY_FILTERS,
    groupedByBed,
    rawPayload: payload,
  };
}

export function prepareSearchData(input: PrepareSearchDataInput) {
  const { startDate, endDate, roomList, promoCode, roomTypeCode, roomIndex } =
    input;

  const list = roomList ?? [];
  const isSingleRoomRequest = roomIndex !== undefined;
  const singleRoom = isSingleRoomRequest ? list[roomIndex] : undefined;
  const guestsPayload = isSingleRoomRequest
    ? singleRoom
      ? [toGuestPayload(singleRoom)]
      : []
    : list.map(toGuestPayload);

  const groupedByBed = guestsPayload.length <= 1;
  const multiBookingMode = !isSingleRoomRequest && guestsPayload.length > 1;

  const searchData: Record<string, unknown> = {
    start_at: formatDateApi(startDate),
    end_at: formatDateApi(endDate),
    promocode: promoCode || null,
    multi_booking_mode: multiBookingMode,
    grouped_by_bed: groupedByBed,
    room_type_code: roomTypeCode ?? null,
    guests: guestsPayload,
  };

  return { searchData, groupedByBed };
}
