import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { computed, ref } from "vue";
import BookingDetailsPage from "~/pages/booking-details.vue";
import { setupPinia, mountComponent } from "../utils/test-utils";
import { mockRouterPush, mockRoute } from "../mocks/nuxt";

const bookingDetailsRef = ref<{
  uuid: string;
  number: string;
  status: string;
  allowed: string[];
  order: {
    start_at: string;
    end_at: string;
    nights: number;
    name: string;
    surname: string;
    email?: string;
    phone?: string;
  };
  rooms: unknown[];
  total_price: number;
} | null>(null);

const mockGetBookingDetails = vi.fn();
const mockSetChangeRoomUuid = vi.fn();
const mockSetSelectedServicesByRoom = vi.fn();
const mockSetSelectedMultiRooms = vi.fn();

const mockBookingStore = {
  currentBookingDetails: bookingDetailsRef,
  createdBooking: ref(null),
  date: ref(null),
  changeRoomUuid: null as string | null,
  selectedRoomType: null as string | null,
  getBookingDetails: mockGetBookingDetails,
  getBookingByUuid: vi.fn(),
  setChangeRoomUuid: mockSetChangeRoomUuid,
  setSelectedServicesByRoom: mockSetSelectedServicesByRoom,
  setSelectedMultiRooms: mockSetSelectedMultiRooms,
  setDate: vi.fn(),
  setSearchResults: vi.fn(),
  setSelectedRoomType: vi.fn(),
  setSelectedTariff: vi.fn(),
  forceReset: vi.fn(),
};

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => mockBookingStore,
}));

vi.mock("~/stores/auth", () => ({
  useAuthStore: () => ({
    user: null,
  }),
}));

vi.mock("pinia", async () => {
  const mod = await vi.importActual<typeof import("pinia")>("pinia");
  return {
    ...mod,
    storeToRefs: (store: unknown) => {
      if (store && typeof store === "object" && "$id" in (store as object)) {
        return mod.storeToRefs(store as Parameters<typeof mod.storeToRefs>[0]);
      }
      return store;
    },
  };
});

const openCancelBookingPopup = vi.fn();
const openChangeDatesPopup = vi.fn();
const openChangeContactsPopup = vi.fn();

vi.stubGlobal("useNotificationToast", () => ({
  add: vi.fn(),
}));

vi.stubGlobal("useBookingAccessDenied", () => ({
  handleBookingAccessDeniedIfNeeded: vi.fn().mockResolvedValue(false),
}));

vi.stubGlobal("useBookingAllowedActions", () => {
  const allowed = computed(() => {
    const list = bookingDetailsRef.value?.allowed ?? [];
    return new Set(Array.isArray(list) ? list : []);
  });
  return {
    canEditDates: computed(() => allowed.value.has("edit-dates")),
    canEditRoom: computed(() => allowed.value.has("edit-number")),
    canEditPackages: computed(() => allowed.value.has("edit-packages")),
    canEditContacts: computed(() => allowed.value.has("edit-contacts")),
    canCancelBooking: computed(() => allowed.value.has("cancel")),
    hasManagementActions: computed(
      () =>
        allowed.value.has("edit-dates") ||
        allowed.value.has("edit-number") ||
        allowed.value.has("edit-packages") ||
        allowed.value.has("edit-contacts"),
    ),
  };
});

vi.stubGlobal("useBookingCancel", () => ({
  isCancelBookingPopupOpen: ref(false),
  isCancellingBooking: ref(false),
  cancelBookingError: ref(null),
  openCancelBookingPopup,
  closeCancelBookingPopup: vi.fn(),
  confirmCancelBooking: vi.fn(),
}));

