<script setup lang="ts">
import { formatCount } from "~/utils/declension";
import { formatDateLong, formatWeekdayLong } from "~/utils/dateFormat";

const props = defineProps<{
  date: [Date, Date] | null | undefined;
  nights: number;
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const formatNights = (nights: number): string => {
  if (nights === 1) return "ночь";
  if (nights >= 2 && nights <= 4) return "ночи";
  return "ночей";
};

const checkInDate = computed(() => props.date?.[0] ?? null);
const checkOutDate = computed(() => props.date?.[1] ?? null);
const checkInFormatted = computed(() => formatDateLong(checkInDate.value));
const checkOutFormatted = computed(() => formatDateLong(checkOutDate.value));
const checkInWeekday = computed(() => formatWeekdayLong(checkInDate.value));
const checkOutWeekday = computed(() => formatWeekdayLong(checkOutDate.value));

const toggle = () => emit("update:open", !props.open);
</script>

<template>
  <div>
    <div :class="$style.pageSummaryHeader">
      <span :class="$style.pageSummaryTitle">Ваше бронирование:</span>
      <div :class="$style.infoButtonWrapper">
        <BookingInfoButton
          :icon-name="open ? 'i-chevron-up' : 'i-chevron-down'"
          aria-label="Подробнее о датах проживания"
          :aria-expanded="open"
          @click="toggle"
        />
      </div>
    </div>
    <div v-if="!open" :class="$style.pageSummaryDatesMobile">
      {{ formatDateLong(date?.[0] || null) }} -
      {{ formatDateLong(date?.[1] || null) }}, {{ nights }}
      {{ formatNights(nights) }}
    </div>
    <div :class="$style.pageSummaryDates">
      {{ formatDateLong(date?.[0] || null) }} -
      {{ formatDateLong(date?.[1] || null) }}, {{ nights }}
      {{ formatNights(nights) }}
    </div>
    <div
      :class="[$style.pageSummaryDatesDetails, open ? $style.open : undefined]"
    >
      <div :class="$style.roomInfoBlock">
        <div :class="$style.dateRow">
          <span :class="$style.bookingDetailLabel">{{ checkInFormatted }}</span>
          <UIcon name="i-arrow-long" :class="$style.detailIcon" />
          <span :class="$style.bookingDetailLabel">{{
            checkOutFormatted
          }}</span>
        </div>
        <div :class="$style.weekdayRow">
          <span :class="$style.detailDay">{{ checkInWeekday }}</span>
          <span :class="$style.weekday">{{
            formatCount(nights, "night")
          }}</span>
          <span :class="[$style.detailDay, $style.dayRight]">{{
            checkOutWeekday
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/tools/mixins" as typo;

  .pageSummaryHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: rem(8);
  }

  .infoButtonWrapper {
    @media (min-width: #{size.$desktopMin}) {
      display: none;
    }
  }

  .pageSummaryTitle {
    @include typo.typo-h3;
    color: var(--a-text-dark);
  }

  .pageSummaryDates {
    display: none;
    margin-bottom: rem(12);
    @include typo.typo-h3;
    color: var(--a-text-dark);
    text-align: center;
  }

  .pageSummaryDatesMobile {
    display: block;
    margin-bottom: rem(12);
    @include typo.typo-h3;
    color: var(--a-text-dark);
    text-align: center;

    @media (min-width: #{size.$desktopMin}) {
      display: none;
    }
  }

  .pageSummaryDatesDetails {
    display: none;
    margin-bottom: rem(12);
  }

  .open {
    display: block;
  }

  @media (min-width: #{size.$desktopMin}) {
    .pageSummaryDatesDetails {
      display: block;
    }
  }

  .roomInfoBlock {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    align-items: center;
    padding: rem(20) rem(24);
    background: var(--a-lightPrimaryBg);
    border-radius: var(--a-borderR--card);
  }

  .dateRow {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: rem(15);
  }

  .weekdayRow {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
  }

  .bookingDetailLabel {
    @include typo.typo-h3;
    color: var(--a-text-dark);
    white-space: nowrap;
  }

  .detailIcon {
    width: rem(62);
    height: rem(8);
    color: var(--a-text-dark);
  }

  .detailDay {
    flex-shrink: 0;
    width: rem(52);
    @include typo.typo-body-md;
    color: var(--a-text-dark);
    text-align: center;
  }

  .dayRight {
    width: rem(62);
    text-align: center;
  }

  .weekday {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: rem(161);
    height: rem(24);
    padding: rem(4) rem(28);
    @include typo.typo-body-sm;
    color: var(--a-text-dark);
    text-align: center;
    white-space: nowrap;
    border: 0.5px solid var(--a-border-dark);
    border-radius: var(--a-borderR--card);
    box-shadow: var(--a-shadow-weekday);
  }
</style>
