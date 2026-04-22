<script setup lang="ts">
  // @ts-nocheck - Vue автоматически преобразует kebab-case в camelCase в шаблонах
  import type { RoomTariff } from "~/types/room";

  interface Props {
    tariffs: RoomTariff[];
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: "book-tariff", tariff: RoomTariff): void;
  }>();
  // Временно отключаем блок "Включенные пакеты" до повторного использования.
  const isPackagesSectionEnabled = false;

  const allTariffsFilterValue = "all";
  const basicFilterValue = "basic";
  const prepaidFilterValue = "prepaid";

  const selectedFilter = ref<string>(allTariffsFilterValue);
  const filterTabs = [
    { label: "Все тарифы", value: allTariffsFilterValue },
    { label: "Базовый", value: basicFilterValue },
    { label: "Предоплатный", value: prepaidFilterValue },
  ];

  /**
   * Состояние открытия/закрытия информационных блоков для каждого тарифа
   */
  const openTariffInfo = ref<Record<string, boolean>>({});

  /**
   * Состояние загрузки для каждого тарифа
   */
  const loadingTariffs = ref<Record<string, boolean>>({});

  /**
   * Переключает состояние информационного блока тарифа
   */
  const toggleTariffInfo = (ratePlanCode: string) => {
    openTariffInfo.value[ratePlanCode] = !openTariffInfo.value[ratePlanCode];
  };

  /**
   * Дефолтное описание тарифа (используется, если описание не приходит из API)
   */
  const defaultTariffDescription = `Данный тариф предлагает оптимальное сочетание комфорта и стоимости для вашего пребывания. В стоимость включены основные удобства номера, а также услуги, указанные в условиях бронирования. При необходимости вы можете уточнить детали и дополнительные услуги при оформлении заказа. Обратите внимание на условия отмены и изменения бронирования, которые зависят от выбранного тарифа. Для получения полной информации о тарифе и его особенностях, пожалуйста, свяжитесь с администрацией отеля или ознакомьтесь с условиями при бронировании.`;

  /**
   * Получает описание тарифа (из API или дефолтное)
   */
  const getTariffDescription = (tariff: RoomTariff): string => {
    return tariff.description || defaultTariffDescription;
  };

  /**
   * Определяет тип тарифа на основе его свойств
   * Предоплатный тариф обычно имеет price_for_register
   */
  const getTariffType = (tariff: RoomTariff): "basic" | "prepaid" => {
    // Если есть price_for_register, считаем тариф предоплатным
    // В противном случае - базовым
    return tariff.price_for_register !== undefined ? "prepaid" : "basic";
  };

  /**
   * Отфильтрованные тарифы на основе выбранного фильтра
   */
  const filteredTariffs = computed(() => {
    if (selectedFilter.value === allTariffsFilterValue) {
      return props.tariffs;
    }
    return props.tariffs.filter(
      (tariff) => getTariffType(tariff) === selectedFilter.value,
    );
  });

  const route = useRoute();
  const currentPath = ref(route.path);

  const handleBook = async (tariff: RoomTariff) => {
    loadingTariffs.value[tariff.rate_plan_code] = true;
    currentPath.value = route.path;

    try {
      emit("book-tariff", tariff);

      // Проверяем, произошел ли переход через небольшую задержку
      await nextTick();
      setTimeout(() => {
        // Если мы все еще на той же странице, сбросить loading
        if (route.path === currentPath.value) {
          loadingTariffs.value[tariff.rate_plan_code] = false;
        }
      }, 100);
    } catch {
      loadingTariffs.value[tariff.rate_plan_code] = false;
    }
  };

  // Сброс loading при переходе на другую страницу
  onBeforeRouteLeave(() => {
    loadingTariffs.value = {};
  });

  const handleFilterClick = (filterType: string) => {
    selectedFilter.value = filterType;
  };
</script>

