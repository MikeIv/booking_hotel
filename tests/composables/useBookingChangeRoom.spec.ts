import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { useBookingChangeRoom } from "~/composables/useBookingChangeRoom";
import { setupPinia } from "../utils/test-utils";

const mockPut = vi.fn();
vi.stubGlobal("useApi", () => ({ put: mockPut }));

const mockGetErrorMessage = vi.fn((e: unknown) =>
  e instanceof Error ? e.message : String(e),
);
vi.stubGlobal("useApiHelpers", () => ({
  getErrorMessage: mockGetErrorMessage,
}));

const selectedRoomTypeRef = ref<string | null>("STANDARD");
const selectedTariffRef = ref<{
  rate_plan_code: string;
  title: string;
  price: number;
} | null>({
  rate_plan_code: "FLEX_BB",
  title: "Гибкий с завтраком",
  price: 5000,
});
const createdBookingRef = ref<unknown>(null);
const selectedServicesByRoomRef = ref<
  Record<
    string,
    Array<{ packageCode?: string; title: string; id: number; price: number }>
  >
>({});

const mockGetBookingByUuid = vi.fn();
const mockSetChangeRoomUuid = vi.fn();
const mockSetSelectedMultiRooms = vi.fn();
const mockSetSelectedServicesByRoom = vi.fn((value) => {
  selectedServicesByRoomRef.value = value;
});
const mockGetSelectedServicesForRoom = vi.fn((roomIndex: number) => {
  return selectedServicesByRoomRef.value[String(roomIndex)] ?? [];
});

vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({
    selectedRoomType: selectedRoomTypeRef,
    selectedTariff: selectedTariffRef,
    createdBooking: createdBookingRef,
    getBookingByUuid: mockGetBookingByUuid,
    setChangeRoomUuid: mockSetChangeRoomUuid,
    setSelectedMultiRooms: mockSetSelectedMultiRooms,
    setSelectedServicesByRoom: mockSetSelectedServicesByRoom,
    getSelectedServicesForRoom: mockGetSelectedServicesForRoom,
  }),
}));

describe("useBookingChangeRoom", () => {
  const uuid = computed(() => "booking-uuid-1");

  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    selectedRoomTypeRef.value = "STANDARD";
    selectedTariffRef.value = {
      rate_plan_code: "FLEX_BB",
      title: "Гибкий с завтраком",
      price: 5000,
    };
    selectedServicesByRoomRef.value = {};
    createdBookingRef.value = {
      uuid: "booking-uuid-1",
      rooms: [
        {
          id: 11,
          room_type_code: "STANDARD",
          packages: [
            { package_code: "TRANSFER", title: "Трансфер", price: 1000 },
            { package_code: "BREAKFAST", title: "Завтрак", price: 800 },
          ],
        },
      ],
    };
  });

  it("startChangeRoomFlow гидратирует услуги, сбрасывает multi и ставит changeRoomUuid", () => {
    const { startChangeRoomFlow } = useBookingChangeRoom(uuid);

    expect(startChangeRoomFlow()).toBeNull();
    expect(mockSetSelectedMultiRooms).toHaveBeenCalledWith({});
    expect(mockSetChangeRoomUuid).toHaveBeenCalledWith("booking-uuid-1");
    expect(mockSetSelectedServicesByRoom).toHaveBeenCalled();
    const hydrated = mockSetSelectedServicesByRoom.mock.calls[0]?.[0] as Record<
      string,
      Array<{ packageCode?: string; id: number }>
    >;
    const services = hydrated["0"] ?? [];
    expect(services.map((s) => s.packageCode)).toEqual(
      expect.arrayContaining(["TRANSFER", "BREAKFAST"]),
    );
    // id = hash(package_code), не числовой id API
    expect(services.every((s) => typeof s.id === "number" && s.id > 0)).toBe(
      true,
    );
  });

  it("startChangeRoomFlow блокирует мультибронь без мутаций", () => {
    createdBookingRef.value = {
      uuid: "booking-uuid-1",
      rooms: [{ id: 1 }, { id: 2 }],
    };
    const { startChangeRoomFlow } = useBookingChangeRoom(uuid);

    expect(startChangeRoomFlow()).toContain("несколькими номерами");
    expect(mockSetChangeRoomUuid).not.toHaveBeenCalled();
    expect(mockSetSelectedMultiRooms).not.toHaveBeenCalled();
  });

  it("confirmChangeRoom отправляет packages из выбранных услуг для одного номера", async () => {
    selectedServicesByRoomRef.value = {
      "0": [
        {
          id: 1,
          title: "Трансфер",
          price: 1000,
          packageCode: "TRANSFER",
        },
      ],
    };
    mockPut.mockResolvedValue({ success: true });
    mockGetBookingByUuid.mockResolvedValue(undefined);

    const { confirmChangeRoom, changeRoomSuccess } = useBookingChangeRoom(uuid);
    await confirmChangeRoom();

    expect(mockPut).toHaveBeenCalledWith(
      "/v1/booking/booking-uuid-1",
      {
        rooms: [
          {
            booking_id: 11,
            room_type_code: "STANDARD",
            rate_plan_code: "FLEX_BB",
            packages: ["TRANSFER"],
          },
        ],
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(changeRoomSuccess.value).toBe("Номер успешно изменён.");
  });
});
