<script setup lang="ts">
import { computed, ref, toRefs, watch } from "vue";
import { storeToRefs } from "pinia";
import { formatCount } from "~/utils/declension";
import type { DeclensionRules } from "~/utils/declension";
import { useBookingStore, type SelectedService } from "~/stores/booking";
import type { SelectedEntry } from "~/types/booking";
import { formatPrice, toStayTotal } from "~/utils/price";
import BookingSummaryDatesSection from "~/components/booking/summary/BookingSummaryDatesSection.vue";
import BookingSummaryRoomItem from "~/components/booking/summary/BookingSummaryRoomItem.vue";

interface Props {
  selectedEntries: Record<string, SelectedEntry>;
  date: [Date, Date] | null | undefined;
  nights: number;
  bookingTotal: number;
  /**
   * Показывать CTA "Продолжить".
   * Используется на шагах оформления; на финальной странице скрываем.
   */
  showContinue?: boolean;
  /** Услуги из ответа API (confirmation); при наличии заменяют данные стора */
  servicesByRoomOverride?: Record<number, SelectedService[]>;
  /** Разрешить удаление услуг из сводки (на confirmation — только просмотр) */
  editableServices?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showContinue: true,
  editableServices: true,
  servicesByRoomOverride: undefined,
});
const emit = defineEmits<{
  (e: "continue"): void;
}>();

const { date, nights, selectedEntries, bookingTotal } = toRefs(props);
const isContinueVisible = computed(() => props.showContinue);
const isDatesDetailsOpen = ref(false);

const bookingStore = useBookingStore();
const { guests, selectedServicesByRoom } = storeToRefs(bookingStore);

const resolveServicesForRoom = (roomIdx: number): SelectedService[] => {
  if (props.servicesByRoomOverride !== undefined) {
    return props.servicesByRoomOverride[roomIdx] ?? [];
  }
  return selectedServicesByRoom.value[String(roomIdx)] ?? [];
};

const servicesByRoom = computed(() => {
  const byRoom: Record<number, SelectedService[]> = {};
  roomEntries.value.forEach((entry) => {
    byRoom[entry.roomIdx] = resolveServicesForRoom(entry.roomIdx);
  });
  return byRoom;
});

const roomTotalWithServices = (entry: SelectedEntry) => {
  const roomPrice = toStayTotal(entry.price, nights.value);
  const services = resolveServicesForRoom(entry.roomIdx);
  const servicesSum = services.reduce((sum, s) => sum + s.price, 0);
  return roomPrice + servicesSum;
};

const expandedRooms = ref<Record<number, boolean>>({});

const toggleRoomDetails = (roomIdx: number) => {
  expandedRooms.value[roomIdx] = !expandedRooms.value[roomIdx];
};

const isRoomExpanded = (roomIdx: number) => !!expandedRooms.value[roomIdx];

const ADULT_DECLENSION: DeclensionRules = {
  one: "взрослый",
  few: "взрослых",
  many: "взрослых",
};

const CHILD_DECLENSION: DeclensionRules = {
  one: "ребёнок",
  few: "ребёнка",
  many: "детей",
};

const roomGuests = computed(
  () => guests.value?.roomList?.map((room) => ({ ...room })) ?? [],
);

const roomGuestLines = computed(() => {
  return roomGuests.value.map((room) => {
    if (!room) return [] as string[];
    const lines: string[] = [];
    if (room.adults > 0) {
      lines.push(
        `${formatCount(room.adults, ADULT_DECLENSION)} на основном месте`,
      );
    }
    if (room.children > 0) {
      lines.push(
        `${formatCount(room.children, CHILD_DECLENSION)} на дополнительном месте`,
      );
    }
    return lines;
  });
});

const roomEntries = computed(() =>
  Object.values(selectedEntries.value).sort((a, b) => a.roomIdx - b.roomIdx),
);

const hasRoomEntries = computed(() => roomEntries.value.length > 0);
const isSingleRoom = computed(() => roomEntries.value.length === 1);

watch(
  () => roomEntries.value.length,
  (length) => {
    if (length === 1) {
      expandedRooms.value[roomEntries.value[0]?.roomIdx] = true;
    }
  },
  { immediate: true },
);

const handleContinue = () => emit("continue");

const handleRemoveService = (roomIdx: number, serviceId: number) => {
  bookingStore.removeService(serviceId, roomIdx);
};
</script>