<template>
  <section :class="$style.tariffsSection">
    <h2 :class="$style.tariffsTitle">Тарифы к номеру</h2>
    <UiTabs
      :items="filterTabs"
      :model-value="selectedFilter"
      aria-label="Фильтры тарифов"
      mode="tariff"
      @update:model-value="handleFilterClick"
    />
    <div
      v-if="filteredTariffs.length === 0"
      :class="$style.emptyState"
      role="status"
      aria-live="polite"
    >
      <p>Тарифы не найдены</p>
    </div>
    <ul
      v-else
      :class="$style.tariffsList"
      role="list"
      aria-label="Список тарифов"
    >
      <li
        v-for="tariff in filteredTariffs"
        :key="tariff.rate_plan_code"
        :class="$style.tariffItem"
        role="listitem"
      >
        <article :class="[$style.tariffCard, 'section-shadow']">
          <div :class="$style.tariffHeader">
            <div :class="$style.otherTariffInfo">
              <h3 :class="$style.tariffName">{{ tariff.title }}</h3>
              <Button
                unstyled
                :class="[$style.infoButton, $style.infoButton_medium]"
                :aria-label="`Информация о тарифе ${tariff.title}`"
                :aria-expanded="openTariffInfo[tariff.rate_plan_code] || false"
                type="button"
                @click="toggleTariffInfo(tariff.rate_plan_code)"
              >
                <UIcon
                  name="i-chevron-down"
                  :class="[
                    $style.chevronIcon,
                    $style.chevronIcon_medium,
                    {
                      [$style.chevronIconRotated]:
                        openTariffInfo[tariff.rate_plan_code],
                    },
                  ]"
                />
              </Button>
            </div>
            <div :class="$style.tariffPriceBlock">
              <data
                :class="$style.tariffPrice"
                :value="tariff.price"
                itemprop="price"
              >
                {{ tariff.price }} руб.
              </data>
              <span :class="$style.tariffPriceLabel"
                >Средняя стоимость за 1 ночь
              </span>
            </div>
          </div>

          <div
            v-if="openTariffInfo[tariff.rate_plan_code]"
            :class="$style.tariffInfoBlock"
          >
            <p :class="$style.tariffDescription" v-html="getTariffDescription(tariff)"></p>
          </div>

          <div :class="$style.tariffContentRow">
            <ul :class="$style.tariffData">
              <li :class="$style.dataItem">
                <UIcon
                  name="i-fork-knife"
                  :class="[
                    $style.dataIcon,
                    { [$style.dataIconPenalty]: !tariff.has_food },
                  ]"
                />
                <span :class="$style.dataText">
                  {{
                    tariff.has_food ? "Питание включено" : "Питание не включено"
                  }}
                </span>
              </li>
              <li :class="$style.dataItem">
                <UIcon
                  name="i-cancellation"
                  :class="[
                    $style.dataIcon,
                    { [$style.dataIconPenalty]: !tariff.cancellation_free },
                  ]"
                />
                <span :class="$style.dataText">
                  {{
                    tariff.cancellation_free
                      ? "Отмена без штрафа"
                      : "Отмена со штрафом"
                  }}
                </span>
                <BookingInfoButtonWithPopover
                  :popover-id="`cancellation-${tariff.rate_plan_code}`"
                  size="small"
                  :aria-label="`Информация об отмене для тарифа ${tariff.title}`"
                >
                  <BookingCancellationPopoverContent
                    :title="tariff.cancellation_popover?.title"
                    :description="tariff.cancellation_popover?.description"
                  />
                </BookingInfoButtonWithPopover>
              </li>
              <li :class="$style.dataItem">
                <UIcon name="i-payment" :class="$style.dataIcon" />
                <span :class="$style.dataText">
                  Оплата банковской картой, по QR-коду (СБП), гарантия банковской
                  картой
                </span>
              </li>
            </ul>

            <footer :class="$style.tariffBookingSection">
              <data
                :class="$style.tariffPrice"
                :value="tariff.price"
                itemprop="price"
              >
                {{ tariff.price }} руб.
              </data>
              <span :class="$style.tariffPriceLabel"
                >Средняя стоимость за 1 ночь
              </span>
              <Button
                :class="[
                  $style.tariffBookingButton,
                  {
                    [$style.loading]:
                      loadingTariffs[tariff.rate_plan_code],
                  },
                ]"
                :disabled="loadingTariffs[tariff.rate_plan_code]"
                unstyled
                @click="handleBook(tariff)"
              >
                <span :class="$style.buttonText">Забронировать</span>
                <ProgressSpinner
                  v-show="loadingTariffs[tariff.rate_plan_code]"
                  :class="$style.buttonSpinner"
                  style="width: 16px; height: 16px"
                  stroke-width="3"
                  fill="transparent"
                  animation-duration="1s"
                  aria-label="Загрузка"
                />
              </Button>
            </footer>
          </div>

          <section
            v-if="isPackagesSectionEnabled && tariff.packages?.length"
            :class="$style.tariffPackages"
          >
            <h4 :class="$style.packagesTitle">Включенные пакеты:</h4>
            <ul :class="$style.packagesList">
              <li
                v-for="(pkg, pkgIndex) in tariff.packages"
                :key="`${tariff.rate_plan_code}-pkg-${pkgIndex}`"
                :class="$style.packageItem"
              >
                {{ pkg.title }}
              </li>
            </ul>
          </section>
        </article>
      </li>
    </ul>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;
  @use "~/assets/styles/tools/mixins" as typo;

  .tariffsSection {
    padding-top: rem(24);
  }

  .tariffsTitle {
    margin-bottom: rem(40);
    text-align: center;
    @include typo.typo-h3;
    color: var(--a-text-dark);
  }

  .tariffsList {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    list-style: none;
    padding: 0;
    margin: 0 0 rem(24) 0;
  }

  .tariffItem {
    list-style: none;
  }

  .emptyState {
    padding: rem(40) rem(20);
    text-align: center;
    @include typo.typo-body-lg;
    color: var(--a-text-light);
  }

  .tariffCard {
    position: relative;
    // Стандартные стили (белый фон, тень, закругления) применяются через класс section-shadow
  }

  .tariffHeader {
    display: flex;
    flex-direction: column;
    gap: rem(20);
    margin-bottom: rem(20);
    height: auto;

    @media (min-width: #{size.$desktopMin}) {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: rem(24);
      height: auto;
      margin-bottom: 0;
    }
  }

  .otherTariffInfo {
    display: flex;
    align-items: center;
    gap: rem(24);
  }

  .tariffName {
    @include typo.typo-h2;
    color: var(--a-text-dark);
    margin: 0;
  }

  .infoButton {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    padding: 0;
    border: rem(1) solid var(--a-border-dark);
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--a-text-primary);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-primaryBg);
      outline-offset: rem(2);
    }
  }

  .infoButton_medium {
    width: rem(40);
    height: rem(40);
  }

  .chevronIcon {
    color: var(--a-text-dark);
    transition: transform 0.3s ease;
  }

  .chevronIcon_medium {
    width: rem(28);
    height: rem(28);
  }

  .chevronIconRotated {
    transform: rotate(180deg);
  }

  .tariffInfoBlock {
    margin-bottom: rem(24);
    background: var(--a-whiteBg);
  }

  .tariffDescription {
    @include typo.typo-body-lg;
    color: var(--a-text-dark);
    margin: 0;
  }

  .tariffContentRow {
    // На мобильных элементы отображаются последовательно в колонке
    // На desktop используется flex row для размещения в одной строке
    @media (min-width: #{size.$desktopMin}) {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      gap: rem(20);
    }
  }

  .tariffData {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    margin-top: rem(16);
    margin-bottom: rem(24);
    list-style: none;
    padding: 0;

    @media (min-width: #{size.$desktopMin}) {
      width: calc(100% - rem(32));
      margin-top: 0;
      margin-bottom: 0;
      flex: 1;
    }
  }

  .dataItem {
    display: flex;
    align-items: center;
    gap: rem(16);
  }

  .dataIcon {
    width: rem(20);
    height: rem(20);
    flex-shrink: 0;
    color: var(--success);
  }

  .dataIconPenalty {
    color: var(--a-text-light);
  }

  .dataText {
    @include typo.typo-body-lg;
    color: var(--a-text-dark);
  }

  .tariffPriceBlock {
    display: none;

    @media (min-width: #{size.$desktopMin}) {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: rem(4);
      text-align: right;
    }
  }

  .tariffPrice {
    @include typo.typo-h1;
    color: var(--a-text-dark);
    white-space: nowrap;
    margin-left: auto;
  }

  .tariffPriceLabel {
    @include typo.typo-caption;
    color: var(--a-text-light);
    margin-left: auto;
    margin-bottom: rem(20);

    @media (min-width: #{size.$desktopMin}) {
      margin-bottom: 0;
    }
  }

  .tariffBookingSection {
    display: flex;
    flex-direction: column;
    width: 100%;

    @media (min-width: #{size.$desktopMin}) {
      width: fit-content;
      margin-left: 0;
      
      // Скрываем цену в footer на desktop (она отображается в header)
      .tariffPrice,
      .tariffPriceLabel {
        display: none;
      }
    }
  }

  .tariffBookingButton {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(290);
    height: rem(44);
    @include typo.typo-body-lg;
    color: var(--a-text-white);
    background-color: var(--a-blackBg);
    border-radius: var(--a-borderR--btn);
    cursor: pointer;
    transition: background-color 0.2s ease;

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      flex-grow: 1;
      margin-left: auto;
    }

    &:hover:not(:disabled) {
      background-color: var(--a-btnAccentBg);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-primaryBg);
      outline-offset: rem(2);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.loading {
      background-color: var(--a-btnAccentBg);
    }
  }

  .buttonText {
    position: relative;
    z-index: z.z("default");
  }

  .buttonSpinner {
    position: absolute;
    right: rem(16);
    top: 50%;
    transform: translateY(-50%);
    z-index: z.z("behind");
    pointer-events: none;
  }

  .packagesTitle {
    @include typo.typo-body-sm;
    font-weight: 600;
    color: var(--a-text-dark);
    margin-bottom: rem(8);
  }

  .packagesList {
    display: flex;
    flex-wrap: wrap;
    gap: rem(8);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .packageItem {
    padding: rem(4) rem(12);
    background: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--x6);
    @include typo.typo-caption;
    color: var(--a-text-dark);
  }

  :global {
    .p-popover::before {
      left: 20px !important;
    }

    .tariffPopover {
      transform: translateX(18px);

      @media (min-width: #{size.$tabletMin}) {
        transform: translateX(-14px);
      }
    }
  }
</style>
