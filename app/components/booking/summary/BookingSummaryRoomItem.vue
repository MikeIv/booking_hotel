<script setup lang="ts">
import type { SelectedEntry } from "~/types/booking";
import type { SelectedService } from "~/stores/booking";
import { formatPrice, toStayTotal } from "~/utils/price";

defineProps<{
  entry: SelectedEntry;
  nights: number;
  guestLines: string[];
  services: SelectedService[];
  isExpanded: boolean;
  isSingleRoom: boolean;
  editableServices: boolean;
  roomTotal: number;
}>();

const emit = defineEmits<{
  toggle: [];
  "remove-service": [serviceId: number];
}>();
</script>

<template>
  <div :class="$style.pageSummaryItem">
    <Button
      v-if="!isSingleRoom"
      type="button"
      unstyled
      :class="$style.roomButton"
      :aria-expanded="isExpanded"
      @click="emit('toggle')"
    >
      <span :class="$style.roomButtonText">
        Номер {{ entry.roomIdx + 1 }}
      </span>
      <div :class="$style.roomButtonIconWrapper">
        <UIcon
          name="i-chevron-down"
          :class="[
            $style.roomButtonIcon,
            { [$style.roomButtonIconRotated]: isExpanded },
          ]"
        />
      </div>
    </Button>
    <Transition name="fade">
      <div
        v-if="isSingleRoom || isExpanded"
        :class="$style.roomDetails"
      >
        <div :class="$style.roomCategoryRow">
          <span :class="$style.roomType">{{ entry.roomTitle }}</span>
          <span :class="$style.roomPrice">
            {{ formatPrice(toStayTotal(entry.price, nights)) }} ₽
          </span>
        </div>
        <div :class="$style.roomTariff">{{ entry.title }}</div>
        <div v-if="guestLines.length > 0" :class="$style.roomDivider" />
        <div
          v-for="(line, idx) in guestLines"
          :key="idx"
          :class="$style.roomGuestLine"
        >
          {{ line }}
        </div>
        <div
          v-if="guestLines.length > 0 && services.length > 0"
          :class="$style.roomDivider"
        />
        <template v-if="services.length > 0">
          <div :class="$style.servicesSection">
            <div :class="$style.servicesHeader">Дополнительные услуги:</div>
            <div :class="$style.servicesList">
              <div
                v-for="service in services"
                :key="service.id"
                :class="$style.serviceItem"
              >
                <span :class="$style.serviceTitle">{{ service.title }}</span>
                <div :class="$style.serviceActions">
                  <span :class="$style.servicePrice">
                    {{ formatPrice(service.price) }} ₽
                  </span>
                  <Button
                    v-if="editableServices"
                    type="button"
                    unstyled
                    :class="$style.removeServiceButton"
                    aria-label="Удалить услугу"
                    @click="emit('remove-service', service.id)"
                  >
                    <UIcon name="i-close" :class="$style.removeIcon" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-if="!isSingleRoom">
          <div :class="$style.roomDivider" />
          <div :class="$style.roomTotal">
            <span>Итого за номер {{ entry.roomIdx + 1 }}:</span>
            <strong>{{ formatPrice(roomTotal) }} ₽</strong>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/tools/mixins" as typo;

  .pageSummaryItem {
    display: flex;
    flex-direction: column;
    gap: var(--a-space-2);
  }

  .roomButton {
    display: flex;
    align-items: center;
    gap: var(--a-space-1);
    padding: 0 var(--a-space-3);
    width: 100%;
    height: rem(50);
    border: none;
    border-radius: var(--a-borderR--pill);
    background-color: var(--a-primaryBg);
    cursor: pointer;

    &:hover:not(:disabled) {
      background-color: var(--a-blackBg);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-border-primary);
      outline-offset: rem(2);
    }
  }

  .roomButtonText {
    flex: 1;
    text-align: left;
    @include typo.typo-body-lg;
    font-weight: 700;
    color: var(--a-white);
  }

  .roomButtonIconWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(28);
    height: rem(28);
    background: var(--a-white);
    border-radius: 50%;
  }

  .roomButtonIcon {
    width: rem(16);
    height: rem(16);
    color: var(--a-text-dark);
    transition: transform 0.3s ease;
  }

  .roomButtonIconRotated {
    transform: rotate(180deg);
  }

  .roomDetails {
    display: flex;
    flex-direction: column;
    gap: var(--a-space-2);
  }

  .roomCategoryRow {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--a-space-2);
  }

  .roomType {
    flex: 1;
    min-width: 0;
    @include typo.typo-h3;
    color: var(--a-text-dark);

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      font-size: clamp(#{rem(14)}, 4vw, #{rem(18)});
      font-weight: 700;
      line-height: 1.2;
    }
  }

  .roomPrice {
    @include typo.typo-h3;
    color: var(--a-text-dark);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .roomTariff {
    @include typo.typo-body-lg;
    font-weight: 700;
    color: var(--a-text-dark);

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      font-size: clamp(#{rem(14)}, 4vw, #{rem(18)});
      line-height: 1.2;
    }
  }

  .roomDivider {
    width: 100%;
    height: 1px;
    background-color: var(--a-border-dark);
  }

  .roomGuestLine {
    @include typo.typo-body-md;
    font-weight: 500;
    color: var(--a-text-dark);

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      line-height: 1.2;
    }
  }

  .roomTotal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--a-space-2);
    @include typo.typo-h3;
    color: var(--a-text-dark);
  }

  .roomTotal strong {
    @include typo.typo-h2;
  }

  .servicesSection {
    display: flex;
    flex-direction: column;
    gap: var(--a-space-2);
  }

  .servicesHeader {
    @include typo.typo-body-lg;
    font-weight: 700;
    color: var(--a-text-dark);

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      line-height: 1.2;
    }
  }

  .servicesList {
    display: flex;
    flex-direction: column;
    gap: var(--a-space-1);
  }

  .serviceItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--a-space-2);
    padding: var(--a-space-1) 0;
  }

  .serviceTitle {
    flex: 1;
    min-width: 0;
    @include typo.typo-body-md;
    font-weight: 500;
    color: var(--a-text-dark);

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      font-size: clamp(#{rem(14)}, 4vw, #{rem(16)});
      line-height: 1.2;
    }
  }

  .serviceActions {
    display: flex;
    align-items: center;
    gap: var(--a-space-2);
  }

  .servicePrice {
    @include typo.typo-body-md;
    font-weight: 700;
    color: var(--a-text-dark);
    white-space: nowrap;
  }

  .removeServiceButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(24);
    height: rem(24);
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .removeServiceButton:hover {
    opacity: 0.7;
  }

  .removeIcon {
    width: rem(20);
    height: rem(20);
    color: var(--a-text-dark);
  }
</style>
