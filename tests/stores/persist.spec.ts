import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useBookingStore } from "~/stores/booking";
import { useAuthStore } from "~/stores/auth";

const mockPost = vi.fn();

vi.stubGlobal("useApi", () => ({
  get: vi.fn(),
  post: mockPost,
  put: vi.fn(),
  delete: vi.fn(),
}));

function setupPersistedPinia() {
  const app = createApp({ render: () => null });
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  setActivePinia(pinia);
  return pinia;
}

function futureDateRange(): [Date, Date] {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return [start, end];
}

describe("store persist pick", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockPost.mockResolvedValue({
      success: true,
      payload: {
        rooms: [
          {
            room_type_code: "STD",
            title: "Standard",
            description: "Room",
            max_occupancy: 2,
            square: 20,
            rooms: 1,
            amenities: [],
            min_price: 5000,
            photos: [],
            tariffs: [
              {
                rate_plan_code: "BAR",
                title: "BAR",
                price: 5000,
                price_per_night: 5000,
              },
            ],
          },
        ],
        packages: [],
        available: true,
      },
      message: null,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("после search() в booking-store нет эфемерных и объёмных полей", async () => {
    setupPersistedPinia();
    const store = useBookingStore();
    store.setDate(futureDateRange());

    await store.search();
    store.$persist();

    const raw = localStorage.getItem("booking-store");
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw!) as Record<string, unknown>;

    expect(persisted).not.toHaveProperty("searchResults");
    expect(persisted).not.toHaveProperty("roomTariffs");
    expect(persisted).not.toHaveProperty("currentBookingDetails");
    expect(persisted).not.toHaveProperty("loading");
    expect(persisted).not.toHaveProperty("isServerRequest");
    expect(persisted).not.toHaveProperty("error");
    expect(persisted).not.toHaveProperty("apiError");
    expect(persisted).not.toHaveProperty("userProfiles");

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

    const persisted = JSON.parse(localStorage.getItem("auth-store")!) as Record<
      string,
      unknown
    >;

    expect(Object.keys(persisted).sort()).toEqual(["token", "user"].sort());
    expect(persisted.token).toBe("access-token");
    expect(persisted).not.toHaveProperty("loading");
    expect(persisted).not.toHaveProperty("error");
  });

  it("гидратация booking из слепка с loading: true даёт loading === false", () => {
    localStorage.setItem(
      "booking-store",
      JSON.stringify({
        loading: true,
        isServerRequest: true,
        searchResults: { rooms: [{ room_type_code: "X" }] },
        date: [
          new Date("2030-01-10T12:00:00.000Z").toISOString(),
          new Date("2030-01-12T12:00:00.000Z").toISOString(),
        ],
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
  });
});
