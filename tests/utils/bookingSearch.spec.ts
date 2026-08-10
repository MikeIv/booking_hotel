import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useBookingStore } from "~/stores/booking";
import {
  normalizeSearchPayload,
  prepareSearchData,
} from "~/utils/bookingSearch";
import type { ApiSearchPayload, SearchResponse } from "~/types/booking";

const mockPost = vi.fn();

vi.stubGlobal("useApi", () => ({
  get: vi.fn(),
  post: mockPost,
  put: vi.fn(),
  delete: vi.fn(),
}));

const EMPTY_FILTERS = {
  beds: [] as never[],
  views: [] as never[],
  balconies: [] as never[],
};

const FIXTURES = {
  empty: undefined as ApiSearchPayload,
  roomTariff: {
    room: {
      room_type_code: "STD",
      title: "Стандарт",
      min_price: "4500",
      tariffs: [
        {
          rate_plan_code: "BAR",
          title: "Базовый",
          price: "4500",
          cancellation_free: true,
          cancellation_description: "Отмена до 18:00",
          packages: [],
        },
      ],
    },
    packages: [
      {
        package_code: "BF",
        title: "Завтрак",
        description: null,
        photos: [],
        price: "500",
        calculation_rate_title: "за гостя",
      },
    ],
    tariff_groups: [{ id: 1, title: "Базовый" }],
  },
  grouped: {
    rooms: [
      {
        title: "Семейный",
        description: "Группа",
        max_occupancy: 4,
        square: 40,
        rooms: 1,
        amenities: [{ title: "Wi-Fi" }],
        min_price: 8000,
        photos: ["a.jpg"],
        beds: [
          {
            room_type_code: "FAM-TWIN",
            title: "Twin",
            min_price: 8000,
            family: { id: 10, title: "Семейный" },
            tariffs: [
              {
                rate_plan_code: "BAR",
                title: "BAR",
                price: 8000,
                packages: [],
              },
            ],
          },
        ],
      },
      {
        title: "Семейный (dup)",
        description: null,
        max_occupancy: 4,
        square: 42,
        rooms: 1,
        amenities: [],
        min_price: 7500,
        photos: [],
        beds: [
          {
            room_type_code: "FAM-DBL",
            title: "Double",
            min_price: 7500,
            family: { id: 10, title: "Семейный" },
            tariffs: [
              {
                rate_plan_code: "NR",
                title: "NR",
                price: 7500,
                packages: [],
              },
            ],
          },
        ],
      },
    ],
    filters: {
      beds: [{ id: 1, title: "Twin" }],
      views: [],
      balconies: [],
    },
  },
  ungrouped: {
    rooms: [
      {
        room_type_code: "STD",
        title: "Стандарт",
        min_price: 5000,
        tariffs: [
          {
            rate_plan_code: "BAR",
            title: "BAR",
            price: 5000,
            packages: [],
            room_prices: [
              {
                room_index: "0",
                room_number: 1,
                room_type_code: "STD",
                rate_plan_code: "BAR",
                price: "5000",
              },
            ],
          },
        ],
      },
    ],
    packages: [],
    filters: EMPTY_FILTERS,
  },
  legacyArray: [
    {
      title: "Люкс",
      description: null,
      max_occupancy: 2,
      square: 50,
      rooms: 1,
      amenities: [],
      min_price: null,
      photos: [],
      room_type_codes: [
        {
          room_type_code: "LUX",
          title: "Люкс",
          tariffs: [
            {
              rate_plan_code: "BAR",
              title: "BAR",
              price: 12000,
              packages: [],
            },
          ],
        },
      ],
    },
  ],
  emptyRooms: {
    rooms: [],
    packages: [],
    filters: EMPTY_FILTERS,
  },
} satisfies Record<string, ApiSearchPayload>;

function futureDateRange(): [Date, Date] {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return [start, end];
}

function formatLocalYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seedStore(overrides?: {
  adults?: number;
  children?: number;
  childrenAges?: number[];
  rooms?: { adults: number; children: number; childrenAges: number[] }[];
  promoCode?: string;
}) {
  setActivePinia(createPinia());
  const store = useBookingStore();
  store.setDate(futureDateRange());
  const roomList = overrides?.rooms ?? [
    {
      adults: overrides?.adults ?? 2,
      children: overrides?.children ?? 0,
      childrenAges: overrides?.childrenAges ?? [],
    },
  ];
  store.setGuests({
    rooms: roomList.length,
    roomList,
  });
  if (overrides?.promoCode !== undefined) {
    store.setPromoCode(overrides.promoCode);
  }
  return store;
}

async function searchWithPayload(
  payload: ApiSearchPayload,
  guests?: Parameters<typeof seedStore>[0],
): Promise<SearchResponse> {
  mockPost.mockResolvedValueOnce({
    success: true,
    payload,
    message: null,
  });
  const store = seedStore(guests);
  return store.search();
}

describe("normalizeSearchPayload (pure)", () => {
  it("формат 1: falsy payload → пустой SearchResponse", () => {
    expect(normalizeSearchPayload(FIXTURES.empty, true)).toEqual({
      available: false,
      rooms: [],
      packages: [],
      filters: EMPTY_FILTERS,
      groupedByBed: true,
      rawPayload: undefined,
    });
  });

  it("формат 2: ApiRoomTariffPayload", () => {
    const result = normalizeSearchPayload(FIXTURES.roomTariff, true);
    expect(result.available).toBe(true);
    expect(result.groupedByBed).toBe(false);
    expect(result.tariffGroups).toEqual([{ id: 1, title: "Базовый" }]);
    expect(result.rooms[0]).toMatchObject({
      room_type_code: "STD",
      min_price: 4500,
    });
    expect(result.rooms[0]?.tariffs[0]).toMatchObject({
      price: 4500,
      cancellation_popover: {
        title: "Бесплатная отмена",
        description: "Отмена до 18:00",
      },
    });
  });

  it("формат 3: grouped + merge дубликатов", () => {
    const result = normalizeSearchPayload(FIXTURES.grouped, true);
    expect(result.rooms).toHaveLength(1);
    expect(result.rooms[0]?.min_price).toBe(7500);
    expect(
      result.rooms[0]?.room_type_codes?.map((v) => v.room_type_code).sort(),
    ).toEqual(["FAM-DBL", "FAM-TWIN"]);
  });

  it("формат 4: ungrouped + string room_index", () => {
    const result = normalizeSearchPayload(FIXTURES.ungrouped, false);
    expect(result.groupedByBed).toBe(false);
    expect(result.rooms[0]?.tariffs[0]?.room_prices?.[0]).toMatchObject({
      room_index: 0,
      price: 5000,
    });
  });

  it("формат 5: legacy array", () => {
    const result = normalizeSearchPayload(FIXTURES.legacyArray, true);
    expect(result.rooms[0]).toMatchObject({
      room_type_code: "LUX",
      min_price: null,
    });
    expect(result.filters).toEqual(EMPTY_FILTERS);
  });

  it("пустой rooms → available false", () => {
    expect(normalizeSearchPayload(FIXTURES.emptyRooms, true)).toMatchObject({
      available: false,
      rooms: [],
      groupedByBed: false,
    });
  });
});

describe("normalizeSearchPayload store ↔ pure parity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["empty", FIXTURES.empty, true],
    ["roomTariff", FIXTURES.roomTariff, true],
    ["grouped", FIXTURES.grouped, true],
    ["legacyArray", FIXTURES.legacyArray, true],
    ["emptyRooms", FIXTURES.emptyRooms, true],
  ] as const)("%s: store.search === pure", async (_name, payload, grouped) => {
    const fromStore = await searchWithPayload(payload);
    const fromPure = normalizeSearchPayload(payload, grouped);
    expect(fromStore).toEqual(fromPure);
  });

  it("ungrouped multi: store.search === pure", async () => {
    const fromStore = await searchWithPayload(FIXTURES.ungrouped, {
      rooms: [
        { adults: 2, children: 0, childrenAges: [] },
        { adults: 1, children: 0, childrenAges: [] },
      ],
    });
    const fromPure = normalizeSearchPayload(FIXTURES.ungrouped, false);
    expect(fromStore).toEqual(fromPure);
  });
});

