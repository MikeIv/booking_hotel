import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useBookingStore } from "~/stores/booking";

const mockPost = vi.fn();

vi.stubGlobal("useApi", () => ({
  get: vi.fn(),
  post: mockPost,
  put: vi.fn(),
  delete: vi.fn(),
}));

function futureDateRange(): [Date, Date] {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return [start, end];
}

describe("booking store selections sync", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockPost.mockResolvedValue({
      success: true,
      payload: {
        rooms: [
          {
            room_type_code: "STD",
            title: "Standard",
            min_price: 5000,
            tariffs: [{ rate_plan_code: "BAR", title: "BAR", price: 5000 }],
          },
        ],
        packages: [],
        available: true,
      },
      message: null,
    });
  });

  it("forceReset очищает selectedTariff и packages", () => {
    const store = useBookingStore();
    store.setSelectedTariff({
      rate_plan_code: "BAR",
      title: "BAR",
      price: 5000,
      packages: [],
    });
    store.packages = [
      {
        package_code: "P1",
        title: "Pkg",
        description: null,
        photos: [],
        price: "100",
        calculation_rate_title: "шт",
      },
    ];

    store.forceReset();

    expect(store.selectedTariff).toBeNull();
    expect(store.packages).toEqual([]);
    expect(store.selectedMultiRooms).toEqual({});
  });

  it("setGuests(1) очищает leftover selectedMultiRooms", () => {
    const store = useBookingStore();
    store.setGuests({
      rooms: 2,
      roomList: [
        { adults: 1, children: 0, childrenAges: [] },
        { adults: 1, children: 0, childrenAges: [] },
      ],
    });
    store.setSelectedMultiRooms({
      "0-0": {
        roomIdx: 0,
        roomCardIdx: 0,
        roomTitle: "A",
        room_type_code: "A",
        ratePlanCode: "BAR",
        price: 1000,
        title: "BAR",
      },
      "0-1": {
        roomIdx: 1,
        roomCardIdx: 0,
        roomTitle: "B",
        room_type_code: "B",
        ratePlanCode: "BAR",
        price: 2000,
        title: "BAR",
      },
    });
    store.addService({ id: 1, title: "SPA", price: 500 }, 1);

    store.setGuests({
      rooms: 1,
      roomList: [{ adults: 1, children: 0, childrenAges: [] }],
    });

    expect(store.selectedMultiRooms).toEqual({});
    expect(store.selectedServicesByRoom).toEqual({});
  });

  it("setGuests shrink multi (3→2) сбрасывает multi-выбор (сдвиг индексов)", () => {
    const store = useBookingStore();
    store.setGuests({
      rooms: 3,
      roomList: [
        { adults: 1, children: 0, childrenAges: [] },
        { adults: 1, children: 0, childrenAges: [] },
        { adults: 1, children: 0, childrenAges: [] },
      ],
    });
    store.setSelectedMultiRooms({
      "0-0": {
        roomIdx: 0,
        roomCardIdx: 0,
        roomTitle: "A",
        room_type_code: "A",
        ratePlanCode: "BAR",
        price: 1000,
        title: "BAR",
      },
    });

    store.setGuests({
      rooms: 2,
      roomList: [
        { adults: 1, children: 0, childrenAges: [] },
        { adults: 1, children: 0, childrenAges: [] },
      ],
    });

    expect(store.selectedMultiRooms).toEqual({});
  });

  it("search() при 1 номере очищает leftover selectedMultiRooms", async () => {
    const store = useBookingStore();
    store.setDate(futureDateRange());
    store.setGuests({
      rooms: 1,
      roomList: [{ adults: 1, children: 0, childrenAges: [] }],
    });
    store.setSelectedMultiRooms({
      "0-0": {
        roomIdx: 0,
        roomCardIdx: 0,
        roomTitle: "A",
        room_type_code: "A",
        ratePlanCode: "BAR",
        price: 1000,
        title: "BAR",
      },
    });

    await store.search();

    expect(store.selectedMultiRooms).toEqual({});
  });
});
