<script setup lang="ts">
  import type { Room, RoomTariff } from "~/types/room";
  import { formatCount } from "~/utils/declension";
  import { useBookingStore } from "~/stores/booking";
  import { toPricePerNight } from "~/utils/price";
  import {
    getTariffStayTotalForRoom,
    getTariffRoomIndices,
  } from "~/utils/multiBooking";
  import { formatDateLong } from "~/utils/dateFormat";

  interface Props {
    room: Room;
    selectedCodes?: Record<string, string>;
    roomCardIdx?: number;
    isAllRoomsSelected?: boolean;
    disabledRoomIndices?: Set<number>;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (
      e: "select-tariff",
      ratePlanCode: string,
      roomIdx: number,
      roomCardIdx?: number,
    ): void;
  }>();

  const bookingStore = useBookingStore();
  const { guests, date } = storeToRefs(bookingStore);

  const showAllTariffs = ref(false);

  const sortedTariffs = computed<RoomTariff[]>(() => {
    const tariffs = props.room.tariffs || [];
    return [...tariffs].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  });

  const cheapestTariff = computed<RoomTariff | null>(() => {
    return sortedTariffs.value[0] ?? null;
  });

  const visibleTariffs = computed<RoomTariff[]>(() => {
    if (showAllTariffs.value) return sortedTariffs.value;
    return cheapestTariff.value ? [cheapestTariff.value] : [];
  });

  const hasTariffs = computed(() => {
    return (props.room.tariffs?.length || 0) > 0;
  });

  const roomsCount = computed(() => {
    return guests.value?.roomList
      ? guests.value.roomList.length
      : guests.value?.rooms || 1;
  });

  function selectTariffFor(index: number, tariff: RoomTariff | null) {
    if (!tariff) return;
    emit("select-tariff", tariff.rate_plan_code, index, props.roomCardIdx);
  }

  // Локальное состояние выбранных тарифов в рамках текущей карточки комнаты
  const selectedTariffsByRoomIdx = ref<Record<number, RoomTariff>>({});

  function onSelectTariff(index: number, tariff: RoomTariff | null) {
    if (!tariff) return;
    // Используем составной ключ для уникальной идентификации номера в конкретной карточке
    const key = props.roomCardIdx !== undefined
      ? `${props.roomCardIdx}-${index}`
      : `${index}`;
    const alreadySelectedCode =
      props.selectedCodes?.[key] ??
      selectedTariffsByRoomIdx.value[index]?.rate_plan_code;

    if (alreadySelectedCode === tariff.rate_plan_code) {
      Reflect.deleteProperty(selectedTariffsByRoomIdx.value, index);
      emit("select-tariff", "", index, props.roomCardIdx);
    } else {
      selectTariffFor(index, tariff);
      selectedTariffsByRoomIdx.value[index] = tariff;
    }
  }

  function isSelected(index: number, tariff: RoomTariff | null) {
    if (!tariff) return false;
    // Используем составной ключ для уникальной идентификации номера в конкретной карточке
    const key = props.roomCardIdx !== undefined
      ? `${props.roomCardIdx}-${index}`
      : `${index}`;
    const externalCode = props.selectedCodes?.[key];
    if (externalCode) return externalCode === tariff.rate_plan_code;
    return (
      selectedTariffsByRoomIdx.value[index]?.rate_plan_code ===
      tariff.rate_plan_code
    );
  }

  function isButtonDisabled(index: number, tariff: RoomTariff | null) {
    if (!tariff) return true;

    // Если номер уже выбран в другой карточке, блокируем кнопку
    if (props.disabledRoomIndices?.has(index) && !isSelected(index, tariff)) {
      return true;
    }

    // Если все номера выбраны и текущий номер не выбран, блокируем кнопку
    if (props.isAllRoomsSelected && !isSelected(index, tariff)) {
      return true;
    }

    return false;
  }

  const nights = useNights(date);
  const calculateNights = (): number => nights.value;

  const getRoomGuests = (
    roomIdx: number,
  ): { adults: number; children: number; childrenAges: number[] } => {
    const roomList = guests.value?.roomList || [];
    if (roomIdx >= 0 && roomIdx < roomList.length) {
      const room = roomList[roomIdx];
      if (room) {
        return room;
      }
    }
    return { adults: 0, children: 0, childrenAges: [] };
  };

  const getAveragePricePerNight = (
    stayTotal: number | null | undefined,
  ): number => toPricePerNight(stayTotal, calculateNights());

  const getStayTotal = (stayTotal: number | null | undefined): number =>
    stayTotal || 0;

  const checkInDate = computed(() => date.value?.[0] || null);
  const checkOutDate = computed(() => date.value?.[1] || null);