describe("prepareSearchData (pure)", () => {
  it("один номер + promo + ages", () => {
    const [start, end] = futureDateRange();
    const { searchData, groupedByBed } = prepareSearchData({
      startDate: start,
      endDate: end,
      roomList: [{ adults: 2, children: 1, childrenAges: [5] }],
      promoCode: "SAVE",
    });

    expect(groupedByBed).toBe(true);
    expect(searchData).toMatchObject({
      start_at: formatLocalYmd(start),
      end_at: formatLocalYmd(end),
      promocode: "SAVE",
      multi_booking_mode: false,
      grouped_by_bed: true,
      room_type_code: null,
      guests: [{ adults: 2, childs: [5] }],
    });
  });

  it("несколько номеров + pad ages", () => {
    const [start, end] = futureDateRange();
    const { searchData, groupedByBed } = prepareSearchData({
      startDate: start,
      endDate: end,
      roomList: [
        { adults: 2, children: 0, childrenAges: [] },
        { adults: 1, children: 2, childrenAges: [3] },
      ],
    });

    expect(groupedByBed).toBe(false);
    expect(searchData.multi_booking_mode).toBe(true);
    expect(searchData.guests).toEqual([
      { adults: 2, childs: [] },
      { adults: 1, childs: [3, 0] },
    ]);
  });

  it("clamp гостей до 15", () => {
    const [start, end] = futureDateRange();
    const { searchData } = prepareSearchData({
      startDate: start,
      endDate: end,
      roomList: [
        {
          adults: 12,
          children: 8,
          childrenAges: [1, 2, 3, 4, 5, 6, 7, 8],
        },
      ],
    });
    expect(searchData.guests).toEqual([{ adults: 12, childs: [1, 2, 3] }]);
  });

  it("roomIndex → только выбранный номер", () => {
    const [start, end] = futureDateRange();
    const { searchData, groupedByBed } = prepareSearchData({
      startDate: start,
      endDate: end,
      roomList: [
        { adults: 2, children: 0, childrenAges: [] },
        { adults: 1, children: 1, childrenAges: [4] },
      ],
      roomIndex: 1,
      roomTypeCode: "STD",
    });

    expect(groupedByBed).toBe(true);
    expect(searchData.multi_booking_mode).toBe(false);
    expect(searchData.room_type_code).toBe("STD");
    expect(searchData.guests).toEqual([{ adults: 1, childs: [4] }]);
  });
});

describe("prepareSearchData store ↔ pure parity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPost.mockResolvedValue({
      success: true,
      payload: { rooms: [], filters: EMPTY_FILTERS },
      message: null,
    });
  });

  it("post body совпадает с pure prepareSearchData", async () => {
    const store = seedStore({
      adults: 2,
      children: 1,
      childrenAges: [5],
      promoCode: "SAVE",
    });
    const [start, end] = store.date!;
    await store.search();

    const body = mockPost.mock.calls[0]?.[1] as Record<string, unknown>;
    const { searchData } = prepareSearchData({
      startDate: start,
      endDate: end,
      roomList: store.guests.roomList,
      promoCode: store.promoCode,
    });
    expect(body).toEqual(searchData);
  });

  it("roomTypeCode добавляет grouped: true в store.search", async () => {
    const store = seedStore();
    await store.search({ roomTypeCode: "STD" });
    const body = mockPost.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(body.room_type_code).toBe("STD");
    expect(body.grouped).toBe(true);
  });
});
