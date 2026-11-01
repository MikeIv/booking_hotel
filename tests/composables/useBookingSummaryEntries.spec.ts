import { describe, it, expect, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { createPinia, setActivePinia } from "pinia";
import { useBookingStore } from "~/stores/booking";
import { useBookingSummaryEntries } from "~/composables/useBookingSummaryEntries";

describe("useBookingSummaryEntries", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("single: selectedByRoomIdx и bookingTotal из room+tariff+services", () => {
    const store = useBookingStore();
    store.setSelectedRoomType("STD");
    // setSelectedRoomType сбрасывает roomTariffs — задаём после
    store.setRoomTariffs([
      {
        room_type_code: "STD",
        title: "Стандарт",
        description: null,
        max_occupancy: 2,
        square: 20,
        rooms: 1,
        amenities: [],
        min_price: 5000,
        photos: [],
        tariffs: [
          {
            rate_plan_code: "BAR",
            title: "Базовый",
            price: 10000,
            packages: [],
          },
        ],
      },
    ]);
    store.setSelectedTariff({
      rate_plan_code: "BAR",
      title: "Базовый",
      price: 10000,
      packages: [],
    });
    store.setDate([new Date(2026, 5, 10), new Date(2026, 5, 12)]);
    store.addService({ id: 1, title: "Завтрак", price: 500 });

    const nights = computed(() => 2);
    const { selectedByRoomIdx, bookingTotal, isMultiRoomsMode } =
      useBookingSummaryEntries(nights);

    expect(isMultiRoomsMode.value).toBe(false);
    expect(selectedByRoomIdx.value[0]?.room_type_code).toBe("STD");
    // price per night = 10000/2 = 5000; stay = 5000*2 + 500 = 10500
    expect(bookingTotal.value).toBe(10500);
  });

  it("multi: total по selectedMultiRooms + services per room", () => {
    const store = useBookingStore();
    store.setSelectedMultiRooms({
      "0": {
        roomIdx: 0,
        roomCardIdx: 0,
        roomTitle: "A",
        room_type_code: "A",
        ratePlanCode: "BAR",
        price: 4000,
        title: "BAR",
      },
      "1": {
        roomIdx: 1,
        roomCardIdx: 0,
        roomTitle: "B",
        room_type_code: "B",
        ratePlanCode: "BAR",
        price: 3000,
        title: "BAR",
      },
    });
    store.addService({ id: 2, title: "SPA", price: 1000 }, 0);

    const nights = ref(2);
    const { bookingTotal, isMultiRoomsMode, selectedByRoomIdx } =
      useBookingSummaryEntries(nights);

    expect(isMultiRoomsMode.value).toBe(true);
    expect(Object.keys(selectedByRoomIdx.value)).toHaveLength(2);
    // rooms: 4000*2 + 3000*2 = 14000; services: 1000 → 15000
    expect(bookingTotal.value).toBe(15000);
  });
});
