import { defineStore } from "pinia";
import type { StateTree } from "pinia";
import type { PackageResource, Room, RoomTariff } from "~/types/room";
import type {
  SearchResponse,
  BookingData,
  BookingResponse,
  BookingHistoryItem,
  BookingByUuidPayload,
  ApiSearchPayload,
  SelectedEntry,
} from "~/types/booking";
import {
  getExpectedRoomCount,
  getSortedMultiRoomEntries,
} from "~/utils/multiBooking";
import {
  mapBookingShowToHistoryItem,
  normalizeBookingByUuidPayload,
} from "~/utils/mapBookingShowToHistoryItem";
import { toBookingAllowedActionsArray } from "~/utils/bookingAllowedActions";
import { createStaleSearchError } from "~/utils/staleSearchError";
import { formatDateApi, parseDateApi } from "~/utils/dateFormat";
import {
  normalizeSearchPayload,
  prepareSearchData as buildSearchData,
} from "~/utils/bookingSearch";
import {
  pruneSelectedMultiRooms,
  pruneSelectedServicesByRoom,
  shrinkMultiSelections,
  slimTariffForPersist,
  type ShrinkMultiHints,
} from "~/utils/bookingPersist";
import type { ChildAge } from "~/utils/age";

export interface SelectedService {
  id: number;
  title: string;
  price: number;
  packageCode?: string;
}

