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

  it("setGuests shrink multi (4→2) bulk хвост: prune без wipe", () => {
    const store = useBookingStore();
    const slot = { adults: 1, children: 0, childrenAges: [] };
    store.setGuests({
      rooms: 4,
      roomList: [slot, slot, slot, slot],
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
      "3-3": {
        roomIdx: 3,
        roomCardIdx: 3,
        roomTitle: "D",
        room_type_code: "D",
        ratePlanCode: "BAR",
        price: 4000,
        title: "BAR",
      },
    });

    store.setGuests({
      rooms: 2,
      roomList: [slot, slot],
    });

    expect(Object.keys(store.selectedMultiRooms)).toEqual(["0-0"]);
    expect(store.selectedMultiRooms["0-0"]?.roomIdx).toBe(0);
  });

  it("setGuests shrink multi (3→2) без hint → wipe при одинаковых слотах", () => {
    const store = useBookingStore();
    const slot = { adults: 1, children: 0, childrenAges: [] };
    store.setGuests({
      rooms: 3,
      roomList: [slot, slot, slot],
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
      roomList: [slot, slot],
    });

    expect(store.selectedMultiRooms).toEqual({});
  });

  it("setGuests shrink multi: hint removedRoomIdx → remap при одинаковых слотах", () => {
    const store = useBookingStore();
    const slot = { adults: 1, children: 0, childrenAges: [] };
    store.setGuests({
      rooms: 3,
      roomList: [slot, slot, slot],
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
      "2-2": {
        roomIdx: 2,
        roomCardIdx: 2,
        roomTitle: "C",
        room_type_code: "C",
        ratePlanCode: "BAR",
        price: 3000,
        title: "BAR",
      },
    });

    store.setGuests(
      {
        rooms: 2,
        roomList: [slot, slot],
      },
      { removedRoomIdx: 1 },
    );

    expect(store.selectedMultiRooms["0-0"]?.roomTitle).toBe("A");
    expect(store.selectedMultiRooms["2-1"]?.roomTitle).toBe("C");
    expect(store.selectedMultiRooms["2-1"]?.roomIdx).toBe(1);
  });

  it("setGuests shrink multi: hint trailingShrink → prune 3→2", () => {
    const store = useBookingStore();
    const slot = { adults: 1, children: 0, childrenAges: [] };
    store.setGuests({
      rooms: 3,
      roomList: [slot, slot, slot],
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
      "2-2": {
        roomIdx: 2,
        roomCardIdx: 2,
        roomTitle: "C",
        room_type_code: "C",
        ratePlanCode: "BAR",
        price: 3000,
        title: "BAR",
      },
    });

    store.setGuests(
      {
        rooms: 2,
        roomList: [slot, slot],
      },
      { trailingShrink: true },
    );

    expect(Object.keys(store.selectedMultiRooms)).toEqual(["0-0"]);
  });

  it("setGuests shrink multi: remap при однозначном deleteRoom (середина)", () => {
    const store = useBookingStore();
    store.setGuests({
      rooms: 3,
      roomList: [
        { adults: 1, children: 0, childrenAges: [] },
        { adults: 2, children: 0, childrenAges: [] },
        { adults: 1, children: 1, childrenAges: [5] },
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
      "1-1": {
        roomIdx: 1,
        roomCardIdx: 1,
        roomTitle: "B",
        room_type_code: "B",
        ratePlanCode: "BAR",
        price: 2000,
        title: "BAR",
      },
      "2-2": {
        roomIdx: 2,
        roomCardIdx: 2,
        roomTitle: "C",
        room_type_code: "C",
        ratePlanCode: "BAR",
        price: 3000,
        title: "BAR",
      },
    });
    store.addService({ id: 1, title: "SPA", price: 500 }, 2);

    // deleteRoom(1): убрали средний уникальный слот
    store.setGuests({
      rooms: 2,
      roomList: [
        { adults: 1, children: 0, childrenAges: [] },
        { adults: 1, children: 1, childrenAges: [5] },
      ],
    });

    expect(store.selectedMultiRooms["0-0"]?.roomIdx).toBe(0);
    expect(store.selectedMultiRooms["2-1"]?.roomIdx).toBe(1);
    expect(store.selectedMultiRooms["2-1"]?.roomTitle).toBe("C");
    expect(store.selectedMultiRooms["1-1"]).toBeUndefined();
    expect(store.selectedServicesByRoom["1"]).toEqual([
      { id: 1, title: "SPA", price: 500 },
    ]);
    expect(store.selectedServicesByRoom["2"]).toBeUndefined();
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
