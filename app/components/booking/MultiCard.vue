<script setup lang="ts">
  import type { Room, PackageResource } from "~/types/room";
  import BookingMultiCardHeader from "~/components/booking/multi/BookingMultiCardHeader.vue";
  import BookingMultiCardTariffs from "~/components/booking/multi/BookingMultiCardTariffs.vue";

  interface Props {
    room: Room;
    services?: PackageResource[];
    selectedCodes?: Record<string, string>;
    roomCardIdx?: number;
    isAllRoomsSelected?: boolean;
    disabledRoomIndices?: Set<number>;
  }

  defineProps<Props>();
  const emit = defineEmits<{
    (e: "open-service-popup", ev: MouseEvent, service: PackageResource): void;
    (
      e: "select-tariff",
      ratePlanCode: string,
      roomIdx: number,
      roomCardIdx?: number,
    ): void;
  }>();

  const isPopupOpen = ref(false);
  const expanded = ref(false);

  const _toggleExpand = () => {
    expanded.value = true;
  };

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  function onSelectTariff(
    ratePlanCode: string,
    roomIdx: number,
    roomCardIdx?: number,
  ) {
    emit("select-tariff", ratePlanCode, roomIdx, roomCardIdx);
  }
</script>

<template>
  <article :class="$style.card">
    <div :class="$style.cardContent">
      <div :class="$style.topSection">
        <header :class="$style.carouselWrapper">
          <BookingCarousel
            :images="room.photos || []"
            :alt-prefix="'Фото номера'"
            :alt-text="room.title"
            height="326px"
          />
        </header>

        <BookingMultiCardHeader
          :room="room"
          :expanded="expanded"
          @open-popup="openPopup"
          @show-more="_toggleExpand"
        />
      </div>

      <BookingMultiCardTariffs
        :room="room"
        :selected-codes="selectedCodes"
        :room-card-idx="roomCardIdx"
        :is-all-rooms-selected="isAllRoomsSelected"
        :disabled-room-indices="disabledRoomIndices"
        @select-tariff="onSelectTariff"
      />
    </div>
    <BookingRoomPopup :room="room" :is-open="isPopupOpen" @close="closePopup" />
  </article>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: rem(200);
    padding: 0;
    background: var(--a-whiteBg);
    box-shadow: 4px 4px 30px rgba(0, 0, 0, 0.1);
    border-radius: rem(22);
    overflow: hidden;
  }

  .cardContent {
    display: flex;
    flex-direction: column;
  }

  .topSection {
    display: flex;
    flex-direction: column;

    @media (min-width: 1025px) {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  .carouselWrapper {
    display: flex;
    width: 100%;
    height: 100%;
    margin-bottom: 0;
    min-height: rem(202);
    justify-content: center;
    align-items: flex-start;

    @media (min-width: #{size.$tablet}) {
      min-height: rem(281);
    }

    @media (min-width: 1025px) {
      flex: 0 1 60%;
      max-width: 60%;
      min-width: rem(320);
      min-height: rem(281);
    }

    @media (min-width: #{size.$desktopMedium}) {
      flex: 0 1 60%;
      max-width: 60%;
      min-height: rem(281);
    }

  }
</style>