export const useBookingStore = defineStore(
  "booking",
  () => {
    const date = ref<[Date, Date] | null>(null);
    const guests = ref<{
      rooms: number;
      roomList: {
        adults: number;
        children: number;
        childrenAges: ChildAge[];
      }[];
    }>({
      rooms: 1,
      roomList: [{ adults: 1, children: 0, childrenAges: [] }],
    });

    const promoCode = ref("");
    const loading = ref(false);
    const isServerRequest = ref(false);
    const error = ref<string | null>(null);
    const searchResults = ref<SearchResponse | null>(null);
    const selectedRoomType = ref<string | null>(null);
    const selectedTariff = ref<RoomTariff | null>(null);
    const roomTariffs = ref<Room[]>([]);
    const loadingMessage = ref("Загружаем данные о номерах...");

    const selectedServicesByRoom = ref<Record<string, SelectedService[]>>({});
    const createdBooking = ref<BookingResponse | null>(null);
    const bookingsByUuid = ref<Record<string, BookingResponse>>({});
    const currentBookingUuid = ref<string | null>(null);
    const currentBookingDetails = ref<BookingHistoryItem | null>(null);
    const packages = ref<PackageResource[]>([]);
    const selectedMultiRooms = ref<Record<string, SelectedEntry>>({});
    const changeRoomUuid = ref<string | null>(null);
    const changeServicesUuid = ref<string | null>(null);
    /** Индексы номеров без доступности в последнем multi-поиске (для подсветки в GuestsSelector) */
    const multiBookingUnavailableRooms = ref<number[]>([]);

    function setMultiBookingUnavailableRooms(indices: number[]) {
      multiBookingUnavailableRooms.value = indices;
    }

    function clearMultiBookingUnavailableRooms() {
      multiBookingUnavailableRooms.value = [];
    }

    /** Услуги для одного номера (режим одного номера — индекс 0) */
    const selectedServices = computed(() => {
      const list = selectedServicesByRoom.value["0"] ?? [];
      return [...list];
    });

    function addService(service: SelectedService, roomIndex?: number) {
      const key = String(roomIndex ?? 0);
      const list = selectedServicesByRoom.value[key] ?? [];
      if (list.some((s) => s.id === service.id)) return;
      selectedServicesByRoom.value = {
        ...selectedServicesByRoom.value,
        [key]: [...list, service],
      };
    }

    function removeService(serviceId: number, roomIndex?: number) {
      const key = String(roomIndex ?? 0);
      const list = selectedServicesByRoom.value[key] ?? [];
      const index = list.findIndex((s) => s.id === serviceId);
      if (index === -1) return;
      const next = list.slice(0, index).concat(list.slice(index + 1));
      selectedServicesByRoom.value = {
        ...selectedServicesByRoom.value,
        [key]: next,
      };
    }

    function isServiceSelected(serviceId: number, roomIndex?: number): boolean {
      const key = String(roomIndex ?? 0);
      const list = selectedServicesByRoom.value[key] ?? [];
      return list.some((s) => s.id === serviceId);
    }

    function getSelectedServicesForRoom(roomIndex: number): SelectedService[] {
      return selectedServicesByRoom.value[String(roomIndex)] ?? [];
    }

    function setSelectedServicesByRoom(
      value: Record<string, SelectedService[]>,
    ) {
      selectedServicesByRoom.value = { ...value };
    }

    function setRoomTariffs(value: Room[]) {
      roomTariffs.value = value;
    }

    function setCurrentBookingDetails(booking: BookingHistoryItem | null) {
      currentBookingDetails.value = booking;
    }

    function setBookingByUuid(booking: BookingResponse | null) {
      if (!booking) return;
      const uuid =
        typeof booking.uuid === "string" && booking.uuid.trim() !== ""
          ? booking.uuid
          : null;
      if (!uuid) return;

      bookingsByUuid.value = {
        ...bookingsByUuid.value,
        [uuid]: booking,
      };
      currentBookingUuid.value = uuid;
      createdBooking.value = {
        ...booking,
        allowed: toBookingAllowedActionsArray(booking.allowed),
      };
    }

    function getSessionBookingByUuid(uuid: string): BookingResponse | null {
      const safeUuid = uuid.trim();
      if (!safeUuid) return null;
      return bookingsByUuid.value[safeUuid] ?? null;
    }

    function setSelectedMultiRooms(rooms: Record<string, SelectedEntry>) {
      selectedMultiRooms.value = { ...rooms };
    }

    function setServerRequest(value: boolean) {
      isServerRequest.value = value;
    }

    function syncSelectionsWithGuestCount(roomCount: number) {
      selectedMultiRooms.value = pruneSelectedMultiRooms(
        selectedMultiRooms.value,
        roomCount,
      );
      selectedServicesByRoom.value = pruneSelectedServicesByRoom(
        selectedServicesByRoom.value,
        roomCount,
      );
    }

    function setGuests(
      value: {
        rooms: number;
        roomList: {
          adults: number;
          children: number;
          childrenAges: ChildAge[];
        }[];
      },
      hints?: ShrinkMultiHints,
    ) {
      const prevCount = getExpectedRoomCount(guests.value);
      const nextCount = getExpectedRoomCount(value);
      const prevList = guests.value.roomList ?? [];
      guests.value = value;

      // shrink: deleteRoom сдвигает индексы; updateRooms режет хвост.
      if (nextCount < prevCount) {
        if (nextCount <= 1) {
          syncSelectionsWithGuestCount(1);
          return;
        }
        const shrunk = shrinkMultiSelections(
          selectedMultiRooms.value,
          selectedServicesByRoom.value,
          prevList,
          value.roomList ?? [],
          hints,
        );
        selectedMultiRooms.value = shrunk.selectedMultiRooms;
        selectedServicesByRoom.value = shrunk.selectedServicesByRoom;
        return;
      }

      syncSelectionsWithGuestCount(nextCount);
    }

    function setSearchResults(value: SearchResponse | null) {
      searchResults.value = value;
    }

    function setSelectedTariff(value: RoomTariff | null) {
      selectedTariff.value = value;
    }

    function setDate(value: [Date, Date] | null) {
      date.value = value;
    }

    function setPromoCode(value: string) {
      promoCode.value = value;
    }

    function setChangeRoomUuid(value: string | null) {
      changeRoomUuid.value = value;
    }

    function setChangeServicesUuid(value: string | null) {
      changeServicesUuid.value = value;
    }

    const totalGuests = computed(() => {
      const rooms = guests.value.roomList ?? [];
      const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
      const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
      return totalAdults + totalChildren;
    });

    const setLoading = (visible: boolean, message?: string) => {
      loading.value = visible;
      if (message) {
        loadingMessage.value = message;
      }
    };

    const formatDate = formatDateApi;

    function validateSearchParams() {
      if (!date.value) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите даты");
      }
      const rooms = guests.value.roomList ?? [];
      const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
      if (totalAdults === 0) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите количество гостей");
      }
      const [startDate] = date.value;
      // Сравниваем по календарному дню: дата заезда «сегодня» допустима
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const startDay = new Date(startDate);
      startDay.setHours(0, 0, 0, 0);
      if (startDay < todayStart) {
        searchResults.value = null;
        setLoading(false);
        isServerRequest.value = false;
        throw new Error(
          "Выбранные даты устарели. Пожалуйста, выберите новые даты.",
        );
      }
    }

    function prepareSearchData(roomTypeCode?: string, roomIndex?: number) {
      const [startDate, endDate] = date.value!;
      return buildSearchData({
        startDate,
        endDate,
        roomList: guests.value.roomList ?? [],
        promoCode: promoCode.value,
        roomTypeCode,
        roomIndex,
      });
    }

    function setSelectedRoomType(roomTypeCode: string | null) {
      selectedRoomType.value = roomTypeCode;
      roomTariffs.value = [];
    }

    /** Применить улучшение номера: подставить номер повышенного комфорта в выбор и сводку */
    function _applyUpgradeRoom(room: Room) {
      const list = roomTariffs.value;
      const exists = list.some((r) => r.room_type_code === room.room_type_code);
      if (!exists) {
        roomTariffs.value = [...list, room];
      }
      selectedRoomType.value = room.room_type_code;
      const targetRatePlanCode = selectedTariff.value?.rate_plan_code ?? null;
      const nextTariff =
        (targetRatePlanCode
          ? room.tariffs?.find((t) => t.rate_plan_code === targetRatePlanCode)
          : null) ??
        room.tariffs?.[0] ??
        null;

      selectedTariff.value = nextTariff;
    }

    /** Инкремент на каждый search(); ответ применяется только если id ещё актуален. */
    let searchRequestSeq = 0;
    let searchAbortController: AbortController | null = null;

    async function search(options?: {
      roomTypeCode?: string;
      skipReset?: boolean;
    }): Promise<SearchResponse> {
      validateSearchParams();

      searchAbortController?.abort();
      const abortController = new AbortController();
      searchAbortController = abortController;
      const requestId = ++searchRequestSeq;

      setLoading(true, "Загружаем данные о номерах...");
      error.value = null;

      const roomTypeCode = options?.roomTypeCode;
      const skipReset = options?.skipReset ?? false;

      if (roomTypeCode) {
        selectedRoomType.value = roomTypeCode;
      }

      let apiError: Error | null = null;

      try {
        const { post } = useApi();
        const { searchData, groupedByBed } = prepareSearchData(roomTypeCode);
        if (roomTypeCode) {
          searchData.grouped = true;
        }
        isServerRequest.value = true;

        const timeoutSignal = AbortSignal.timeout(60000);
        const signal =
          typeof AbortSignal.any === "function"
            ? AbortSignal.any([abortController.signal, timeoutSignal])
            : (() => {
                // Fallback: линкуем timeout вручную, если any() недоступен
                timeoutSignal.addEventListener(
                  "abort",
                  () => abortController.abort(timeoutSignal.reason),
                  { once: true },
                );
                return abortController.signal;
              })();

        const response = await post<ApiSearchPayload>(
          "/v1/search",
          searchData,
          { signal },
        );

        if (requestId !== searchRequestSeq) {
          throw createStaleSearchError();
        }

        if (response.success) {
          const normalized = normalizeSearchPayload(
            response.payload,
            groupedByBed,
          );
          searchResults.value = normalized;
          roomTariffs.value = normalized.rooms;
          syncSelectionsWithGuestCount(getExpectedRoomCount(guests.value));
          return normalized;
        }

        apiError = new Error(response.message || "Ошибка при поиске номеров");
      } catch (err: unknown) {
        // Заменённый запрос: не затираем error актуального поиска
        if (requestId !== searchRequestSeq) {
          throw createStaleSearchError();
        }

        error.value = (err as Error).message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        if (requestId === searchRequestSeq) {
          if (!skipReset) {
            isServerRequest.value = false;
            setLoading(false);
          }
          if (searchAbortController === abortController) {
            searchAbortController = null;
          }
        }
      }

      error.value = apiError!.message;
      throw apiError!;
    }

    async function createBooking(bookingData: BookingData) {
      const { post } = useApi();

      setLoading(true, "Создаём бронирование...");

      let skipLoadingReset = false;
      let apiError: Error | null = null;

      try {
        const processedData: BookingData = {
          for_self: bookingData.for_self,
          start_at: bookingData.start_at || "",
          end_at: bookingData.end_at || "",
          adults: bookingData.adults ?? 1,
          children: bookingData.children ?? 0,
          payment: bookingData.payment || "",
          agreements: bookingData.agreements,
          children_ages: bookingData.children_ages || [],
          additional: {
            start_at: bookingData.additional?.start_at || null,
            end_at: bookingData.additional?.end_at || null,
            comment: bookingData.additional?.comment || null,
          },
          rooms: bookingData.rooms.map((room) => ({
            room_type_code: room.room_type_code,
            rate_type_code: room.rate_type_code,
            packages: room.packages,
            adults: room.adults,
            children: room.children,
            children_ages: room.children_ages,
            guests: room.guests.map((guest) => ({
              surname: guest.surname,
              name: guest.name,
              middle_name: guest.middle_name || null,
              phone: guest.phone,
              email: guest.email,
              nationality: guest.nationality || "",
              sms_confirmation: guest.sms_confirmation || false,
              email_subscribe: guest.email_subscribe || false,
            })),
          })),
        };

        if (import.meta.dev) {
          console.log(
            "📤 Отправка данных бронирования:",
            JSON.stringify(processedData, null, 2),
          );
        }

        const multiRoomBooking = processedData.rooms.length > 1;
        const bookingTimeoutMs = multiRoomBooking ? 35000 : 15000;

        isServerRequest.value = true;
        const response = await post<BookingResponse>(
          "/v1/booking",
          processedData,
          { signal: AbortSignal.timeout(bookingTimeoutMs) },
        );

        if (response.success && response.payload) {
          setBookingByUuid(response.payload);
          if (response.payload.redirect_url) {
            skipLoadingReset = true;
          }
          return response.payload;
        }

        apiError = new Error(response.message || "Ошибка при создании брони");
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при бронировании";
        throw err;
      } finally {
        if (!skipLoadingReset) {
          isServerRequest.value = false;
          setLoading(false);
        }
      }

      error.value = apiError!.message;
      throw apiError!;
    }

    /**
     * Загрузка бронирования по uuid (confirmation / детали из ЛК).
     * GET /v1/booking/{uuid}
     * При `updateDetails: true` также мапит payload в BookingHistoryItem
     * и пишет в currentBookingDetails.
     */
    async function getBookingByUuid(
      uuid: string,
      options?: { silent?: boolean; updateDetails?: boolean },
    ): Promise<BookingResponse> {
      const { get } = useApi();
      const silent = options?.silent ?? false;
      const updateDetails = options?.updateDetails ?? false;

      if (!silent) {
        setLoading(true, "Загружаем данные бронирования...");
      }

      let apiError: Error | null = null;

      try {
        if (!silent) {
          isServerRequest.value = true;
        }
        const response = await get<BookingByUuidPayload>(
          `/v1/booking/${uuid}`,
          {},
          { signal: AbortSignal.timeout(15000) },
        );

        if (response.success && response.payload) {
          const normalized = normalizeBookingByUuidPayload(response.payload);
          setBookingByUuid(normalized);
          if (updateDetails) {
            setCurrentBookingDetails(
              mapBookingShowToHistoryItem(response.payload),
            );
          }
          return normalized;
        }

        apiError = new Error(
          response.message || "Ошибка при загрузке бронирования",
        );
      } catch (err: unknown) {
        error.value =
          (err as Error).message ||
          "Произошла ошибка при загрузке бронирования";
        throw err;
      } finally {
        if (!silent) {
          isServerRequest.value = false;
          setLoading(false);
        }
      }

      error.value = apiError!.message;
      throw apiError!;
    }

    /**
     * Детали брони из ЛК. GET /v1/booking/{uuid} (booking.show).
     * bookingId — uuid заказа из истории (поле id в BookingResource).
     */
    async function getBookingDetails(
      bookingId: string | number,
    ): Promise<BookingHistoryItem> {
      const uuid = String(bookingId).trim();
      if (!uuid) {
        throw new Error("Не указан идентификатор бронирования");
      }

      await getBookingByUuid(uuid, { updateDetails: true });

      const details = currentBookingDetails.value;
      if (!details) {
        throw new Error("Ошибка при получении данных брони");
      }
      return details;
    }

    async function searchPackages(
      roomIndex?: number,
    ): Promise<PackageResource[]> {
      validateSearchParams();
      error.value = null;

      let apiError: Error | null = null;

      try {
        const { post } = useApi();

        const sortedMulti = getSortedMultiRoomEntries(selectedMultiRooms.value);
        const isMultiRoom = sortedMulti.length > 0;

        // Для мультибронирования: roomIndex здесь — логический индекс номера (entry.roomIdx / guests.roomList index).
        // Ищем запись по совпадению roomIdx (устойчиво к порядку ключей), с fallback на позицию для совместимости.
        let effectiveRoomIndex: number | undefined = undefined;
        let targetEntry: (typeof sortedMulti)[number] | undefined = undefined;

        if (isMultiRoom) {
          effectiveRoomIndex = roomIndex ?? 0;
          targetEntry = sortedMulti.find(
            (e) => e.roomIdx === effectiveRoomIndex,
          );
          if (
            !targetEntry &&
            effectiveRoomIndex != null &&
            effectiveRoomIndex < sortedMulti.length
          ) {
            targetEntry = sortedMulti[effectiveRoomIndex];
          }
        }
        let roomTypeCode: string | undefined;
        let ratePlanCode: string | undefined;

        if (isMultiRoom && targetEntry) {
          roomTypeCode =
            targetEntry.room_type_code?.trim() !== ""
              ? targetEntry.room_type_code
              : undefined;
          ratePlanCode = targetEntry.ratePlanCode;
        } else if (!isMultiRoom) {
          const code = selectedRoomType.value;
          roomTypeCode = code && code.trim() !== "" ? code : undefined;
          ratePlanCode = selectedTariff.value?.rate_plan_code;
        }

        const { searchData } = prepareSearchData(
          roomTypeCode,
          effectiveRoomIndex,
        );

        const packagesSearchData: Record<string, unknown> = {
          ...searchData,
          ...(ratePlanCode ? { rate_plan_code: ratePlanCode } : {}),
        };

        isServerRequest.value = true;
        const response = await post<PackageResource[]>(
          "/v1/search/packages",
          packagesSearchData,
          {
            signal: AbortSignal.timeout(10000),
          },
        );

        if (response.success && response.payload) {
          packages.value = response.payload;
          return response.payload;
        }

        apiError = new Error(response.message || "Ошибка при получении услуг");
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при загрузке услуг";
        packages.value = [];
        throw err;
      } finally {
        isServerRequest.value = false;
      }

      error.value = apiError!.message;
      packages.value = [];
      throw apiError!;
    }

    function forceReset() {
      date.value = null;
      guests.value = {
        rooms: 1,
        roomList: [{ adults: 1, children: 0, childrenAges: [] }],
      };
      promoCode.value = "";
      error.value = null;
      searchResults.value = null;
      selectedRoomType.value = null;
      selectedTariff.value = null;
      roomTariffs.value = [];
      packages.value = [];
      selectedServicesByRoom.value = {};
      createdBooking.value = null;
      bookingsByUuid.value = {};
      currentBookingUuid.value = null;
      currentBookingDetails.value = null;
      selectedMultiRooms.value = {};
      changeRoomUuid.value = null;
      changeServicesUuid.value = null;
      multiBookingUnavailableRooms.value = [];
      setLoading(false);
      isServerRequest.value = false;
    }

    return {
      date,
      guests,
      promoCode,
      loading,
      isServerRequest,
      error,
      searchResults,
      totalGuests,
      selectedRoomType,
      selectedTariff,
      roomTariffs,
      loadingMessage,
      forceReset,
      setSelectedRoomType,
      applyUpgradeRoom: _applyUpgradeRoom,
      setLoading,
      search,
      createBooking,
      getBookingDetails,
      getBookingByUuid,
      formatDate,
      selectedServices,
      selectedServicesByRoom,
      addService,
      removeService,
      isServiceSelected,
      getSelectedServicesForRoom,
      setSelectedServicesByRoom,
      setRoomTariffs,
      createdBooking,
      bookingsByUuid,
      currentBookingUuid,
      setBookingByUuid,
      getSessionBookingByUuid,
      currentBookingDetails,
      setCurrentBookingDetails,
      packages,
      searchPackages,
      selectedMultiRooms,
      setSelectedMultiRooms,
      changeRoomUuid,
      changeServicesUuid,
      setServerRequest,
      setGuests,
      setSearchResults,
      setSelectedTariff,
      setDate,
      setPromoCode,
      setChangeRoomUuid,
      setChangeServicesUuid,
      multiBookingUnavailableRooms,
      setMultiBookingUnavailableRooms,
      clearMultiBookingUnavailableRooms,
    };
  },
  {
    persist: {
      key: "booking-store",
      // Cookie Nuxt-модуля ~4KB; localStorage держит multi-выбор и тариф без обрезки.
      storage: typeof localStorage !== "undefined" ? localStorage : undefined,
      pick: [
        "date",
        "guests",
        "promoCode",
        "selectedRoomType",
        "selectedTariff",
        "selectedServicesByRoom",
        "selectedMultiRooms",
        "changeRoomUuid",
        "changeServicesUuid",
      ],
      serializer: {
        serialize: (state: StateTree) => {
          const date = state.date;
          const selectedTariff = slimTariffForPersist(
            state.selectedTariff as RoomTariff | null | undefined,
          );
          return JSON.stringify({
            ...state,
            selectedTariff,
            // Persist: локальный YYYY-MM-DD (не UTC ISO)
            date: Array.isArray(date)
              ? date.map((d) =>
                  d instanceof Date || typeof d === "string"
                    ? formatDateApi(d)
                    : d,
                )
              : date,
          });
        },
        deserialize: (str: string) => {
          const state = JSON.parse(str) as StateTree & {
            date?: Array<string | Date>;
          };
          if (Array.isArray(state.date)) {
            // YYYY-MM-DD и legacy ISO из старых клиентов
            state.date = state.date.map((d) =>
              typeof d === "string" ? parseDateApi(d) : d,
            );
          }
          return state;
        },
      },
    },
  },
);
