import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useBookingStore } from "~/stores/booking";
import { useAuthStore } from "~/stores/auth";
import { formatDateApi } from "~/utils/dateFormat";

const mockPost = vi.fn();

vi.stubGlobal("useApi", () => ({
  get: vi.fn(),
  post: mockPost,
  put: vi.fn(),
  delete: vi.fn(),
}));

/** Поля, которые не должны попадать в localStorage после pick */
const BOOKING_EPHEMERAL_KEYS = [
  "searchResults",
  "roomTariffs",
  "currentBookingDetails",
  "loading",
  "isServerRequest",
  "error",
] as const;

function setupPersistedPinia() {
  const app = createApp({ render: () => null });
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  setActivePinia(pinia);
}

function futureDateRange(): [Date, Date] {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return [start, end];
}

function readStore(key: string): Record<string, unknown> {
  const raw = window.localStorage.getItem(key);
  expect(raw).toBeTruthy();
  return JSON.parse(raw!) as Record<string, unknown>;
}

describe("store persist pick", () => {
  beforeEach(() => {
    window.localStorage.clear();
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

  afterEach(() => {
    window.localStorage.clear();
  });

  it("после search() в booking-store нет эфемерных и объёмных полей", async () => {
    setupPersistedPinia();
    const store = useBookingStore();
    store.setDate(futureDateRange());

    await store.search();
    store.$persist();

    const persisted = readStore("booking-store");

    for (const key of BOOKING_EPHEMERAL_KEYS) {
      expect(persisted).not.toHaveProperty(key);
    }
    expect(persisted).toHaveProperty("date");
    expect(persisted).toHaveProperty("guests");
  });

  it("в auth-store персистятся только user и token", () => {
    setupPersistedPinia();
    const store = useAuthStore();

    store.setAuthData("access-token", {
      id: 1,
      email: "a@b.c",
      name: "Ann",
      surname: "Bee",
      phone: "+7000",
      country: "RU",
    });
    store.setLoading(true);
    store.setError("boom");
    store.$persist();

    const persisted = readStore("auth-store");

    expect(Object.keys(persisted).sort()).toEqual(["token", "user"]);
    expect(persisted.token).toBe("access-token");
  });

  it("гидратация booking из слепка с loading: true даёт loading === false", () => {
    window.localStorage.setItem(
      "booking-store",
      JSON.stringify({
        loading: true,
        isServerRequest: true,
        searchResults: { rooms: [{ room_type_code: "X" }] },
        date: ["2030-01-10T12:00:00.000Z", "2030-01-12T12:00:00.000Z"],
        guests: {
          rooms: 1,
          roomList: [{ adults: 2, children: 0, childrenAges: [] }],
        },
        promoCode: "SAVE",
      }),
    );

    setupPersistedPinia();
    const store = useBookingStore();

    expect(store.loading).toBe(false);
    expect(store.isServerRequest).toBe(false);
    expect(store.searchResults).toBeNull();
    expect(store.promoCode).toBe("SAVE");
    expect(store.guests.rooms).toBe(1);
    expect(store.date?.[0]).toBeInstanceOf(Date);
    expect(store.date?.[1]).toBeInstanceOf(Date);
  });

  it("round-trip date: Date[] → локальный YYYY-MM-DD → валидные Date", () => {
    const range = futureDateRange();

    setupPersistedPinia();
    const store = useBookingStore();
    store.setDate(range);
    store.$persist();

    const persisted = readStore("booking-store");
    expect(Array.isArray(persisted.date)).toBe(true);
    const [startDay, endDay] = persisted.date as string[];
    expect(startDay).toBe(formatDateApi(range[0]));
    expect(endDay).toBe(formatDateApi(range[1]));
    expect(startDay).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    setupPersistedPinia();
    const restored = useBookingStore();

    expect(restored.date).not.toBeNull();
    expect(restored.date?.[0]).toBeInstanceOf(Date);
    expect(restored.date?.[1]).toBeInstanceOf(Date);
    expect(formatDateApi(restored.date![0])).toBe(formatDateApi(range[0]));
    expect(formatDateApi(restored.date![1])).toBe(formatDateApi(range[1]));
  });

  it("гидратация старого ISO-слепка даёт локальный календарный день", () => {
    // Локальная полночь 15.08 → в UTC+ часто ISO с датой 14.08
    const localStart = new Date(2030, 7, 15, 0, 0, 0);
    const localEnd = new Date(2030, 7, 16, 0, 0, 0);
    window.localStorage.setItem(
      "booking-store",
      JSON.stringify({
        date: [localStart.toISOString(), localEnd.toISOString()],
        guests: {
          rooms: 1,
          roomList: [{ adults: 2, children: 0, childrenAges: [] }],
        },
      }),
    );

    setupPersistedPinia();
    const store = useBookingStore();

    expect(formatDateApi(store.date![0])).toBe("2030-08-15");
    expect(formatDateApi(store.date![1])).toBe("2030-08-16");
  });

  it("selectedTariff персистится без description / cancellation_popover", () => {
    setupPersistedPinia();
    const store = useBookingStore();
    store.setSelectedTariff({
      rate_plan_code: "BAR",
      title: "Flexible",
      price: 41000,
      packages: [],
      description: "<p>very long html that must not bloat storage</p>",
      cancellation_popover: { title: "Cancel", description: "details" },
    });
    store.$persist();

    const persisted = readStore("booking-store");
    const tariff = persisted.selectedTariff as Record<string, unknown>;
    expect(tariff.rate_plan_code).toBe("BAR");
    expect(tariff).not.toHaveProperty("description");
    expect(tariff).not.toHaveProperty("cancellation_popover");
  });

  it("changeRoomUuid / changeServicesUuid персистятся и очищаются forceReset", () => {
    setupPersistedPinia();
    const store = useBookingStore();
    store.setChangeRoomUuid("room-uuid");
    store.setChangeServicesUuid("services-uuid");
    store.$persist();

    const persisted = readStore("booking-store");
    expect(persisted.changeRoomUuid).toBe("room-uuid");
    expect(persisted.changeServicesUuid).toBe("services-uuid");

    store.forceReset();
    store.$persist();

    const afterReset = readStore("booking-store");
    expect(afterReset.changeRoomUuid ?? null).toBeNull();
    expect(afterReset.changeServicesUuid ?? null).toBeNull();
    expect(store.changeRoomUuid).toBeNull();
    expect(store.changeServicesUuid).toBeNull();
  });
});
