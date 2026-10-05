<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useNotificationToast } from "~/composables/useToast";
  import { useRoomFilters } from "~/composables/useRoomFilters";
  import { isStaleSearchError } from "~/utils/staleSearchError";
  import { BOOKING_DEEP_LINK_PENDING_SEARCH_KEY } from "~/utils/bookingDeepLink";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults, date, guests, loading } = storeToRefs(bookingStore);
  const toast = useNotificationToast();
  const router = useRouter();

  /**
   * Флаг deep-link с ukraina-hotel.ru: пришёл переход со страницы поиска.
   * Значение читаем в onMounted — setup страницы и плагин deep-link идут в разном
   * порядке, поэтому снимок в setup брать нельзя (ref из useState общий).
   */
  const pendingDeepLinkSearch = useState<boolean>(
    BOOKING_DEEP_LINK_PENDING_SEARCH_KEY,
    () => false,
  );

  /** Гасим прелоадер, когда поиск так и не запускается. */
  function resetPendingSearch() {
    pendingDeepLinkSearch.value = false;
    bookingStore.setLoading(false);
    bookingStore.setServerRequest(false);
  }

  const searchFilters = computed(() => searchResults.value?.filters);
  const { selectedView, viewOptions, filterRoomList } =
    useRoomFilters(searchFilters);

  const totalAdults = computed(() => {
    if (!guests.value?.roomList) return 0;
    return guests.value.roomList.reduce((sum, r) => sum + r.adults, 0);
  });

  const filteredRooms = computed(() =>
    filterRoomList(searchResults.value?.rooms),
  );

  const hasSearchResults = computed(() => {
    return (searchResults.value?.rooms?.length ?? 0) > 0;
  });

  onMounted(async () => {
    // Читаем флаг после применения deep-link плагином
    const forceSearch = pendingDeepLinkSearch.value;

    if (!date.value || totalAdults.value === 0) {
      resetPendingSearch();
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Укажите даты и количество гостей",
        life: 3000,
      });
      router.push("/");
      return;
    }

    pendingDeepLinkSearch.value = false;

    if (forceSearch || !searchResults.value) {
      try {
        await bookingStore.search();
      } catch (error: unknown) {
        if (isStaleSearchError(error)) {
          return;
        }
        if (import.meta.dev) {
          console.error("Ошибка при загрузке сохраненного поиска:", error);
        }
        toast.add({
          severity: "error",
          summary: "Ошибка загрузки",
          detail:
            (error as Error)?.message || "Произошла ошибка при поиске номеров",
          life: 3000,
        });
      }
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор номера</h1>
    <Booking mode="inner" />

    <div :class="$style.filtersWrapper" data-testid="filters-wrapper">
      <UiFilterSelect
        v-model="selectedView"
        :options="viewOptions"
        option-label="title"
        option-value="id"
        placeholder="Вид из окна"
      />
    </div>

    <div v-if="loading || bookingStore.isServerRequest" :class="$style.loading" data-testid="loading">Загрузка номеров...</div>

    <template v-else-if="hasSearchResults">
      <section :class="$style.roomsList">
        <BookingCard
          v-for="item in filteredRooms"
          :key="item.room_type_code"
          :room="item"
        />
        <div v-if="filteredRooms.length === 0" :class="$style.noFilterResults" data-testid="no-filter-results">
          Нет номеров с выбранными параметрами
        </div>
      </section>
    </template>

    <div v-else-if="!loading && !bookingStore.isServerRequest" :class="$style.noResults" data-testid="no-results">
      Нет доступных номеров. Выполните поиск.
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    max-width: #{size.$desktopMax};
    margin: 0 auto rem(40) auto;
    padding: 0 rem(20);
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    font-family: var(--a-font-heading);
    font-size: var(--ds-typo-size-h2);
    font-weight: var(--ds-typo-weight-semibold);
    line-height: var(--ds-typo-line-h2);
    color: var(--a-black);

    @media (min-width: #{size.$tablet}) {
      font-size: var(--ds-typo-size-h1);
      line-height: var(--ds-typo-line-h1);
    }

    @media (min-width: #{size.$desktopMin}) {
      margin: rem(40) 0 rem(60) 0;
    }
  }

  .filtersWrapper {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    margin-bottom: rem(20);
    width: 100%;

    @media (min-width: #{size.$tabletMin}) {
      flex-direction: row;
      gap: rem(24);
    }
  }

  .roomsList {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(20);
    width: 100%;
    padding: 0 rem(4) rem(40) rem(4);

    @media (min-width: #{size.$tabletMin}) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: #{size.$desktopMin}) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(40);
    font-size: var(--ds-typo-size-body-lg);
    color: var(--a-text-light);
  }

  .noResults {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(40);
    font-size: var(--ds-typo-size-body-lg);
    color: var(--a-text-accent);
    text-align: center;
  }

  .noFilterResults {
    display: flex;
    justify-content: center;
    align-items: center;
    grid-column: 1 / -1;
    padding: rem(40);
    font-size: var(--ds-typo-size-body-lg);
    color: var(--a-text-accent);
    text-align: center;
  }
</style>
