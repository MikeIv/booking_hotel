<script setup lang="ts">
import { AGE_MIN, AGE_MAX } from "~/utils/age";
import { declension } from "~/utils/declension";
import { useBookingStore } from "~/stores/booking";
import type { ApiError } from "~/composables/useApi";
import { getRequestErrorContent } from "~/components/common/RequestErrorMessage.vue";
import { useNotificationToast } from "~/composables/useToast";
import {
  getExpectedRoomCount,
  getUnavailableRoomIndices,
  MULTI_BOOKING_UNAVAILABLE_TOAST,
} from "~/utils/multiBooking";
import { isStaleSearchError } from "~/utils/staleSearchError";
import { MAX_GUESTS_PER_ROOM } from "~/utils/bookingSearch";
import type { ShrinkMultiHints } from "~/utils/bookingPersist";

export interface RoomGuests {
  adults: number;
  children: number;
  childrenAges: number[];
}

interface GuestsValue {
  rooms: number;
  roomList: RoomGuests[];
}

interface LegacyGuestsValue {
  rooms: number;
  adults: number;
  children: number;
}

const MAX_ROOMS = 5;

  const props = defineProps<{
    modelValue:
      | GuestsValue
      | { rooms: number; adults: number; children: number };
  }>();
  const emit = defineEmits<{
    "update:modelValue": [value: GuestsValue, hints?: ShrinkMultiHints];
  }>();

  /** Shrink-подсказки для store (сбрасываются при apply). */
  let pendingShrinkHints: ShrinkMultiHints | undefined;

  const bookingStore = useBookingStore();
  const router = useRouter();
  const toast = useNotificationToast();
  const { multiBookingUnavailableRooms } = storeToRefs(bookingStore);

  const isApplying = ref(false);

  function clearUnavailableHighlight() {
    bookingStore.clearMultiBookingUnavailableRooms();
  }

  const guests = computed<GuestsValue>({
    get: () => {
      if (!props.modelValue || typeof props.modelValue !== "object") {
        return {
          rooms: 1,
          roomList: [{ adults: 1, children: 0, childrenAges: [] }],
        };
      }
      if (
        "roomList" in props.modelValue &&
        Array.isArray(props.modelValue.roomList)
      ) {
        const normalized = (props.modelValue as GuestsValue).roomList.map(
          (r) => {
            const room = r as RoomGuests & { childrenAges?: number[] };
            let adults = room.adults;
            let children = room.children;
            if (adults + children > MAX_GUESTS_PER_ROOM) {
              adults = Math.min(adults, MAX_GUESTS_PER_ROOM);
              children = Math.max(0, MAX_GUESTS_PER_ROOM - adults);
            }
            const childrenAges = Array.isArray(room.childrenAges)
              ? room.childrenAges.slice(0, children).concat(
                  Array.from(
                    {
                      length: Math.max(
                        0,
                        children - (room.childrenAges?.length ?? 0),
                      ),
                    },
                    () => AGE_MIN,
                  ),
                )
              : Array.from({ length: children }, () => AGE_MIN);
            return {
              adults,
              children,
              childrenAges,
            };
          },
        );
        return {
          rooms: (props.modelValue as GuestsValue).rooms,
          roomList: normalized,
        };
      }
      const rooms = props.modelValue.rooms ?? 1;
      const legacyValue = props.modelValue as LegacyGuestsValue;
      return {
        rooms,
        roomList: Array.from({ length: rooms }).map((_, idx) => {
          let adults = idx === 0 ? (legacyValue.adults ?? 1) : 1;
          let children = idx === 0 ? (legacyValue.children ?? 0) : 0;
          if (adults + children > MAX_GUESTS_PER_ROOM) {
            adults = Math.min(adults, MAX_GUESTS_PER_ROOM);
            children = Math.max(0, MAX_GUESTS_PER_ROOM - adults);
          }
          return {
            adults,
            children,
            childrenAges: Array.from(
              { length: children },
              () => AGE_MIN,
            ),
          };
        }),
      };
    },
    set: (val) => emit("update:modelValue", val),
  });

  const isMultiBooking = computed(() => guests.value.roomList.length > 1);

  const overlayRef = ref<{
    toggle: (event: Event) => void;
    hide: (event: Event) => void;
  }>();

  function openOverlay(event: Event) {
    overlayRef.value?.toggle(event);
  }

  function takeShrinkHints(): ShrinkMultiHints | undefined {
    const hints = pendingShrinkHints;
    pendingShrinkHints = undefined;
    return hints;
  }

  function updateRooms(value: number) {
    const nextRooms = Math.max(1, Math.min(MAX_ROOMS, value));
    if (nextRooms === guests.value.rooms) return;

    clearUnavailableHighlight();

    if (nextRooms < guests.value.rooms) {
      // Хвост срезан — prune; несколько правок shrink в одной сессии → без hint
      pendingShrinkHints =
        pendingShrinkHints === undefined
          ? { trailingShrink: true }
          : undefined;
    }

    const roomList = guests.value.roomList.slice(0, nextRooms);
    for (let i = roomList.length; i < nextRooms; i++) {
      roomList.push({ adults: 1, children: 0, childrenAges: [] });
    }
    guests.value = { rooms: nextRooms, roomList };
  }

  function deleteRoom(roomIdx: number) {
    if (guests.value.rooms <= 1) return;
    clearUnavailableHighlight();
    // Один deleteRoom за сессию overlay → явный remap; иначе эвристика/wipe
    pendingShrinkHints =
      pendingShrinkHints === undefined
        ? { removedRoomIdx: roomIdx }
        : undefined;
    const roomList = guests.value.roomList.filter((_, idx) => idx !== roomIdx);
    guests.value = { rooms: guests.value.rooms - 1, roomList };
  }

  function updateRoomAdults(roomIdx: number, value: number) {
    clearUnavailableHighlight();
    const roomList = guests.value.roomList.map((room, idx) => {
      if (idx !== roomIdx) return room;
      const maxAdults = MAX_GUESTS_PER_ROOM - room.children;
      return { ...room, adults: Math.max(1, Math.min(value, maxAdults)) };
    });
    guests.value = { ...guests.value, roomList };
  }

  function updateRoomChildren(roomIdx: number, value: number) {
    clearUnavailableHighlight();
    const roomList = guests.value.roomList.map((room, idx) => {
      if (idx !== roomIdx) return room;
      const maxChildren = MAX_GUESTS_PER_ROOM - room.adults;
      const count = Math.max(0, Math.min(value, maxChildren));
      const ages = room.childrenAges?.slice(0, count) ?? [];
      while (ages.length < count) ages.push(AGE_MIN);
      return { ...room, children: count, childrenAges: ages };
    });
    guests.value = { ...guests.value, roomList };
  }

  function updateChildAge(roomIdx: number, childIdx: number, age: number) {
    clearUnavailableHighlight();
    const roomList = guests.value.roomList.map((room, idx) => {
      if (idx !== roomIdx) return room;
      const ages = room.childrenAges.slice();
      ages[childIdx] = Math.min(AGE_MAX, Math.max(AGE_MIN, Number(age)));
      return { ...room, childrenAges: ages };
    });
    guests.value = { ...guests.value, roomList };
  }

  const summaryString = computed(() => {
    const roomList = guests.value.roomList;
    const totalAdults = roomList.reduce((sum, r) => sum + r.adults, 0);
    const totalChildren = roomList.reduce((sum, r) => sum + r.children, 0);
    const adultsWord = declension(totalAdults, {
      one: "взрослый",
      few: "взрослых",
      many: "взрослых",
    });
    const childrenWord = declension(totalChildren, {
      one: "ребенок",
      few: "ребенка",
      many: "детей",
    });
    return `${totalAdults} ${adultsWord}, ${totalChildren} ${childrenWord}`;
  });

  async function applyChanges(event: Event) {
    const shrinkHints = takeShrinkHints();
    emit("update:modelValue", guests.value, shrinkHints);

    if (!isMultiBooking.value) {
      clearUnavailableHighlight();
      overlayRef.value?.hide(event);
      return;
    }

    const bookingStoreDate = bookingStore.date;
    if (!bookingStoreDate) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Пожалуйста, выберите даты",
        life: 3000,
      });
      return;
    }

    isApplying.value = true;
    clearUnavailableHighlight();

    let skipOverlayReset = false;

    try {
      // Повтор с теми же hints: после emit count уже новый → shrink no-op, search видит актуальный store
      bookingStore.setGuests({ ...guests.value }, shrinkHints);
      await nextTick();
      const result = await bookingStore.search({ skipReset: true });

      if (!result?.rooms?.length) {
        toast.add({
          severity: "warn",
          summary: "Повторите запрос позже",
          detail: "Временные неполадки. Повторите запрос немного позже",
          life: 5000,
        });
        return;
      }

      const unavailable = getUnavailableRoomIndices(
        result.rooms,
        getExpectedRoomCount(guests.value),
      );

      if (unavailable.length > 0) {
        bookingStore.setMultiBookingUnavailableRooms(unavailable);
        toast.add(MULTI_BOOKING_UNAVAILABLE_TOAST);
        return;
      }

      overlayRef.value?.hide(event);
      if (router.currentRoute.value.path !== "/multi-rooms") {
        await router.push("/multi-rooms");
      }
    } catch (error: unknown) {
      if (isStaleSearchError(error)) {
        skipOverlayReset = true;
        return;
      }
      const { status, message } = (error || {}) as ApiError;
      const { summary, detail } = getRequestErrorContent(status, message);
      toast.add({
        severity: "warn",
        summary,
        detail,
        life: 3000,
      });
    } finally {
      isApplying.value = false;
      // search({ skipReset: true }) не гасит overlay — сбрасываем здесь,
      // кроме устаревшего search (активный запрос ещё идёт)
      if (!skipOverlayReset) {
        bookingStore.setLoading(false);
        bookingStore.setServerRequest(false);
      }
    }
  }

  function isRoomUnavailable(roomIndex: number): boolean {
    return multiBookingUnavailableRooms.value.includes(roomIndex);
  }