vi.stubGlobal("useBookingChangeContacts", () => ({
  isChangeContactsPopupOpen: ref(false),
  isChangingContacts: ref(false),
  changeContactsError: ref(null),
  changeContactsSuccess: ref(null),
  contactForm: ref({
    name: "",
    surname: "",
    middle_name: "",
    phone: "",
    email: "",
    country: "",
  }),
  canSubmitContactChange: ref(false),
  openChangeContactsPopup,
  closeChangeContactsPopup: vi.fn(),
  confirmChangeContacts: vi.fn(),
}));

vi.stubGlobal("useBookingChangeDates", () => ({
  isChangeDatesPopupOpen: ref(false),
  isChangingDates: ref(false),
  changeDatesError: ref(null),
  changeDatesSuccess: ref(null),
  newDates: ref(null),
  isChangeDatesCalendarOpen: ref(false),
  canSubmitDateChange: ref(false),
  openChangeDatesPopup,
  closeChangeDatesPopup: vi.fn(),
  confirmChangeDates: vi.fn(),
}));

const mockStartChangeRoomFlow = vi.fn(() => null);

vi.stubGlobal("useBookingChangeRoom", () => ({
  isChangeRoomPopupOpen: ref(false),
  isChangingRoom: ref(false),
  changeRoomError: ref(null),
  changeRoomSuccess: ref(null),
  startChangeRoomFlow: mockStartChangeRoomFlow,
  openChangeRoomPopup: vi.fn(),
  closeChangeRoomPopup: vi.fn(),
  confirmChangeRoom: vi.fn(),
}));

vi.stubGlobal("useBookingChangeServices", () => ({
  startChangeServicesFlow: vi.fn(() => null),
  isChangeServicesPopupOpen: ref(false),
  isChangingServices: ref(false),
  changeServicesError: ref(null),
  changeServicesSuccess: ref(null),
  openChangeServicesPopup: vi.fn(),
  closeChangeServicesPopup: vi.fn(),
  confirmChangeServices: vi.fn(),
}));

vi.stubGlobal("useApiHelpers", () => ({
  getErrorMessage: (e: unknown) => (e instanceof Error ? e.message : String(e)),
}));

describe("pages/booking-details.vue management actions", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    mockRoute.query = { id: "booking-uuid-1" };
    bookingDetailsRef.value = {
      uuid: "booking-uuid-1",
      number: "12345",
      status: "confirmed",
      allowed: [
        "edit-dates",
        "edit-number",
        "edit-packages",
        "edit-contacts",
        "cancel",
      ],
      order: {
        start_at: "2026-08-20",
        end_at: "2026-08-22",
        nights: 2,
        name: "Иван",
        surname: "Иванов",
        email: "ivan@example.com",
        phone: "+79990001122",
      },
      rooms: [{ id: 1, title: "Standard" }],
      total_price: 10000,
    };
    mockGetBookingDetails.mockResolvedValue(bookingDetailsRef.value);
  });

  function mountPage() {
    return mountComponent(BookingDetailsPage, {
      global: {
        stubs: {
          BookingDetailsHeader: true,
          BookingDetailsHotelInfo: true,
          BookingDetailsSummary: true,
          BookingDetailsPersonalInfo: true,
          BookingConfirmationCancelPopup: true,
          BookingConfirmationChangeDatesPopup: true,
          BookingConfirmationChangeContactsPopup: true,
          BookingConfirmationChangeRoomPopup: true,
        },
      },
    });
  }

  it("кнопки управления вызывают composable-openers, а не TODO", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const byText = (text: string) =>
      wrapper.findAll("button").find((b) => b.text().includes(text));

    await byText("Изменить даты")!.trigger("click");
    expect(openChangeDatesPopup).toHaveBeenCalled();

    await byText("Изменить контакты")!.trigger("click");
    expect(openChangeContactsPopup).toHaveBeenCalled();

    await byText("Отменить бронирование")!.trigger("click");
    expect(openCancelBookingPopup).toHaveBeenCalled();

    await byText("Изменить номер")!.trigger("click");
    await flushPromises();
    expect(mockStartChangeRoomFlow).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith("/rooms");
  });
});
