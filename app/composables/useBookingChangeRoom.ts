import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";
import {
  buildBookingRoomRefs,
  pickSelectedPackageCodes,
} from "~/utils/bookingChangeRequest";
import { selectedServicesByRoomFromBookingRooms } from "~/utils/mapBookingRoomServices";

type ChangeBookingRoomResponse = {
  success: boolean;
  message?: string;
  payload?: unknown;
};

export const useBookingChangeRoom = (
  currentBookingUuid: ComputedRef<string | null>,
) => {
  const bookingStore = useBookingStore();
  const { put } = useApi();
  const { getErrorMessage } = useApiHelpers();
  const { createdBooking, selectedRoomType, selectedTariff } =
    storeToRefs(bookingStore);

  const {
    setChangeRoomUuid,
    setSelectedServicesByRoom,
    setSelectedMultiRooms,
    getSelectedServicesForRoom,
  } = bookingStore;

  const isChangeRoomPopupOpen = ref(false);
  const isChangingRoom = ref(false);
  const changeRoomError = ref<string | null>(null);
  const changeRoomSuccess = ref<string | null>(null);

  function syncSelectedServicesFromBooking(): void {
    setSelectedServicesByRoom(
      selectedServicesByRoomFromBookingRooms(createdBooking.value?.rooms),
    );
  }

  const startChangeRoomFlow = (): string | null => {
    const uuid = currentBookingUuid.value;
    if (!uuid) {
      return "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
    }

    const roomsRaw = createdBooking.value?.rooms;
    if (!Array.isArray(roomsRaw) || roomsRaw.length === 0) {
      return "Не удалось определить состав бронирования. Обновите страницу.";
    }

    if (roomsRaw.length > 1) {
      return "Смена номера для бронирования с несколькими номерами пока не поддерживается.";
    }

    setSelectedMultiRooms({});
    syncSelectedServicesFromBooking();
    setChangeRoomUuid(uuid);
    return null;
  };

  const openChangeRoomPopup = () => {
    changeRoomError.value = null;
    changeRoomSuccess.value = null;
    isChangeRoomPopupOpen.value = true;
  };

  const closeChangeRoomPopup = () => {
    changeRoomError.value = null;
    changeRoomSuccess.value = null;
    isChangeRoomPopupOpen.value = false;
    setChangeRoomUuid(null);
    syncSelectedServicesFromBooking();
  };

  const confirmChangeRoom = async () => {
    const uuid = currentBookingUuid.value;
    if (!uuid) {
      changeRoomError.value =
        "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
      return;
    }

    const roomTypeCode = selectedRoomType.value;
    const ratePlanCode = selectedTariff.value?.rate_plan_code ?? null;

    if (!roomTypeCode || !ratePlanCode) {
      changeRoomError.value =
        "Не удалось определить выбранный номер или тариф. Попробуйте выбрать номер ещё раз.";
      return;
    }

    const roomsRaw = createdBooking.value?.rooms;
    if (!Array.isArray(roomsRaw) || roomsRaw.length !== 1) {
      changeRoomError.value =
        "Смена номера доступна только для бронирования с одним номером.";
      return;
    }

    isChangingRoom.value = true;
    changeRoomError.value = null;
    changeRoomSuccess.value = null;

    try {
      const roomRecord = roomsRaw[0] as Record<string, unknown>;
      const [roomRef] = buildBookingRoomRefs([roomRecord]);
      const rooms = [
        {
          ...roomRef,
          room_type_code: roomTypeCode,
          rate_plan_code: ratePlanCode,
          packages: pickSelectedPackageCodes(getSelectedServicesForRoom(0)),
        },
      ];

      const response = (await put<unknown>(
        `/v1/booking/${uuid}`,
        { rooms },
        {
          signal: AbortSignal.timeout(15000),
        },
      )) as ChangeBookingRoomResponse;

      if (!response.success) {
        throw new Error(
          response.message || "Не удалось изменить номер бронирования",
        );
      }

      await bookingStore.getBookingByUuid(uuid);
      setChangeRoomUuid(null);
      syncSelectedServicesFromBooking();
      changeRoomSuccess.value = "Номер успешно изменён.";
    } catch (error: unknown) {
      changeRoomError.value = getErrorMessage(error);
    } finally {
      isChangingRoom.value = false;
    }
  };

  return {
    isChangeRoomPopupOpen,
    isChangingRoom,
    changeRoomError,
    changeRoomSuccess,
    startChangeRoomFlow,
    openChangeRoomPopup,
    closeChangeRoomPopup,
    confirmChangeRoom,
  };
};