</script>

<template>
  <div :class="$style.tariffBlock">
    <section v-if="hasTariffs && visibleTariffs.length > 0" :class="$style.tariffsList">
      <article
        v-for="tar in visibleTariffs"
        :key="tar.rate_plan_code"
        :class="$style.tariffRow"
      >
        <div :class="$style.tariffLeftColumn">
          <div :class="$style.otherTariffInfo">
            <span :class="$style.tariffName">{{ tar.title }}</span>
            <BookingInfoButtonWithPopover
              :popover-id="tar.rate_plan_code"
              size="small"
              :aria-label="`Информация о тарифе ${tar.title}`"
            >
              <BookingTariffPopoverContent />
            </BookingInfoButtonWithPopover>
          </div>

          <div :class="$style.tariffDetails">
            <div :class="$style.tariffDetailItem">
              <UIcon
                name="i-fork-knife"
                :class="[
                  $style.tariffDetailIcon,
                  { [$style.tariffDetailIconPenalty]: !tar.has_food },
                ]"
              />
              <span :class="$style.tariffDetailText">
                {{ tar.has_food ? "Питание включено" : "Питание не включено" }}
              </span>
            </div>
            <div :class="$style.tariffDetailItem">
              <UIcon
                name="i-cancellation"
                :class="[
                  $style.tariffDetailIcon,
                  { [$style.tariffDetailIconPenalty]: !tar.cancellation_free },
                ]"
              />
              <span :class="$style.tariffDetailText">
                {{ tar.cancellation_free ? "Бесплатная отмена" : "Отмена со штрафом" }}
              </span>
              <BookingInfoButtonWithPopover
                v-if="tar.cancellation_free"
                :popover-id="`cancellation-${tar.rate_plan_code}`"
                size="small"
                :aria-label="`Информация об отмене тарифа ${tar.title}`"
              >
                <BookingCancellationPopoverContent
                  :title="tar.cancellation_popover?.title"
                  :description="tar.cancellation_popover?.description"
                />
              </BookingInfoButtonWithPopover>
            </div>
            <div v-if="tar.payment_types && tar.payment_types.length > 0" :class="$style.tariffDetailItem">
              <UIcon name="i-payment" :class="$style.tariffDetailIcon" />
              <span :class="$style.tariffDetailText">
                {{ tar.payment_types.join(", ") }}
              </span>
            </div>
          </div>
        </div>

        <div :class="$style.confirmList">
          <div :class="$style.averagePriceSection">
            <span :class="$style.averagePriceLabel">Средняя стоимость за 1 ночь</span>
          </div>
          <div
            v-for="roomIndex in getTariffRoomIndices(tar, roomsCount)"
            :key="roomIndex"
            :class="$style.confirmItem"
          >
            <div :class="$style.confirmLeft">
              <div :class="$style.confirmText">
                <div :class="$style.confirmTitle">Номер {{ roomIndex + 1 }}</div>
                <div :class="$style.confirmPriceWrapper">
                  <div :class="$style.confirmGuestsIcons">
                    <UIcon
                      v-for="n in getRoomGuests(roomIndex).adults"
                      :key="`adult-${roomIndex}-${n}`"
                      name="i-icon-man"
                      :class="$style.confirmGuestIconAdult"
                      aria-hidden="true"
                    />
                    <UIcon
                      v-if="getRoomGuests(roomIndex).children > 0"
                      name="i-icon-plus-person"
                      :class="$style.confirmGuestIconPlus"
                      aria-hidden="true"
                    />
                    <UIcon
                      v-for="n in getRoomGuests(roomIndex).children"
                      :key="`child-${roomIndex}-${n}`"
                      name="i-icon-child"
                      :class="$style.confirmGuestIconChild"
                      aria-hidden="true"
                    />
                  </div>
                  <div :class="$style.confirmPrice">
                    {{ getAveragePricePerNight(getTariffStayTotalForRoom(tar, roomIndex)).toLocaleString("ru-RU") }} ₽
                  </div>
                </div>
              </div>
              <BookingInfoButtonWithPopover
                :popover-id="`${roomIndex}-${tar.rate_plan_code}`"
                size="small"
                :aria-label="`Детализация цены для номера ${roomIndex + 1}`"
                popover-class="pricePopover"
                popover-padding="16px"
              >
                <div :class="$style.priceDetailsPopup">
                  <div :class="$style.priceDetailsTitle">
                    Детализация цены, ₽
                  </div>
                  <div :class="$style.priceDetailsDates">
                    {{ formatDateLong(checkInDate) }} -
                    {{ formatDateLong(checkOutDate) }},
                    {{ formatCount(calculateNights(), "night") }}
                  </div>
                  <div :class="$style.priceDetailsGuests">
                    <div :class="$style.guestDetailRow">
                      <div
                        v-if="getRoomGuests(roomIndex).adults > 0"
                        :class="$style.guestDetailItem"
                      >
                        {{
                          formatCount(
                            getRoomGuests(roomIndex).adults,
                            "person",
                          )
                        }}
                        на основном месте -
                        {{ getAveragePricePerNight(getTariffStayTotalForRoom(tar, roomIndex)).toLocaleString("ru-RU") }} ₽ за
                        ночь
                      </div>
                      <div
                        v-if="getRoomGuests(roomIndex).children > 0"
                        :class="$style.guestDetailItem"
                      >
                        {{
                          formatCount(
                            getRoomGuests(roomIndex).children,
                            "person",
                          )
                        }}
                        на дополнительном месте - бесплатно
                      </div>
                    </div>
                  </div>
                  <div :class="$style.priceDetailsDivider" />
                  <div :class="$style.priceDetailsTotal">
                    <span>Стоимость номера за весь период проживания</span>
                    <span :class="$style.priceDetailsTotalAmount">
                      {{ getStayTotal(getTariffStayTotalForRoom(tar, roomIndex)).toLocaleString("ru-RU") }}
                      ₽
                    </span>
                  </div>
                </div>
              </BookingInfoButtonWithPopover>
            </div>
            <div :class="$style.confirmActions">
              <Button
                type="button"
                unstyled
                :class="[
                  $style.selectButton,
                  isSelected(roomIndex, tar) && $style.selectButtonActive,
                  isButtonDisabled(roomIndex, tar) && $style.selectButtonDisabled,
                ]"
                :disabled="isButtonDisabled(roomIndex, tar)"
                @click="onSelectTariff(roomIndex, tar)"
                >{{ isSelected(roomIndex, tar) ? "Выбрано" : "Выбрать" }}</Button
              >
            </div>
          </div>
        </div>
      </article>
    </section>

    <div v-if="(room.tariffs?.length || 0) > 1" :class="$style.allTariffs">
      <Button
        unstyled
        class="btn__bs"
        :class="$style.allTariffsBtn"
        @click="showAllTariffs = !showAllTariffs"
      >
        {{ showAllTariffs ? "Скрыть тарифы" : "Все тарифы" }}
        <span :class="$style.allTariffsIconWrap">
          <UIcon
            name="i-chevron-down"
            :class="[
              $style.allTariffsChevron,
              showAllTariffs && $style.allTariffsChevronRotated,
            ]"
          />
        </span>
      </Button>
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .tariffBlock {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    margin-top: rem(20);
    padding: 0 rem(22) rem(20);

    @media (min-width: #{size.$tablet}) {
      padding: 0 rem(22) rem(20);
    }

    @media (min-width: #{size.$desktopMin}) {
      margin-top: rem(20);
      padding: rem(22);
      border-top: 1px solid var(--a-border-dark);
    }
  }

  .tariffTitle {
    font-family: var(--a-font-heading);
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);
  }

  .tariffRow {
    display: flex;
    flex-direction: column;
    gap: rem(20);

    &:not(:last-child) {
      border-bottom: 1px solid var(--a-border-dark);
      padding-bottom: rem(20);
    }

    @media (min-width: #{size.$desktopMedium}) {
      flex-direction: row;
      align-items: flex-start;
      gap: rem(40);
    }
  }

  .tariffLeftColumn {
    display: flex;
    flex-direction: column;
    flex: 1;

    @media (min-width: #{size.$desktopMedium}) {
      flex: 1;
    }
  }

  .tariffMain {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tariffName {
    font-family: var(--a-font-heading);
    font-size: rem(20);
    font-weight: 600;
    color: var(--a-text-dark);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(24);
    }

    @media (min-width: #{size.$desktopMin}) {
      font-size: rem(24);
    }
  }

  .tariffPrice {
    font-family: var(--a-font-heading);
    font-size: rem(20);
    font-weight: 700;
    color: var(--a-text-dark);
  }

  .confirmList {
    display: flex;
    flex-direction: column;
    margin-top: rem(4);
    align-items: flex-end;

    @media (min-width: #{size.$desktopMedium}) {
      margin-top: 0;
      flex: 1;
      align-items: flex-end;
    }
  }

  .confirmItem {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: rem(16) 0;
  }

  .confirmLeft {
    display: flex;
    align-items: flex-end;
    gap: rem(10);
    flex: 1;
    margin-right: rem(20);
  }

  .confirmText {
    display: flex;
    flex-direction: column;
    gap: rem(4);
  }

  .confirmTitle {
    font-family: var(--a-font-body);
    font-size: rem(12);
    font-weight: 500;
    color: var(--a-text-accent);
    letter-spacing: 0;
    line-height: normal;
  }

  .confirmPriceWrapper {
    display: flex;
    align-items: center;
    gap: rem(10);
  }

  .confirmGuestsIcons {
    display: flex;
    align-items: center;
  }

  .confirmGuestIconAdult {
    width: rem(14);
    height: rem(20);
    color: var(--a-lightBg);
  }

  .confirmGuestIconChild {
    width: rem(12);
    height: rem(12);
    color: var(--a-lightBg);
  }

  .confirmGuestIconPlus {
    width: rem(8);
    height: rem(8);
    color: var(--a-lightBg);
    margin: 0 rem(2);
  }

  .confirmPrice {
    font-family: var(--a-font-heading);
    font-size: rem(24);
    font-weight: 700;
    color: var(--a-text-dark);
  }

  .confirmActions {
    display: flex;
    align-items: center;
    gap: rem(10);
  }

  .detailsButton {
    width: rem(32);
    height: rem(32);
    border-radius: 50%;
    background-color: var(--a-accentLightBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .selectButton {
    min-width: rem(121);
    padding: rem(8) rem(16);
    border-radius: var(--a-borderR--btn);
    background-color: var(--a-btnAccentBg);
    color: var(--a-white);
    border: none;
    cursor: pointer;
    font-family: var(--a-font-body);
    font-size: rem(14);
    font-weight: 500;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-blackBg);
    }
  }

  .selectButtonActive {
    background-color: var(--a-blackBg);
    color: var(--a-white);

    &:hover {
      background-color: var(--a-btnAccentBg);
    }
  }

  .selectButtonDisabled {
    background-color: var(--a-border-primary);
    color: var(--a-text-white);
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background-color: var(--a-border-primary);
    }
  }

  .allTariffs {
    display: flex;
    justify-content: center;
    margin-top: rem(6);
  }

  .allTariffsBtn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: rem(8);
    min-width: rem(250);
    height: rem(44);
    margin: 0 auto;
    padding-right: rem(40);
    background-color: var(--a-btnAccentBg);

    &:hover {
      background-color: var(--a-blackBg);
    }
  }

  .allTariffsIconWrap {
    position: absolute;
    right: rem(20);
    top: 50%;
    transform: translateY(-50%);
    width: rem(24);
    height: rem(24);
    border-radius: 50%;
    border: rem(1) solid var(--a-white);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .allTariffsChevron {
    width: rem(16);
    height: rem(16);
    color: var(--a-white);
    transition: transform 0.2s ease;
  }

  .allTariffsChevronRotated {
    transform: rotate(180deg);
  }

  .tariffsList {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    margin-top: rem(10);
    border-bottom: 1px solid var(--a-border-dark);
  }

  .otherTariff {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: rem(10) rem(12);
    border: 1px solid var(--a-border-primary);
    border-radius: var(--a-borderR--card);
  }

  .otherTariffInfo {
    display: flex;
    align-items: flex-start;
    gap: rem(8);
    margin-bottom: rem(20);

    & > *:last-child {
      margin-top: rem(6);
    }
  }

  .tariffDetails {
    display: flex;
    flex-direction: column;
    gap: rem(15);
    margin-bottom: rem(20);
    padding-bottom: rem(20);
  }

  .tariffDetailItem {
    display: flex;
    align-items: center;
    gap: rem(15);
  }

  .tariffDetailIcon {
    width: rem(20);
    height: rem(16);
    flex-shrink: 0;
    color: var(--a-border-primary);
  }

  .tariffDetailIconPenalty {
    color: var(--a-text-light);
  }

  .tariffDetailText {
    font-family: var(--a-font-heading);
    font-size: rem(18);
    font-weight: 400;
    color: var(--a-text-dark);
    letter-spacing: 0;
    line-height: normal;
  }

  .averagePriceSection {
    margin-bottom: rem(14);
    text-align: left;
  }

  .averagePriceLabel {
    font-family: var(--a-font-body);
    font-size: rem(12);
    font-weight: 500;
    color: var(--a-text-light);
  }

  .priceDetailsPopup {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    min-width: rem(280);
  }

  .priceDetailsTitle {
    font-family: var(--a-font-heading);
    font-size: rem(18);
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(4);
  }

  .priceDetailsDates {
    font-family: var(--a-font-body);
    font-size: rem(14);
    color: var(--a-text-light);
    margin-bottom: rem(4);
  }

  .priceDetailsGuests {
    display: flex;
    flex-direction: column;
    gap: rem(8);
    margin-top: rem(8);
  }

  .guestDetailRow {
    display: flex;
    flex-direction: column;
    gap: rem(8);
  }

  .guestDetailItem {
    font-family: var(--a-font-body);
    font-size: rem(16);
    color: var(--a-text-dark);
    line-height: 1.5;
  }

  .priceDetailsDivider {
    width: 100%;
    height: rem(1);
    background-color: var(--a-border-primary);
    margin: rem(8) 0;
  }

  .priceDetailsTotal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: rem(12);
    font-family: var(--a-font-body);
    font-size: rem(14);
    color: var(--a-text-dark);
  }

  .priceDetailsTotalAmount {
    font-weight: 600;
    font-size: rem(16);
    color: var(--a-text-dark);
  }

  :global {
    .p-popover::before {
      left: 20px;
    }

    .tariffPopover {
      transform: translateX(18px);

      @media (min-width: #{size.$tabletMin}) {
        transform: translateX(-14px);
      }
    }

    .pricePopover {
      transform: translateX(18px);

      @media (min-width: #{size.$tabletMin}) {
        transform: translateX(-14px);
      }
    }
  }
</style>
