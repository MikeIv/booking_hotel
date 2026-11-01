import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import { useBookingChangeContacts } from "~/composables/useBookingChangeContacts";
import { setupPinia } from "../utils/test-utils";

const mockPut = vi.fn();
vi.stubGlobal("useApi", () => ({ put: mockPut }));

const mockGetErrorMessage = vi.fn((e: unknown) =>
  e instanceof Error ? e.message : String(e),
);
vi.stubGlobal("useApiHelpers", () => ({
  getErrorMessage: mockGetErrorMessage,
}));

const mockGetBookingByUuid = vi.fn();
const createdBookingRef = ref<unknown>(null);
vi.mock("~/stores/booking", () => ({
  useBookingStore: () => ({
    createdBooking: createdBookingRef,
    getBookingByUuid: mockGetBookingByUuid,
  }),
}));

const mockAuthUserRef = ref<{
  name?: string;
  surname?: string;
  middle_name?: string;
  phone?: string;
  email?: string;
  country?: string;
} | null>(null);
vi.mock("~/stores/auth", () => ({
  useAuthStore: () => ({
    get user() {
      return mockAuthUserRef.value;
    },
  }),
}));

describe("useBookingChangeContacts", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    createdBookingRef.value = null;
    mockAuthUserRef.value = null;
    mockGetBookingByUuid.mockResolvedValue(undefined);
  });

  const makeComposable = (uuid: string | null = "booking-uuid") =>
    useBookingChangeContacts(computed(() => uuid));

  describe("canSubmitContactChange", () => {
    it("должен быть false при пустой форме", () => {
      const { canSubmitContactChange } = makeComposable();
      expect(canSubmitContactChange.value).toBe(false);
    });

    it("должен быть false при отсутствии обязательных полей", () => {
      const { contactForm, canSubmitContactChange } = makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "",
        middle_name: "",
        phone: "+79001234567",
        email: "ivan@example.com",
        country: "RU",
      };
      expect(canSubmitContactChange.value).toBe(false);
    });

    it("должен быть false при невалидном email", () => {
      const { contactForm, canSubmitContactChange } = makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "Иванов",
        middle_name: "",
        phone: "+79001234567",
        email: "not-an-email",
        country: "RU",
      };
      expect(canSubmitContactChange.value).toBe(false);
    });

    it("должен быть false при телефоне короче 10 символов", () => {
      const { contactForm, canSubmitContactChange } = makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "Иванов",
        middle_name: "",
        phone: "123",
        email: "ivan@example.com",
        country: "RU",
      };
      expect(canSubmitContactChange.value).toBe(false);
    });

    it("должен быть true при корректно заполненной форме", () => {
      const { contactForm, canSubmitContactChange } = makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "Иванов",
        middle_name: "",
        phone: "+79001234567",
        email: "ivan@example.com",
        country: "RU",
      };
      expect(canSubmitContactChange.value).toBe(true);
    });

    it("должен быть false во время выполнения запроса", async () => {
      createdBookingRef.value = {
        order: {
          start_at: "2025-01-10T00:00:00Z",
          end_at: "2025-01-12T00:00:00Z",
        },
        rooms: [
          {
            room_type_code: "DBL",
            rate_plan_code: "STD",
            packages: [],
            adults: 1,
            children: 0,
            children_ages: [],
            guests: [
              {
                id: 1,
                surname: "Иванов",
                name: "Иван",
                middle_name: "",
                phone: "+79001234567",
                email: "ivan@example.com",
              },
            ],
          },
        ],
      };

      let resolvePut!: (v: unknown) => void;
      mockPut.mockReturnValue(
        new Promise((resolve) => {
          resolvePut = resolve;
        }),
      );

      const { contactForm, canSubmitContactChange, confirmChangeContacts } =
        makeComposable();
      contactForm.value = {
        name: "Иван",
        surname: "Иванов",
        middle_name: "",
        phone: "+79001234567",
        email: "ivan@example.com",
        country: "RU",
      };

      const promise = confirmChangeContacts();
      expect(canSubmitContactChange.value).toBe(false);

      resolvePut!({ success: true });
      await promise;
    });
  });

  describe("openChangeContactsPopup / closeChangeContactsPopup", () => {
    it("должен открывать попап и заполнять форму данными из бронирования", () => {
      createdBookingRef.value = {
        order: { name: "Тест", surname: "Тестов", nationality: "BY" },
        rooms: [],
      };

      const {
        isChangeContactsPopupOpen,
        contactForm,
        openChangeContactsPopup,
      } = makeComposable();
      openChangeContactsPopup();

      expect(isChangeContactsPopupOpen.value).toBe(true);
      expect(contactForm.value.name).toBe("Тест");
      expect(contactForm.value.country).toBe("BY");
    });

    it("должен сбрасывать состояние при открытии", () => {
      const {
        changeContactsError,
        changeContactsSuccess,
        openChangeContactsPopup,
      } = makeComposable();

      openChangeContactsPopup();

      expect(changeContactsError.value).toBeNull();
      expect(changeContactsSuccess.value).toBeNull();
    });

    it("должен закрывать попап и сбрасывать состояние", () => {
      const {
        isChangeContactsPopupOpen,
        changeContactsError,
        changeContactsSuccess,
        openChangeContactsPopup,
        closeChangeContactsPopup,
      } = makeComposable();

      openChangeContactsPopup();
      closeChangeContactsPopup();

      expect(isChangeContactsPopupOpen.value).toBe(false);
      expect(changeContactsError.value).toBeNull();
      expect(changeContactsSuccess.value).toBeNull();
    });
  });

  describe("confirmChangeContacts", () => {
    const validForm = {
      name: "Иван",
      surname: "Иванов",
      middle_name: "",
      phone: "+79001234567",
      email: "ivan@example.com",
      country: "RU",
    };

    it("должен устанавливать ошибку если UUID не задан", async () => {
      const { changeContactsError, confirmChangeContacts } =
        makeComposable(null);
      await confirmChangeContacts();

      expect(changeContactsError.value).toBeTruthy();
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("должен устанавливать ошибку если форма невалидна", async () => {
      const { changeContactsError, confirmChangeContacts } = makeComposable();
      // Форма пустая по умолчанию
      await confirmChangeContacts();

      expect(changeContactsError.value).toBeTruthy();
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("должен вызывать PUT /v1/booking/:uuid с Sync-телом contacts", async () => {
      mockPut.mockResolvedValue({ success: true });

      createdBookingRef.value = {
        order: { nationality: "RU" },
        rooms: [
          {
            id: 42,
            room_type_code: "DBL",
            rate_plan_code: "STD",
            packages: [],
            adults: 1,
            children: 0,
            children_ages: [],
            guests: [
              {
                id: 1,
                surname: "Старый",
                name: "Старый",
                middle_name: "",
                phone: "+79000000000",
                email: "old@example.com",
              },
            ],
          },
        ],
      };

      const { contactForm, confirmChangeContacts } =
        makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(mockPut).toHaveBeenCalledWith(
        "/v1/booking/booking-uuid",
        {
          rooms: [
            {
              booking_id: 42,
              guests: [
                expect.objectContaining({
                  id: 1,
                  surname: "Иванов",
                  name: "Иван",
                  email: "ivan@example.com",
                  phone: "+79001234567",
                  nationality: "RU",
                }),
              ],
            },
          ],
        },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    it("должен загружать обновлённое бронирование и устанавливать success при успехе", async () => {
      mockPut.mockResolvedValue({ success: true });

      createdBookingRef.value = {
        order: { nationality: "RU" },
        rooms: [
          {
            id: 42,
            guests: [
              {
                id: 1,
                surname: "Иванов",
                name: "Иван",
                phone: "+79001234567",
                email: "ivan@example.com",
              },
            ],
          },
        ],
      };

      const { contactForm, changeContactsSuccess, confirmChangeContacts } =
        makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(mockGetBookingByUuid).toHaveBeenCalledWith("booking-uuid");
      expect(changeContactsSuccess.value).toBeTruthy();
    });

    it("должен устанавливать ошибку при неуспешном ответе API", async () => {
      mockPut.mockResolvedValue({ success: false, message: "Ошибка сервера" });

      createdBookingRef.value = {
        rooms: [{ id: 42, guests: [{ id: 1 }] }],
      };

      const {
        contactForm,
        changeContactsError,
        changeContactsSuccess,
        confirmChangeContacts,
      } = makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(changeContactsError.value).toBeTruthy();
      expect(changeContactsSuccess.value).toBeNull();
    });

    it("должен устанавливать ошибку при исключении", async () => {
      mockPut.mockRejectedValue(new Error("Сетевая ошибка"));
      mockGetErrorMessage.mockReturnValue("Сетевая ошибка");

      createdBookingRef.value = {
        rooms: [{ id: 42, guests: [{ id: 1 }] }],
      };

      const { contactForm, changeContactsError, confirmChangeContacts } =
        makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(changeContactsError.value).toBe("Сетевая ошибка");
    });

    it("должен сбрасывать isChangingContacts после завершения", async () => {
      mockPut.mockResolvedValue({ success: true });

      createdBookingRef.value = {
        rooms: [{ id: 42, guests: [{ id: 1 }] }],
      };

      const { contactForm, isChangingContacts, confirmChangeContacts } =
        makeComposable("booking-uuid");
      contactForm.value = { ...validForm };
      await confirmChangeContacts();

      expect(isChangingContacts.value).toBe(false);
    });
  });
});
