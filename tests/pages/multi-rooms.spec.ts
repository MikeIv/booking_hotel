import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import MultiRoomsPage from "~/pages/multi-rooms.vue";
import { setupPinia, mountComponent } from "../utils/test-utils";
import { mockRouterPush, useStateStub } from "../mocks/nuxt";
import { createMockBookingStore, resetMockBookingStore } from "../mocks/stores";
import { BOOKING_DEEP_LINK_PENDING_SEARCH_KEY } from "~/utils/bookingDeepLink";

// Мокируем store
const mockBookingStore = createMockBookingStore();

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

/** Флаг автопоиска: тот же ключ, что поднимает плагин deep-link. */
function deepLinkFlag() {
  return useStateStub<boolean>(
    BOOKING_DEEP_LINK_PENDING_SEARCH_KEY,
    () => false,
  );
}

/** Состояние для /multi-rooms: даты и гости на два номера. */
function seedMultiRoomSearch() {
  mockBookingStore.date.value = [
    new Date("2026-04-10"),
    new Date("2026-04-13"),
  ];
  mockBookingStore.guests.value = {
    rooms: 2,
    roomList: [
      { adults: 2, children: 0, childrenAges: [] },
      { adults: 1, children: 0, childrenAges: [] },
    ],
  };
}

describe("pages/multi-rooms.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    mockRouterPush.mockResolvedValue(undefined);
    resetMockBookingStore(mockBookingStore);
  });

  describe("onMounted: deep-link и прелоадер", () => {
    it("должен вызывать search по флагу deep-link даже если тарифы уже есть", async () => {
      seedMultiRoomSearch();
      mockBookingStore.roomTariffs.value = [{ room_type_code: "TEST-001" }];
      deepLinkFlag().value = true;

      const _wrapper = mountComponent(MultiRoomsPage);
      await nextTick();

      expect(mockBookingStore.search).toHaveBeenCalled();
      expect(deepLinkFlag().value).toBe(false);
    });

    it("должен вызывать search если тарифы ещё не загружены", async () => {
      seedMultiRoomSearch();
      mockBookingStore.roomTariffs.value = [];

      const _wrapper = mountComponent(MultiRoomsPage);
      await nextTick();

      expect(mockBookingStore.search).toHaveBeenCalled();
    });

    it("не должен вызывать search если тарифы есть и флага нет", async () => {
      seedMultiRoomSearch();
      mockBookingStore.roomTariffs.value = [{ room_type_code: "TEST-001" }];

      const _wrapper = mountComponent(MultiRoomsPage);
      await nextTick();

      expect(mockBookingStore.search).not.toHaveBeenCalled();
    });

    it("должен гасить прелоадер и уводить на /rooms/tariff при одном номере", async () => {
      mockBookingStore.date.value = [
        new Date("2026-04-10"),
        new Date("2026-04-13"),
      ];
      mockBookingStore.guests.value = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      deepLinkFlag().value = true;

      const _wrapper = mountComponent(MultiRoomsPage);
      await nextTick();

      expect(mockRouterPush).toHaveBeenCalledWith("/rooms/tariff");
      expect(mockBookingStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockBookingStore.setServerRequest).toHaveBeenCalledWith(false);
      expect(deepLinkFlag().value).toBe(false);
      expect(mockBookingStore.search).not.toHaveBeenCalled();
    });

    it("должен гасить прелоадер и уводить на главную если нет дат", async () => {
      mockBookingStore.date.value = null;
      deepLinkFlag().value = true;

      const _wrapper = mountComponent(MultiRoomsPage);
      await nextTick();

      expect(mockRouterPush).toHaveBeenCalledWith("/");
      expect(mockBookingStore.setLoading).toHaveBeenCalledWith(false);
      expect(deepLinkFlag().value).toBe(false);
      expect(mockBookingStore.search).not.toHaveBeenCalled();
    });
  });
});
