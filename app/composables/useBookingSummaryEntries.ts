import { storeToRefs } from "pinia";
import { useBookingStore } from "~/stores/booking";
import type { SelectedEntry } from "~/types/booking";
import type { RoomTariff } from "~/types/room";
import { toPricePerNight, toStayTotal } from "~/utils/price";
import { buildSelectedEntry } from "~/utils/selectedEntry";

/**
 * Сводка выбранных номеров и итоговая сумма для personal / services (store-driven).
 * Режим multi определяется наличием selectedMultiRooms (как на страницах).
 */
export function useBookingSummaryEntries(
  nights: Ref<number> | ComputedRef<number>,
) {
  const bookingStore = useBookingStore();
  const {
    selectedRoomType,
    selectedTariff: selectedTariffStore,
    roomTariffs,
    selectedMultiRooms,
    selectedServices,
  } = storeToRefs(bookingStore);

  const isMultiRoomsMode = computed(
    () => Object.keys(selectedMultiRooms.value).length > 0,
  );

  const selectedRoom = computed(() => {
    if (isMultiRoomsMode.value) return null;
    if (!roomTariffs.value?.length) return null;
    return (
      roomTariffs.value.find(
        (room) => room.room_type_code === selectedRoomType.value,
      ) ||
      roomTariffs.value[0] ||
      null
    );
  });

  const selectedTariff = computed<RoomTariff | null>(() => {
    if (isMultiRoomsMode.value) return null;
    if (selectedTariffStore.value) return selectedTariffStore.value;
    if (!selectedRoom.value?.tariffs?.length) return null;
    return selectedRoom.value.tariffs[0] || null;
  });

  const selectedEntry = computed<SelectedEntry | null>(() => {
    if (isMultiRoomsMode.value) return null;
    if (!selectedRoom.value || !selectedTariff.value) return null;
    return buildSelectedEntry({
      room: selectedRoom.value,
      ratePlanCode: selectedTariff.value.rate_plan_code,
      tariffTitle: selectedTariff.value.title || "",
      pricePerNight: toPricePerNight(selectedTariff.value.price, nights.value),
    });
  });

  const selectedByRoomIdx = computed<Record<string, SelectedEntry>>(() => {
    if (isMultiRoomsMode.value) {
      return selectedMultiRooms.value;
    }
    const entry = selectedEntry.value;
    if (!entry) return {};
    return { 0: entry };
  });

  const bookingTotal = computed(() => {
    if (isMultiRoomsMode.value) {
      const roomsTotal = Object.values(selectedMultiRooms.value).reduce(
        (sum, e) => sum + toStayTotal(e.price, nights.value),
        0,
      );
      const servicesTotal = Object.values(selectedMultiRooms.value).reduce(
        (sum, entry) =>
          sum +
          bookingStore
            .getSelectedServicesForRoom(entry.roomIdx)
            .reduce((s, svc) => s + svc.price, 0),
        0,
      );
      return roomsTotal + servicesTotal;
    }
    if (!selectedEntry.value?.price) return 0;
    const servicesTotal = selectedServices.value.reduce(
      (sum, s) => sum + s.price,
      0,
    );
    return toStayTotal(selectedEntry.value.price, nights.value) + servicesTotal;
  });

  return {
    isMultiRoomsMode,
    selectedRoom,
    selectedTariff,
    selectedEntry,
    selectedByRoomIdx,
    bookingTotal,
  };
}
