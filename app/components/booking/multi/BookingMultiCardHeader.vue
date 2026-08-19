<script setup lang="ts">
  import type { Room } from "~/types/room";
  import { formatCount } from "~/utils/declension";

  interface Props {
    room: Room;
    expanded: boolean;
  }

  defineProps<Props>();
  const emit = defineEmits<{
    (e: "open-popup", ev: MouseEvent): void;
    (e: "show-more"): void;
  }>();
</script>

<template>
  <main :class="$style.cardDetails">
    <div :class="$style.cardDetailsTop">
      <div :class="$style.wrapperInfoBlock">
        <div :class="$style.roomInfo">
          <h2 :class="$style.title">{{ room.title }}</h2>
          <UiButton
            type="button"
            variant="icon"
            size="icon40"
            :class="$style.infoButton"
            data-popup-button
            aria-label="Подробнее о номере"
            @click="emit('open-popup', $event)"
          >
            <UIcon
              name="i-chevron-down"
              :class="$style.chevronIcon"
              aria-hidden="true"
            />
          </UiButton>
        </div>

        <dl :class="$style.description">
          <div :class="$style.item">
            <dt :class="$style.itemTerm">
              <UIcon name="i-persons" :class="$style.icon" aria-hidden="true" />
            </dt>
            <dd :class="$style.itemTitle">
              До {{ formatCount(room.max_occupancy, "capacity") }}
            </dd>
          </div>
          <div :class="$style.item">
            <dt :class="$style.itemTerm">
              <UIcon name="i-square" :class="$style.icon" aria-hidden="true" />
            </dt>
            <dd :class="$style.itemTitle">
              <BookingSquareMeters :value="room.square" />
            </dd>
          </div>
          <div :class="$style.item">
            <dt :class="$style.itemTerm">
              <UIcon name="i-dash-square" :class="$style.icon" aria-hidden="true" />
            </dt>
            <dd :class="$style.itemTitle">{{
              formatCount(room.rooms, "chamber")
            }}</dd>
          </div>
        </dl>
      </div>

      <div :class="$style.amenitiesSection">
        <UiAmenitiesList
          :items="room.amenities || []"
          :expanded="expanded"
          :limit="4"
          size="lg"
          :class="$style.amenitiesListView"
          @show-more="emit('show-more')"
        />
      </div>
    </div>
  </main>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .cardDetails {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;

    @media (min-width: 1025px) {
      flex: 1 1 40%;
      min-width: rem(240);
      flex-direction: column;
      padding: rem(22) 0 0 rem(22);
      overflow-wrap: break-word;
      word-break: break-word;
    }
  }

  .cardDetailsTop {
    display: flex;
    flex-direction: column;
    min-width: 0;

    @media (min-width: 1025px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
      padding: 0 rem(22) 0 0;
    }
  }

  .wrapperInfoBlock {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: rem(16);
    padding: rem(22) rem(22) 0;
    min-width: 0;

    @media (min-width: #{size.$tablet}) {
      padding: rem(22) rem(22) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      flex: 0 0 auto;
      padding: 0;
      gap: rem(16);
      min-width: rem(181);
    }
  }

  .roomInfo {
    display: flex;
    align-items: center;
    gap: rem(7);
    min-height: rem(54);
  }

  .title {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    font-family: var(--a-font-heading);
    font-size: rem(22);
    font-weight: bold;
    color: var(--a-text-dark);
    margin: 0;
    line-height: normal;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }

  .infoButton {
    flex-shrink: 0;
  }

  .chevronIcon {
    width: rem(28);
    height: rem(28);
    color: currentColor;
  }

  .description {
    display: flex;
    flex-wrap: wrap;
    gap: rem(10);
    margin: 0;
    padding: 0;

    @media (min-width: #{size.$tablet}) {
      gap: rem(10);
    }

    @media (min-width: #{size.$desktopMin}) {
      gap: rem(10) rem(36);
    }
  }

  .item {
    display: flex;
    flex-shrink: 0;
    gap: rem(8);
    align-items: center;
    margin-bottom: rem(8);
  }

  .itemTerm {
    display: flex;
    align-items: center;
    margin: 0;
  }

  .icon {
    width: rem(18);
    height: rem(18);
    color: var(--a-text-light);
  }

  .itemTitle {
    font-family: var(--a-font-body);
    font-size: rem(14);
    font-weight: 500;
    line-height: 1.3;
    color: var(--a-text-dark);
    margin: 0;
    white-space: nowrap;
  }

  .amenitiesSection {
    margin: rem(20) 0 0 0;
    padding: 0 rem(22) rem(20);
    border-bottom: 1px solid var(--a-border-primary);
    min-width: 0;

    @media (min-width: #{size.$tablet}) {
      padding: 0 rem(22) rem(20);
    }

    @media (min-width: #{size.$desktopMin}) {
      flex: 1;
      margin: 0;
      padding: 0 0 0 rem(16);
      border-bottom: none;
      align-self: flex-start;
    }
  }

  .amenitiesListView {
    --ui-amenities-gap-row: #{rem(10)};
    --ui-amenities-gap-column: #{rem(16)};

    @media (min-width: #{size.$tablet}) {
      --ui-amenities-gap-row: #{rem(16)};
      --ui-amenities-gap-column: #{rem(16)};
    }

    @media (min-width: #{size.$desktopMin}) {
      --ui-amenities-gap-row: #{rem(8)};
      --ui-amenities-gap-column: #{rem(16)};
      max-width: 100%;
      align-content: flex-start;
    }

    @media (min-width: #{size.$desktopMedium}) {
      max-width: rem(263);
    }
  }
</style>
