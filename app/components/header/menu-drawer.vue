<script setup lang="ts">
  import type { CSSProperties } from "vue";

  import LogoRadisson from "~/assets/images/logo_radisson.svg";
  import {
    DRAWER_MENU_LINKS,
    HOTEL_SITE_URL,
    HOTEL_SOCIAL_LINKS,
    type CurrencyCode,
    type LocaleCode,
  } from "~/utils/hotelMenu";
  import { HOTEL_INFO, toTelHref } from "~/utils/hotel";

  const props = defineProps<{
    isOpen: boolean;
    locale: string;
    currency: CurrencyCode;
  }>();

  const emit = defineEmits<{
    close: [];
    navigate: [];
    "select-locale": [code: LocaleCode];
    "select-currency": [code: CurrencyCode];
  }>();

  const LOCALE_OPTIONS: { code: LocaleCode; label: string }[] = [
    { code: "ru", label: "Рус" },
    { code: "en", label: "Eng" },
  ];

  const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
    { code: "RUB", label: "₽" },
    { code: "USD", label: "$" },
    { code: "EUR", label: "€" },
  ];

  /** Ссылки «выплывают» по очереди, как nav.hamburger.show на старом сайте. */
  const REVEAL_BASE_DELAY = 0.1;
  const REVEAL_STEP_DELAY = 0.08;

  const linksShown = ref(false);

  const revealDelay = (index: number): CSSProperties => ({
    transitionDelay: linksShown.value
      ? `${REVEAL_BASE_DELAY + index * REVEAL_STEP_DELAY}s`
      : "0s",
  });

  watch(
    () => props.isOpen,
    async (open) => {
      linksShown.value = false;
      if (!open) return;

      await nextTick();

      if (typeof window === "undefined") {
        linksShown.value = true;
        return;
      }

      window.requestAnimationFrame(() => {
        linksShown.value = true;
      });
    },
    { immediate: true },
  );
</script>

<template>
  <UiSlideMenu :is-open="isOpen" @close="emit('close')">
    <nav :class="$style.drawer" aria-label="Разделы сайта отеля">
      <ul :class="$style.list">
        <li
          v-for="(link, index) in DRAWER_MENU_LINKS"
          :key="link.url"
          :class="[$style.item, linksShown && $style.itemShown]"
          :style="revealDelay(index)"
        >
          <a
            :href="link.url"
            :class="$style.link"
            target="_blank"
            rel="noopener noreferrer"
            @click="emit('navigate')"
          >{{ link.text }}</a>
        </li>
      </ul>

      <hr :class="$style.divider">

      <div :class="$style.block">
        <p :class="$style.label">Бронирование</p>
        <a :href="toTelHref(HOTEL_INFO.bookingPhone)" :class="$style.phone">
          {{ HOTEL_INFO.bookingPhone }}
        </a>
      </div>

      <hr :class="$style.divider">

      <div :class="$style.block">
        <p :class="$style.label">Язык</p>
        <div :class="$style.options" role="group" aria-label="Язык">
          <button
            v-for="option in LOCALE_OPTIONS"
            :key="option.code"
            type="button"
            :class="[$style.option, locale === option.code && $style.optionActive]"
            :aria-pressed="locale === option.code"
            @click="emit('select-locale', option.code)"
          >{{ option.label }}</button>
        </div>
      </div>

      <hr :class="$style.divider">

      <div :class="$style.block">
        <p :class="$style.label">Валюта</p>
        <div :class="$style.options" role="group" aria-label="Валюта">
          <button
            v-for="option in CURRENCY_OPTIONS"
            :key="option.code"
            type="button"
            :class="[
              $style.option,
              currency === option.code && $style.optionActive,
            ]"
            :aria-pressed="currency === option.code"
            @click="emit('select-currency', option.code)"
          >{{ option.label }}</button>
        </div>
      </div>

      <hr :class="$style.divider">

      <div :class="$style.socialRow">
        <CoreSocialLinks :links="HOTEL_SOCIAL_LINKS" color="var(--a-white)" />
        <a
          :href="HOTEL_SITE_URL"
          :class="$style.logoLink"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Сайт отеля ukraina-hotel.ru"
        >
          <LogoRadisson :class="$style.logo" />
        </a>
      </div>
    </nav>
  </UiSlideMenu>
</template>

<style module lang="scss">
  .drawer {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: rem(200);
    margin: 0 auto;
  }

  .list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Стагger-проявление ссылок: 40px справа, как на старом сайте */
  .item {
    margin-bottom: rem(25);
    opacity: 0;
    transform: translateX(rem(40));
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .itemShown {
    opacity: 1;
    transform: translateX(0);
  }

  .link {
    display: block;
    font-family: var(--a-font-body);
    font-size: rem(11);
    line-height: 1.4;
    color: var(--a-white);
    text-decoration: none;
    text-transform: uppercase;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }

    &:focus-visible {
      outline: rem(1) solid var(--a-white);
      outline-offset: rem(4);
    }
  }

  .divider {
    width: 100%;
    margin: rem(20) 0;
    border: 0;
    border-top: rem(1) solid var(--a-white);
    opacity: 0.6;
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: rem(10);
  }

  .label {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(12);
    color: var(--a-white);
    text-transform: uppercase;
  }

  .phone {
    font-family: var(--a-font-body);
    font-size: rem(12);
    color: var(--a-white);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .options {
    display: flex;
    gap: rem(12);
  }

  .option {
    padding: 0;
    background: transparent;
    border: 0;
    font-family: var(--a-font-body);
    font-size: rem(12);
    color: var(--a-white);
    text-transform: uppercase;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }

    &:focus-visible {
      outline: rem(1) solid var(--a-white);
      outline-offset: rem(2);
    }
  }

  .optionActive {
    opacity: 1;
    text-decoration: underline;
  }

  .socialRow {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: rem(20);
  }

  .logoLink {
    display: flex;
    align-items: center;
    color: var(--a-white);

    &:focus-visible {
      outline: rem(1) solid var(--a-white);
      outline-offset: rem(2);
    }
  }

  .logo {
    width: rem(80);
    height: auto;

    :global(path) {
      fill: var(--a-white);
    }
  }
</style>
