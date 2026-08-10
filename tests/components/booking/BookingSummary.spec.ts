import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import BookingSummary from "~/components/booking/BookingSummary.vue";
import { setupPinia, mountComponent } from "../../utils/test-utils";
import type { SelectedEntry } from "~/types/booking";

const guestsRef = ref({
  rooms: 1,
  roomList: [{ adults: 2, children: 0, childrenAges: [] }],
});
const selectedServicesByRoomRef = ref<Record<string, unknown[]>>({});

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({
    guests: guestsRef,
    selectedServicesByRoom: selectedServicesByRoomRef,
    removeService: vi.fn(),
  }),
}));

const entry: SelectedEntry = {
  roomIdx: 0,
  roomCardIdx: 0,
  roomTitle: "Стандарт",
  room_type_code: "STD",
  ratePlanCode: "BAR",
  price: 5000,
  title: "Базовый тариф",
  square: 25,
};

describe("BookingSummary.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    guestsRef.value = {
      rooms: 1,
      roomList: [{ adults: 2, children: 0, childrenAges: [] }],
    };
    selectedServicesByRoomRef.value = {};
  });

  function mountSummary(
    overrides?: Partial<{
      selectedEntries: Record<string, SelectedEntry>;
      showContinue: boolean;
      bookingTotal: number;
    }>,
  ) {
    const start = new Date(2026, 5, 10);
    const end = new Date(2026, 5, 12);
    return mountComponent(BookingSummary, {
      props: {
        selectedEntries: overrides?.selectedEntries ?? { "0": entry },
        date: [start, end] as [Date, Date],
        nights: 2,
        bookingTotal: overrides?.bookingTotal ?? 10000,
        showContinue: overrides?.showContinue ?? true,
      },
      global: {
        stubs: {
          // Не подменять сам тестируемый компонент
          BookingSummary: false,
        },
      },
    });
  }

  it("рендерит категорию номера и тариф", () => {
    const wrapper = mountSummary();
    expect(wrapper.text()).toContain("Стандарт");
    expect(wrapper.text()).toContain("Базовый тариф");
  });

  it("показывает CTA Продолжить и эмитит continue", async () => {
    const wrapper = mountSummary();
    const buttons = wrapper.findAll("button");
    const continueBtn = buttons.find((b) => b.text().includes("Продолжить"));
    expect(continueBtn).toBeTruthy();
    await continueBtn!.trigger("click");
    expect(wrapper.emitted("continue")).toHaveLength(1);
  });

  it("скрывает CTA при showContinue=false", () => {
    const wrapper = mountSummary({ showContinue: false });
    const continueBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Продолжить"));
    expect(continueBtn).toBeUndefined();
  });
});
