<script setup lang="ts">
import { useBookingStore } from "~/stores/booking";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import type { BookingDetailsRoom } from "~/types/booking-details";
import { HOTEL_INFO } from "~/utils/hotel";
import { getBookingNumber } from "~/utils/bookingStatus";

const router = useRouter();
const route = useRoute();
const bookingStore = useBookingStore();
const authStore = useAuthStore();
const toast = useNotificationToast();
const { getErrorMessage } = useApiHelpers();
const { handleBookingAccessDeniedIfNeeded } = useBookingAccessDenied();

const { currentBookingDetails, createdBooking, date } =
  storeToRefs(bookingStore);
const bookingDetails = currentBookingDetails;
const isLoadingDetails = ref(false);

const bookingNumber = computed(() => getBookingNumber(bookingDetails.value));

const currentBookingUuid = computed<string | null>(() => {
  const fromDetails = bookingDetails.value?.uuid;
  if (fromDetails && String(fromDetails).trim() !== "") {
    return String(fromDetails);
  }
  const fromQuery = route.query.id;
  if (typeof fromQuery === "string" && fromQuery.trim() !== "") {
    return fromQuery;
  }
  return null;
});

const bookingDate = computed<[Date, Date] | null>(() => {
  const start = bookingDetails.value?.order?.start_at;
  const end = bookingDetails.value?.order?.end_at;
  if (start && end) {
    return [new Date(start), new Date(end)];
  }
  if (
    createdBooking.value?.order?.start_at &&
    createdBooking.value?.order?.end_at
  ) {
    return [
      new Date(createdBooking.value.order.start_at),
      new Date(createdBooking.value.order.end_at),
    ];
  }
  return date.value;
});

const confirmationEmail = computed(() => {
  const fromDetails =
    bookingDetails.value?.rooms?.[0]?.guests?.main?.email ||
    bookingDetails.value?.order?.email;
  if (typeof fromDetails === "string" && fromDetails.trim() !== "") {
    return fromDetails.trim();
  }
  const orderEmail = createdBooking.value?.order?.email;
  if (typeof orderEmail === "string" && orderEmail.trim() !== "") {
    return orderEmail.trim();
  }
  return authStore.user?.email?.trim() || "";
});

const { startChangeServicesFlow } =
  useBookingChangeServices(currentBookingUuid);

const {
  isCancelBookingPopupOpen,
  isCancellingBooking,
  cancelBookingError,
  openCancelBookingPopup,
  closeCancelBookingPopup,
  confirmCancelBooking,
} = useBookingCancel(currentBookingUuid, bookingNumber, confirmationEmail);

const {
  isChangeContactsPopupOpen,
  isChangingContacts,
  changeContactsError,
  changeContactsSuccess,
  contactForm,
  canSubmitContactChange,
  openChangeContactsPopup,
  closeChangeContactsPopup,
  confirmChangeContacts,
} = useBookingChangeContacts(currentBookingUuid);

const {
  isChangeDatesPopupOpen,
  isChangingDates,
  changeDatesError,
  changeDatesSuccess,
  newDates,
  isChangeDatesCalendarOpen,
  canSubmitDateChange,
  openChangeDatesPopup,
  closeChangeDatesPopup,
  confirmChangeDates,
} = useBookingChangeDates(currentBookingUuid, bookingDate);

const {
  isChangeRoomPopupOpen,
  isChangingRoom,
  changeRoomError,
  changeRoomSuccess,
  openChangeRoomPopup,
  closeChangeRoomPopup,
  confirmChangeRoom,
} = useBookingChangeRoom(currentBookingUuid);

const showChangeServicesError = (detail: string) => {
  toast.add({
    severity: "error",
    summary: "Не удалось изменить услуги",
    detail,
    life: 5000,
  });
};

const {
  canEditDates,
  canEditRoom,
  canEditPackages,
  canEditContacts,
  canCancelBooking,
  hasManagementActions,
} = useBookingAllowedActions(() => bookingDetails.value?.allowed);

const rooms = computed<BookingDetailsRoom[] | undefined>(
  () => bookingDetails.value?.rooms,
);
const totalPrice = computed(() => bookingDetails.value?.total_price || 0);
const nights = computed(() => bookingDetails.value?.order?.nights || 0);
const hasPdf = computed(() => !!bookingDetails.value?.order?.pdf);

