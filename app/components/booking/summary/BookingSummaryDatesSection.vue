<script setup lang="ts">
import { formatCount } from "~/utils/declension";
import { formatDateLong, formatWeekdayLong } from "~/utils/dateFormat";
import { HOTEL_INFO } from "~/utils/hotel";

const props = withDefaults(
  defineProps<{
    date: [Date, Date] | null | undefined;
    nights: number;
    open: boolean;
    showToggle?: boolean;
  }>(),
  {
    showToggle: false,
  },
);

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const checkInDate = computed(() => props.date?.[0] ?? null);
const checkOutDate = computed(() => props.date?.[1] ?? null);
const checkInFormatted = computed(() => formatDateLong(checkInDate.value));
const checkOutFormatted = computed(() => formatDateLong(checkOutDate.value));
const checkInWeekday = computed(() => formatWeekdayLong(checkInDate.value));
const checkOutWeekday = computed(() => formatWeekdayLong(checkOutDate.value));
const nightsLabel = computed(() => formatCount(props.nights, "night"));
const checkInTimeLabel = `с ${HOTEL_INFO.checkInTime}`;
const checkOutTimeLabel = `до ${HOTEL_INFO.checkOutTime}`;

const toggle = () => emit("update:open", !props.open);
</script>

<template>
  <div :class="$style.section">
    <div :class="$style.pageSummaryHeader">
      <span :class="$style.pageSummaryTitle">Ваше бронирование:</span>
      <div v-if="showToggle" :class="$style.infoButtonWrapper">
        <BookingInfoButton
          :icon-name="open ? 'i-chevron-up' : 'i-chevron-down'"
          aria-label="Подробнее о составе бронирования"
          :aria-expanded="open"
          @click="toggle"
        />
      </div>
    </div>
    <div v-if="!open" :class="$style.pageSummaryDatesMobile">
      {{ checkInFormatted }} - {{ checkOutFormatted }}, {{ nightsLabel }}
    </div>
    <div
      :class="[$style.datesBlock, open ? $style.datesBlock_open : undefined]"
    >
      <span :class="$style.bookingDetailLabel">{{ checkInFormatted }}</span>
      <UIcon name="i-arrow-long" :class="$style.detailIcon" />
      <span :class="[$style.bookingDetailLabel, $style.dayRight]">{{
        checkOutFormatted
      }}</span>
      <div :class="$style.dayMeta">
        <span :class="$style.detailDay">{{ checkInWeekday }}</span>
        <span :class="$style.detailDay">{{ checkInTimeLabel }}</span>
      </div>
      <span :class="$style.weekday">{{ nightsLabel }}</span>
      <div :class="[$style.dayMeta, $style.dayRight]">
        <span :class="$style.detailDay">{{ checkOutWeekday }}</span>
        <span :class="$style.detailDay">{{ checkOutTimeLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/tools/mixins" as typo;

  .section {
    display: flex;
    flex-direction: column;
  }

  .pageSummaryHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--a-space-2);
    margin-bottom: var(--a-space-2);
  }

  .infoButtonWrapper {
    flex-shrink: 0;
  }

  .pageSummaryTitle {
    @include typo.typo-h3;
    color: var(--a-text-dark);
  }

  .pageSummaryDatesMobile {
    display: block;
    margin-bottom: var(--a-space-2);
    @include typo.typo-h3;
    color: var(--a-text-dark);
    text-align: left;

    @media (min-width: #{size.$desktopMin}) {
      display: none;
    }
  }

  .datesBlock {
    display: none;
    grid-template-columns: minmax(0, 1fr) minmax(rem(64), rem(188)) minmax(
        0,
        1fr
      );
    align-items: center;
    column-gap: var(--a-space-2);
    row-gap: var(--a-space-3);
    margin-bottom: var(--a-space-3);
  }

  .datesBlock_open {
    display: grid;
  }

  @media (min-width: #{size.$desktopMin}) {
    .datesBlock {
      display: grid;
    }
  }

  .bookingDetailLabel {
    min-width: 0;
    @include typo.typo-h3;
    color: var(--a-text-dark);
  }

  .detailIcon {
    width: 100%;
    height: rem(8);
    color: var(--a-text-dark);
  }

  .dayMeta {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-025);
    min-width: 0;
  }

  .detailDay {
    min-width: 0;
    @include typo.typo-body-md;
    color: var(--a-text-dark);
    overflow-wrap: anywhere;
  }

  .dayRight {
    text-align: right;
    justify-self: end;
  }

  .weekday {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
    box-sizing: border-box;
    width: 100%;
    max-width: rem(162);
    height: rem(24);
    padding: rem(4) var(--a-space-2);
    @include typo.typo-body-sm;
    color: var(--a-text-dark);
    text-align: center;
    white-space: nowrap;
    border: 1px solid var(--a-border-dark);
    border-radius: var(--a-borderR--x20);
    box-shadow: var(--a-shadow-weekday);
  }
</style>
