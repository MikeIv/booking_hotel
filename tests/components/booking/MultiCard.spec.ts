import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import MultiCard from "~/components/booking/MultiCard.vue";
import { setupPinia, mountComponent } from "../../utils/test-utils";
import type { Room } from "~/types/room";

const guestsRef = ref({
  rooms: 2,
  roomList: [
    { adults: 2, children: 0, childrenAges: [] },
    { adults: 1, children: 0, childrenAges: [] },
  ],
});
const dateRef = ref<[Date, Date] | null>([
  new Date(2026, 5, 10),
  new Date(2026, 5, 12),
]);

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({
    guests: guestsRef,
    date: dateRef,
  }),
}));

function createRoom(overrides?: Partial<Room>): Room {
  return {
    room_type_code: "STD",
    title: "Стандарт Twin",
    description: "Описание",
    max_occupancy: 2,
    square: 22,
    rooms: 1,
    amenities: [{ title: "Wi-Fi" }],
    bed: { id: 1, title: "Twin" },
    view: null,
    balcony: null,
    family: null,
    min_price: 5000,
    photos: ["a.jpg"],
    tariffs: [
      {
        rate_plan_code: "BAR",
        title: "Базовый",
        price: 5000,
        packages: [],
        room_prices: [
          {
            room_index: 0,
            room_number: 1,
            room_type_code: "STD",
            rate_plan_code: "BAR",
            price: 5000,
          },
          {
            room_index: 1,
            room_number: 2,
            room_type_code: "STD",
            rate_plan_code: "BAR",
            price: 4800,
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("MultiCard.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    guestsRef.value = {
      rooms: 2,
      roomList: [
        { adults: 2, children: 0, childrenAges: [] },
        { adults: 1, children: 0, childrenAges: [] },
      ],
    };
  });

  function mountCard(
    props?: Partial<{
      room: Room;
      selectedCodes: Record<string, string>;
      roomCardIdx: number;
    }>,
  ) {
    return mountComponent(MultiCard, {
      props: {
        room: props?.room ?? createRoom(),
        selectedCodes: props?.selectedCodes ?? {},
        roomCardIdx: props?.roomCardIdx ?? 0,
        services: [],
      },
      global: {
        stubs: {
          BookingRoomPopup: true,
          BookingCarousel: {
            template: '<div data-testid="booking-carousel"></div>',
            props: ["images", "altPrefix", "altText", "height"],
          },
        },
      },
    });
  }

  it("рендерит заголовок номера", () => {
    const wrapper = mountCard();
    expect(wrapper.text()).toContain("Стандарт Twin");
  });

  it("эмитит select-tariff при выборе тарифа для room index", async () => {
    const wrapper = mountCard();
    const selectButtons = wrapper
      .findAll("button")
      .filter((b) => b.text().includes("Выбрать"));
    expect(selectButtons.length).toBeGreaterThan(0);

    await selectButtons[0]!.trigger("click");

    expect(wrapper.emitted("select-tariff")).toBeTruthy();
    const payload = wrapper.emitted("select-tariff")![0];
    expect(payload?.[0]).toBe("BAR");
    expect(typeof payload?.[1]).toBe("number");
  });

  it("показывает «Выбрано» для уже выбранного тарифа", () => {
    const wrapper = mountCard({
      selectedCodes: { "0-0": "BAR" },
    });
    expect(wrapper.text()).toContain("Выбрано");
  });
});