const userPhone = computed(() => {
  const phoneFromBooking =
    bookingDetails.value?.rooms?.[0]?.guests?.main?.phone ||
    bookingDetails.value?.order?.phone;

  return phoneFromBooking || authStore.user?.phone || "—";
});

const userEmail = computed(
  () => bookingDetails.value?.rooms?.[0]?.guests?.main?.email || "—",
);

const handleDownload = () => {
  const pdfUrl = bookingDetails.value?.order?.pdf;
  if (pdfUrl) {
    window.open(pdfUrl, "_blank");
  }
};

const handlePrint = () => {
  window.print();
};

const handleNewBooking = async () => {
  bookingStore.forceReset();
  await router.push("/");
};

const handleBackToCabinet = async () => {
  await router.push("/cabinet");
};

const handleChangeRoom = () => {
  if (bookingDate.value) {
    bookingStore.setDate([...bookingDate.value] as [Date, Date]);
  }
  bookingStore.setSearchResults(null);
  bookingStore.setSelectedRoomType(null);
  bookingStore.setSelectedTariff(null);
  bookingStore.setChangeRoomUuid(currentBookingUuid.value);
  void router.push("/rooms");
};

const handleChangeServices = async () => {
  const uuid = currentBookingUuid.value;
  if (!uuid) {
    showChangeServicesError(
      "UUID бронирования не найден. Обновите страницу.",
    );
    return;
  }

  if (bookingStore.createdBooking?.uuid !== uuid) {
    try {
      await bookingStore.getBookingByUuid(uuid);
    } catch (err: unknown) {
      if (await handleBookingAccessDeniedIfNeeded(err)) {
        return;
      }

      showChangeServicesError(
        getErrorMessage(err).trim() ||
          "Не удалось загрузить данные бронирования",
      );
      return;
    }
  }

  const flowError = startChangeServicesFlow();
  if (flowError) {
    showChangeServicesError(flowError);
    return;
  }

  await router.push("/services");
};

const openChangeRoomPopupIfNeeded = () => {
  if (
    bookingStore.changeRoomUuid &&
    bookingStore.changeRoomUuid === currentBookingUuid.value &&
    bookingStore.selectedRoomType
  ) {
    openChangeRoomPopup();
  }
};

onMounted(async () => {
  const bookingId = route.query.id;

  if (!bookingId) {
    if (!bookingDetails.value) {
      if (import.meta.dev) {
        console.warn("⚠️ ID бронирования не указан в query параметрах");
      }
      await router.push("/cabinet");
    } else {
      openChangeRoomPopupIfNeeded();
    }
    return;
  }

  isLoadingDetails.value = true;

  try {
    if (import.meta.dev) {
      console.log("📡 Загрузка деталей бронирования через API...", {
        bookingId,
      });
    }

    await bookingStore.getBookingDetails(
      typeof bookingId === "string" ? bookingId : String(bookingId),
    );

    if (import.meta.dev) {
      console.log("✅ Детали бронирования загружены");
    }

    openChangeRoomPopupIfNeeded();
  } catch (err: unknown) {
    if (import.meta.dev) {
      console.error("❌ Ошибка загрузки деталей бронирования:", err);
    }

    if (await handleBookingAccessDeniedIfNeeded(err)) {
      return;
    }

    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        getErrorMessage(err).trim() ||
        "Не удалось загрузить детали бронирования",
      life: 5000,
    });

    await router.push("/cabinet");
  } finally {
    isLoadingDetails.value = false;
  }
});
</script>

