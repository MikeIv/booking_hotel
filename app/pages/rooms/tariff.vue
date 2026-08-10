<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import type { RoomTariff } from "~/types/room";
  import { useNotificationToast } from "~/composables/useToast";
  import { isStaleSearchError } from "~/utils/staleSearchError";

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const toast = useNotificationToast();
  const bookingStore = useBookingStore();
  const { searchResults, selectedRoomType, roomTariffs, date, guests } =
    storeToRefs(bookingStore);
  const loading = ref(true);
  const error = ref<Error | null>(null);
  const isPopupOpen = ref(false);
  const expandedRooms = ref<Record<string, boolean>>({});

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  const toggleExpand = (roomTitle: string) => {
    expandedRooms.value[roomTitle] = !expandedRooms.value[roomTitle];
  };

  // Фильтруем тарифы для выбранного типа номера
  const filteredRoomTariffs = computed(() => {
    if (!selectedRoomType.value || !roomTariffs.value?.length) {
      return roomTariffs.value || [];
    }

    // Фильтруем номера по выбранному типу
    const filtered = roomTariffs.value.filter(
      (room) => room.room_type_code === selectedRoomType.value,
    );

    // Если нашли номера с тарифами, возвращаем их
    if (filtered.length > 0) {
      return filtered;
    }

    // Если не нашли, возвращаем все номера (на случай, если код не совпадает)
    return roomTariffs.value;
  });

  const handleTariff = async (tariff: RoomTariff) => {
    if (!selectedRoomType.value) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Выберите тип номера перед продолжением",
        life: 3000,
      });
      return;
    }
    bookingStore.setSelectedTariff(tariff);

    if (bookingStore.changeRoomUuid) {
      await router.push(`/confirmation?uuid=${bookingStore.changeRoomUuid}`);
      return;
    }

    await router.push("/services");
  };

  const goBackToRooms = async () => {
    bookingStore.setLoading(true, "Загружаем номера...");
    bookingStore.setServerRequest(true);
    bookingStore.setSelectedRoomType(null);
    bookingStore.setSearchResults(null);
    try {
      await router.push("/rooms");
      await nextTick();
    } finally {
      // loading и isServerRequest будут сброшены после загрузки данных на странице /rooms
    }
  };

  onMounted(async () => {
    // Если выбрано больше одного номера — редирект на мультибронирование
    const roomsCount = guests.value?.roomList
      ? guests.value.roomList.length
      : guests.value?.rooms || 1;
    if (roomsCount > 1) {
      router.push("/multi-rooms");
      return;
    }

    const totalAdults = guests.value?.roomList
      ? guests.value.roomList.reduce((sum, r) => sum + r.adults, 0)
      : 0;

    if (!date.value || totalAdults === 0) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Укажите даты и количество гостей",
        life: 3000,
      });
      router.push("/");
      return;
    }

    if (!selectedRoomType.value) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Тип номера не выбран",
        life: 3000,
      });
      router.push("/rooms");
      return;
    }

    // Проверяем, есть ли уже загруженные данные для выбранного типа номера
    const hasValidData =
      roomTariffs.value?.length > 0 &&
      roomTariffs.value.some(
        (room) =>
          room.room_type_code === selectedRoomType.value &&
          room.tariffs &&
          room.tariffs.length > 0,
      );

    if (hasValidData) {
      loading.value = false;
      return;
    }

    try {
      loading.value = true;
      await bookingStore.search({ roomTypeCode: selectedRoomType.value });
      await nextTick();
    } catch (err: unknown) {
      if (isStaleSearchError(err)) {
        return;
      }
      error.value = err as Error;
      toast.add({
        severity: "error",
        summary: "Ошибка загрузки",
        detail:
          (err as Error)?.message || "Произошла ошибка при загрузке тарифов",
        life: 3000,
      });
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор тарифа для номера</h1>

    <Booking mode="inner" />

    <section :class="$style.tariffBlock">
      <UiButton
        :class="$style.return"
        variant="text"
        icon="i-arrow-back"
        icon-position="left"
        :icon-size="28"
        @click="goBackToRooms"
      >
        Назад к выбору номеров
      </UiButton>

      <div v-if="loading" :class="$style.loadingContainer">
        <div :class="$style.spinner" />
        <p>Загрузка тарифов...</p>
      </div>

      <div v-else-if="error" :class="$style.errorContainer">
        <p>Произошла ошибка при загрузке тарифов. Попробуйте позже.</p>
      </div>

      <template v-else>
        <h2 :class="$style.tariffTitle">Выберите тариф к номеру</h2>

        <div v-if="filteredRoomTariffs?.length > 0" :class="$style.tariffs">
          <div
            v-for="(room, index) in filteredRoomTariffs"
            :key="`room-${room.room_type_code || room.id || index}`"
            :class="$style.tariffCard"
          >
            <BookingRoomInfoCard
              :room="room"
              :expanded="expandedRooms[room.title || '']"
              @open-popup="openPopup"
              @toggle-expand="toggleExpand"
            />
            <BookingTariffsList
              :tariffs="room.tariffs || []"
              :tariff-groups="searchResults?.tariffGroups"
              @book-tariff="handleTariff"
            />
            <BookingRoomPopup
              :room="room"
              :is-open="isPopupOpen"
              @close="closePopup"
            />
          </div>
        </div>

        <div
          v-else-if="searchResults && !searchResults.available"
          :class="$style.noResults"
        >
          <p>К сожалению, на выбранные даты нет доступных номеров.</p>
        </div>

        <div v-else :class="$style.noResults">
          <p>Тарифы не найдены. Проверьте выбранные параметры.</p>
        </div>
      </template>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
    padding: 0 rem(20);

    @media (min-width: #{size.$desktopMin}) {
      padding: 0 rem(60);
    }
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    font-family: var(--a-font-heading);
    font-size: rem(34);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .tariffBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(20) 0;

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin: 0 auto;
    }
  }

  .return {
    margin-bottom: rem(40);
    margin-right: auto;
  }

  .tariffTitle {
    margin-bottom: rem(40);
    text-align: center;
    font-family: var(--a-font-heading);
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-text-dark);
    text-transform: uppercase;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(28);
    }
  }

  .tariffs {
    display: flex;
    flex-direction: column;
    gap: rem(32);
    margin-bottom: rem(40);
  }

  .tariffCard {
    display: flex;
    flex-direction: column;
  }

  .noResults {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-lightPrimaryBg);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }

  .loadingContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: rem(40) 0;
  }

  .spinner {
    width: rem(40);
    height: rem(40);
    border: rem(3) solid var(--a-border-light);
    border-top: rem(3) solid var(--a-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: rem(16);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .errorContainer {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-lightPrimaryBg);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }
</style>
