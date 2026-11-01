import type { MaybeRef } from "vue";
import { unref } from "vue";
import type { ApiError } from "~/composables/useApi";
import { getRequestErrorContent } from "~/components/common/RequestErrorMessage.vue";
import { useNotificationToast } from "~/composables/useToast";
import { useBookingStore } from "~/stores/booking";
import {
  getExpectedRoomCount,
  getUnavailableRoomIndices,
  MULTI_BOOKING_UNAVAILABLE_TOAST,
} from "~/utils/multiBooking";
import { isStaleSearchError } from "~/utils/staleSearchError";
import {
  CHILD_AGE_REQUIRED_DETAIL,
  hasUnsetChildAges,
  type ChildAge,
} from "~/utils/age";

type BookingGuestsState = {
  rooms: number;
  roomList: { adults: number; children: number; childrenAges: ChildAge[] }[];
};

export function useBookingSearchSubmit() {
  const bookingStore = useBookingStore();
  const router = useRouter();
  const route = useRoute();
  const toast = useNotificationToast();

  const validateSearchForm = () => {
    const currentDate = unref(
      bookingStore.date as MaybeRef<[Date, Date] | null | undefined>,
    );
    if (!currentDate) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Пожалуйста, выберите даты",
        life: 3000,
      });
      return false;
    }

    const guestsValue = unref(
      bookingStore.guests as MaybeRef<BookingGuestsState>,
    );
    const totalAdults = guestsValue.roomList
      ? guestsValue.roomList.reduce((sum, room) => sum + room.adults, 0)
      : 0;

    if (totalAdults === 0) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Пожалуйста, укажите количество взрослых",
        life: 3000,
      });
      return false;
    }

    if (hasUnsetChildAges(guestsValue.roomList ?? [])) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: CHILD_AGE_REQUIRED_DETAIL,
        life: 3000,
      });
      return false;
    }

    return true;
  };

  const submitBookingSearch = async () => {
    if (!validateSearchForm()) return;

    bookingStore.setLoading(true, "Загружаем данные о номерах...");
    bookingStore.setServerRequest(true);

    let skipOverlayReset = false;

    try {
      const result = await bookingStore.search({ skipReset: true });

      if (!result || !result.rooms || result.rooms.length === 0) {
        toast.add({
          severity: "warn",
          summary: "Повторите запрос позже",
          detail: "Временные неполадки. Повторите запрос немного позже",
          life: 5000,
        });
        return;
      }

      const guestsValue = unref(
        bookingStore.guests as MaybeRef<BookingGuestsState>,
      );
      const roomsCount = getExpectedRoomCount(guestsValue);

      if (roomsCount > 1) {
        const unavailable = getUnavailableRoomIndices(result.rooms, roomsCount);
        if (unavailable.length > 0) {
          bookingStore.setMultiBookingUnavailableRooms(unavailable);
          toast.add(MULTI_BOOKING_UNAVAILABLE_TOAST);
          return;
        }
        bookingStore.clearMultiBookingUnavailableRooms();
      }

      const target = roomsCount > 1 ? "/multi-rooms" : "/rooms";
      if (route.path !== target) {
        await router.push(target);
        await nextTick();
      }
    } catch (error: unknown) {
      if (isStaleSearchError(error)) {
        skipOverlayReset = true;
        return;
      }

      const { status, message } = (error || {}) as ApiError;
      const { summary, detail } = getRequestErrorContent(status, message);

      toast.add({
        severity: "warn",
        summary,
        detail,
        life: 3000,
      });
    } finally {
      if (!skipOverlayReset) {
        bookingStore.setLoading(false);
        bookingStore.setServerRequest(false);
      }
    }
  };

  return {
    submitBookingSearch,
    validateSearchForm,
  };
}