<template>
  <main :class="$style.container">
    <h1 :class="$style.header">Детали бронирования</h1>

    <article v-if="bookingDetails && !isLoadingDetails" :class="$style.content">
      <BookingDetailsHeader
        :booking-number="bookingNumber"
        :pdf-url="bookingDetails.order?.pdf"
        :has-pdf="hasPdf"
        @download="handleDownload"
        @print="handlePrint"
      />

      <template v-if="hasManagementActions">
        <hr :class="$style.divider" />

        <BookingDetailsManagement
          :can-edit-dates="canEditDates"
          :can-edit-room="canEditRoom"
          :can-edit-packages="canEditPackages"
          :can-edit-contacts="canEditContacts"
          @change-dates="openChangeDatesPopup"
          @change-room="handleChangeRoom"
          @change-services="handleChangeServices"
          @change-contacts="openChangeContactsPopup"
        />
      </template>

      <hr :class="$style.divider" />

      <BookingDetailsHotelInfo
        :name="HOTEL_INFO.name"
        :address="HOTEL_INFO.address"
        :phone="HOTEL_INFO.phone"
        :email="HOTEL_INFO.email"
        :image-url="HOTEL_INFO.imageUrl"
      />

      <hr :class="$style.divider" />

      <BookingDetailsSummary
        :start-date="bookingDetails.order?.start_at"
        :end-date="bookingDetails.order?.end_at"
        :nights="nights"
        :rooms="rooms"
        :total-price="totalPrice"
      />

      <hr :class="$style.divider" />

      <BookingDetailsPersonalInfo
        :name="bookingDetails.order?.name"
        :surname="bookingDetails.order?.surname"
        :nationality="bookingDetails.order?.nationality"
        :phone="userPhone"
        :email="userEmail"
        :comment="bookingDetails.order?.comment ?? undefined"
        :payment-method="bookingDetails.order?.payment_method"
      />

      <hr :class="$style.divider" />

      <BookingDetailsActions
        :can-cancel-booking="canCancelBooking"
        @cancel="openCancelBookingPopup"
        @new-booking="handleNewBooking"
        @back-to-cabinet="handleBackToCabinet"
      />
    </article>

    <section v-else-if="!isLoadingDetails" :class="$style.notFound">
      <p>Бронирование не найдено</p>
      <Button class="btn__bs dark" unstyled @click="handleBackToCabinet">
        Вернуться в кабинет
      </Button>
    </section>

    <section v-else :class="$style.loading">
      <p>Загрузка деталей бронирования...</p>
    </section>

    <BookingConfirmationCancelPopup
      :is-open="isCancelBookingPopupOpen"
      :is-cancelling-booking="isCancellingBooking"
      :cancel-booking-error="cancelBookingError"
      @close="closeCancelBookingPopup"
      @confirm="confirmCancelBooking"
    />

    <BookingConfirmationChangeDatesPopup
      v-model="newDates"
      :is-open="isChangeDatesPopupOpen"
      :is-calendar-open="isChangeDatesCalendarOpen"
      :can-submit-date-change="canSubmitDateChange"
      :is-changing-dates="isChangingDates"
      :change-dates-success="changeDatesSuccess"
      :change-dates-error="changeDatesError"
      @close="closeChangeDatesPopup"
      @confirm="confirmChangeDates"
      @update:is-calendar-open="isChangeDatesCalendarOpen = $event"
    />

    <BookingConfirmationChangeContactsPopup
      :is-open="isChangeContactsPopupOpen"
      :form="contactForm"
      :can-submit-contact-change="canSubmitContactChange"
      :is-changing-contacts="isChangingContacts"
      :change-contacts-success="changeContactsSuccess"
      :change-contacts-error="changeContactsError"
      @close="closeChangeContactsPopup"
      @confirm="confirmChangeContacts"
      @update:form="contactForm = $event"
    />

    <BookingConfirmationChangeRoomPopup
      :is-open="isChangeRoomPopupOpen"
      :is-changing-room="isChangingRoom"
      :change-room-success="changeRoomSuccess"
      :change-room-error="changeRoomError"
      @close="closeChangeRoomPopup"
      @confirm="confirmChangeRoom"
    />
  </main>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 auto rem(40);
    padding: rem(20);

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
    }
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: rem(24) 0 rem(32);
    font-family: var(--a-font-heading);
    font-size: rem(24);
    font-weight: 600;
    line-height: 1.3;
    color: var(--a-black);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(30);
      margin: rem(32) 0 rem(40);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(34);
      margin: rem(40) 0 rem(48);
    }
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  .notFound {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: rem(20);
    padding: rem(40) 0;
    font-family: var(--a-font-body);
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: rem(20);
    padding: rem(40) 0;
    font-family: var(--a-font-body);
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  .divider {
    width: 100%;
    height: rem(1);
    margin: 0;
    padding: 0;
    border: none;
    background-color: var(--a-black);
  }
</style>
