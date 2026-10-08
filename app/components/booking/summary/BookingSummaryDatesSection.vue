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
      <span :class="$style.detailArrow" aria-hidden="true">
        <span :class="$style.detailArrowLine" />
        <span :class="$style.detailArrowHead">
          <UIcon name="i-arrow-long" :class="$style.detailArrowIcon" />
        </span>
      </span>
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

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      display: contents;
    }
  }

  .pageSummaryHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--a-space-2);
    margin-bottom: var(--a-space-2);

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      position: sticky;
      top: 0;
      z-index: 1;
      margin-bottom: 0;
      padding-bottom: var(--a-space-2);
      background: var(--a-whiteBg);
    }
  }

  .infoButtonWrapper {
    flex-shrink: 0;

    @media (min-width: #{size.$desktopMin}) {
      display: none;
    }
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
    grid-template-columns: max-content minmax(0, 1fr) max-content;
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
    white-space: nowrap;

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      font-size: clamp(#{rem(14)}, 6.5cqi, #{rem(20)});
      line-height: 1.2;
    }
  }

  .detailArrow {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    color: var(--a-text-dark);
  }

  .detailArrowLine {
    flex: 1 1 auto;
    min-width: rem(12);
    height: 1px;
    background: currentcolor;
  }

  .detailArrowHead {
    flex: 0 0 rem(10);
    width: rem(10);
    height: rem(8);
    overflow: hidden;

    /* Остриё svg на доли пикселя ниже штриха — сдвиг сажает его на линию. */
    transform: translateY(-0.6px);
  }

  .detailArrowIcon {
    display: block;

    /* arrow-long.svg viewBox 117×8, остриё справа: окно .detailArrowHead показывает последние 10px. */
    width: rem(117);
    height: rem(8);
    max-width: none;
    margin-left: rem(-107);
    background-repeat: no-repeat;
    background-position: left center;
    background-size: rem(117) rem(8);
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
    width: auto;
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