</script>

<template>
  <div :class="$style.guestSection">
    <UiSelect
      :class="$style.uiSelect"
      variant="booking"
      label="Гости"
      :value-text="summaryString"
      icon-name="i-chevron-down-select"
      :aria-label="`Гости: ${summaryString}`"
      @click="openOverlay"
    />

    <Popover
      ref="overlayRef"
      class="guests-dropdown"
      :pt="{
        content: { style: 'padding: 0;' },
      }"
    >
      <div :class="$style.guestsDropdownContent">
        <div :class="$style.guestOption">
          <span :class="$style.roomsTitle">Номера</span>
          <CoreCounter
            :model-value="guests.rooms"
            :min="1"
            :max="MAX_ROOMS"
            @update:model-value="(val: number) => updateRooms(val)"
          />
        </div>

        <CoreRoomBlock
          v-for="(room, idx) in guests.roomList"
          :key="`room-${idx}-${guests.rooms}`"
          :room="room"
          :room-index="idx"
          :total-rooms="guests.rooms"
          :max-adults="MAX_GUESTS_PER_ROOM - room.children"
          :max-children="MAX_GUESTS_PER_ROOM - room.adults"
          :unavailable="isRoomUnavailable(idx)"
          @update:adults="(val: number) => updateRoomAdults(idx, val)"
          @update:children="(val: number) => updateRoomChildren(idx, val)"
          @update:child-age="(childIdx: number, age: number) => updateChildAge(idx, childIdx, age)"
          @delete="deleteRoom(idx)"
        />

        <div v-if="isApplying" :class="$style.loadingOverlay" aria-live="polite">
          <ProgressSpinner
            style="width: 40px; height: 40px"
            stroke-width="4"
            fill="transparent"
            animation-duration="2.5s"
            aria-label="Проверка доступности номеров"
          />
        </div>

        <UiButton
          :class="$style.applyButton"
          variant="dark"
          size="m"
          :loading="isApplying"
          :disabled="isApplying"
          @click="applyChanges"
        >
          Готово
        </UiButton>
      </div>
    </Popover>
  </div>
</template>

<style lang="scss">
  .guests-dropdown {
    &.p-popover {
      background: var(--a-white);
      border-radius: rem(16);
      box-shadow: 0 4px 23px rgba(0, 0, 0, 0.4);
      border: none;
    }
  }
</style>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .guestSection {
    width: 100%;
    min-width: 0;

    :global {
      .p-select-label.p-placeholder {
        color: var(--a-text-light);
      }
    }
  }

  .uiSelect {
    width: 100%;
    min-width: 0;
  }

  .guestsDropdownContent {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: rem(360);
    padding: rem(16);

    @media (min-width: #{size.$desktopMin}) {
      min-width: rem(600);
      padding: rem(24);
    }
  }

  .loadingOverlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.75);
    border-radius: rem(16);
  }

  .guestOption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: rem(12);
    font-family: var(--a-font-body);
  }

  .roomsTitle {
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-black);
  }

  .applyButton {
    width: 100%;
    min-height: rem(56);
    margin-top: rem(16);
    border-radius: var(--a-borderR--btn);
  }
</style>