<template>
  <aside :class="$style.pageSummary">
    <div
      :class="[
        $style.pageSummaryInner,
        isDatesDetailsOpen ? $style.pageSummaryInner_expanded : undefined,
      ]"
    >
      <div :class="$style.pageSummaryScroll">
        <BookingSummaryDatesSection
          v-model:open="isDatesDetailsOpen"
          :date="date"
          :nights="nights"
          :show-toggle="hasRoomEntries"
        />

        <div v-if="hasRoomEntries" :class="$style.pageSummaryList">
          <BookingSummaryRoomItem
            v-for="entry in roomEntries"
            :key="entry.roomIdx + '-' + entry.ratePlanCode"
            :entry="entry"
            :nights="nights"
            :guest-lines="roomGuestLines[entry.roomIdx] || []"
            :services="servicesByRoom[entry.roomIdx] || []"
            :is-expanded="isRoomExpanded(entry.roomIdx)"
            :is-single-room="isSingleRoom"
            :editable-services="editableServices"
            :room-total="roomTotalWithServices(entry)"
            @toggle="toggleRoomDetails(entry.roomIdx)"
            @remove-service="
              (serviceId) => handleRemoveService(entry.roomIdx, serviceId)
            "
          />
        </div>
      </div>

      <div :class="$style.pageSummaryBottom">
        <div :class="$style.pageSummaryDivider" />
        <div :class="$style.pageSummaryGrandTotal">
          <span>Итого:</span>
          <strong>{{ formatPrice(bookingTotal) }} ₽</strong>
        </div>
        <div v-if="isContinueVisible" :class="$style.pageSummaryFooter">
          <UiButton
            unstyled
            :class="$style.pageContinueButton"
            @click="handleContinue"
          >
            Продолжить
          </UiButton>
        </div>
      </div>
    </div>
  </aside>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;
  @use "~/assets/styles/tools/mixins" as typo;

  .pageSummary {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: calc(100% - var(--a-space-6));
    max-width: 100%;
    max-height: calc(100vh - #{rem(50)});
    max-height: calc(100dvh - #{rem(50)});
    margin: 0 var(--a-space-3);
    padding: 0;
    overflow: hidden;
    background: var(--a-whiteBg);
    box-shadow: var(--a-shadow-summary);
    border-radius: var(--a-borderR--dialog) var(--a-borderR--dialog) 0 0;
    z-index: z.z("booking-summary");

    @media (min-width: #{size.$desktopMin}) {
      display: block;
      position: relative;
      left: auto;
      right: auto;
      bottom: auto;
      width: 100%;
      max-height: none;
      margin: 0;
      overflow: visible;
      box-shadow: none;
      border-radius: 0;
      z-index: auto;
      background: transparent;
    }
  }

  .pageSummaryInner {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    background: var(--a-whiteBg);
    box-shadow: none;
    border-radius: var(--a-borderR--dialog) var(--a-borderR--dialog) 0 0;
    padding: var(--a-space-3) var(--a-space-2);
    overflow: hidden;

    @media (min-width: #{size.$desktopMin}) {
      display: block;
      position: sticky;
      top: calc(var(--header-height, #{rem(96)}) + var(--a-space-3));
      min-height: unset;
      overflow: visible;
      box-shadow: var(--a-shadow-summary);
      border-radius: var(--a-borderR--card);
      padding: var(--a-space-3);
    }
  }

  .pageSummaryScroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      container-type: inline-size;
    }

    @media (min-width: #{size.$desktopMin}) {
      overflow: visible;
    }
  }

  .pageSummaryBottom {
    flex-shrink: 0;
  }

  .pageSummaryList {
    display: none;
    flex-direction: column;
    gap: var(--a-space-3);
  }

  .pageSummaryInner_expanded .pageSummaryList {
    display: flex;
  }

  @media (min-width: #{size.$desktopMin}) {
    .pageSummaryList {
      display: flex;
    }
  }

  .pageSummaryDivider {
    width: 100%;
    height: 1px;
    background-color: var(--a-border-dark);
    margin: var(--a-space-2) 0;
  }

  .pageSummaryGrandTotal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--a-space-2);
    margin-bottom: var(--a-space-3);
    @include typo.typo-h3;
    color: var(--a-text-dark);
  }

  .pageSummaryGrandTotal strong {
    @include typo.typo-h1;

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      font-size: rem(32);
      line-height: 1.2;
    }
  }

  @media (max-width: calc(#{size.$desktopMin} - 1px)) {
    .pageSummaryInner:not(.pageSummaryInner_expanded) {
      padding-top: rem(20);
      padding-bottom: rem(20);

      .pageSummaryDivider {
        margin: rem(12) 0;
      }

      .pageSummaryGrandTotal {
        margin-bottom: var(--a-space-2);
      }

      .pageSummaryGrandTotal strong {
        font-size: rem(28);
        line-height: 1.2;
      }
    }
  }

  .pageSummaryFooter {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pageContinueButton {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 rem(276);
    width: rem(276);
    max-width: 100%;
    min-height: rem(68);
    height: rem(68);
    padding: 0;
    border: none;
    border-radius: var(--a-borderR--booking-module);
    background-color: var(--a-primaryBg);
    color: var(--a-white);
    font-family: var(--a-font-body);
    font-size: rem(24);
    font-weight: 400;
    line-height: 1;
    cursor: pointer;

    &:hover:not(:disabled) {
      background-color: var(--a-blackBg);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-border-primary);
      outline-offset: rem(2);
    }
  }
</style>
