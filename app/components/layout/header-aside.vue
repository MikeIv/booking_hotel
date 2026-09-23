<script setup lang="ts">
  import LogoRadisson from "~/assets/images/logo_radisson.svg";

  import LayoutAuthSection from "~/components/layout/LayoutAuthSection.vue";

  const props = withDefaults(
    defineProps<{
      variant?: "solid" | "overlay";
    }>(),
    { variant: "solid" },
  );

  const { locale, setLocale } = useI18n();
  const router = useRouter();

  const {
    authStore,
    authDialogType,
    recoveryEmail,
    showMyBookingPopup,
    showMyBookingDialog,
    hideMyBookingDialog,
    handleMyBookingLoginSuccess,
    showAuthDialog,
    hideAuthDialog,
    switchAuthDialog,
  } = useLayoutAuth();

  let asideResizeObserver: ResizeObserver | null = null;

  // --- Navigation ---
  const navLinks = [
    { url: "https://www.ukraina-hotel.ru/accommodation", text: "Размещение" },
    { url: "https://www.ukraina-hotel.ru/events", text: "Мероприятия" },
    { url: "https://collection.wedding/", text: "Свадьбы" },
    { url: "https://collection.catering/", text: "Кейтеринг" },
    { url: "https://www.ukraina-hotel.ru/restaurants/", text: "Рестораны" },
    { url: "https://www.ukraina-hotel.ru/services", text: "Услуги отеля" },
    { url: "https://www.ukraina-hotel.ru/virtual-tours/", text: "Виртуальные туры" },
  ] as const;

  // --- Burger / SlideMenu ---
  const isMenuOpen = ref(false);
  const asideRef = ref<HTMLElement | null>(null);
  const asideHeight = ref(94);

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  };

  const updateHeight = () => {
    if (asideRef.value) {
      asideHeight.value = asideRef.value.offsetHeight;
    }
  };

  // --- Language / Currency (Figma 4585:1652) ---
  const LOCALE_OPTIONS = [
    { code: "ru" as const, label: "Рус" },
    { code: "en" as const, label: "Eng" },
  ];
  const CURRENCY_OPTIONS = [
    { code: "RUB" as const, symbol: "₽" },
    { code: "USD" as const, symbol: "$" },
    { code: "EUR" as const, symbol: "€" },
  ];
  type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["code"];

  const isLangOpen = ref(false);
  const isCurrencyOpen = ref(false);
  const langDropdownRef = ref<HTMLElement | null>(null);
  const currencyDropdownRef = ref<HTMLElement | null>(null);
  const currentCurrency = ref<CurrencyCode>("RUB");

  const localeLabel = computed(() => (locale.value === "ru" ? "Рус" : "Eng"));
  const currencySymbol = computed(
    () =>
      CURRENCY_OPTIONS.find((o) => o.code === currentCurrency.value)?.symbol ??
      "₽",
  );

  const closeUtilityDropdowns = () => {
    isLangOpen.value = false;
    isCurrencyOpen.value = false;
  };

  const toggleLangDropdown = () => {
    const next = !isLangOpen.value;
    closeUtilityDropdowns();
    isLangOpen.value = next;
  };

  const toggleCurrencyDropdown = () => {
    const next = !isCurrencyOpen.value;
    closeUtilityDropdowns();
    isCurrencyOpen.value = next;
  };

  const selectLocale = (code: "ru" | "en") => {
    setLocale(code);
    closeUtilityDropdowns();
  };

  const selectCurrency = (code: CurrencyCode) => {
    currentCurrency.value = code;
    closeUtilityDropdowns();
  };

  const isOverlay = computed(() => props.variant === "overlay");
  const isScrolled = ref(false);

  const updateScroll = () => {
    if (!isOverlay.value) {
      isScrolled.value = false;
      return;
    }
    isScrolled.value = window.scrollY > 48;
  };

  // --- Search ---
  const isSearchOpen = ref(false);
  const searchQuery = ref("");
  const searchInputRef = ref<HTMLInputElement | null>(null);

  const toggleSearch = () => {
    isSearchOpen.value = !isSearchOpen.value;
    if (isSearchOpen.value) {
      searchQuery.value = "";
      nextTick(() => {
        searchInputRef.value?.focus();
      });
    }
  };

  const isOutside = (el: HTMLElement | null, target: Node) =>
    Boolean(el && !el.contains(target));

  const closeDropdownsOnClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (isLangOpen.value && isOutside(langDropdownRef.value, target)) {
      isLangOpen.value = false;
    }
    if (isCurrencyOpen.value && isOutside(currencyDropdownRef.value, target)) {
      isCurrencyOpen.value = false;
    }
  };

  onMounted(() => {
    nextTick(() => {
      updateHeight();
      asideResizeObserver = new ResizeObserver(updateHeight);
      if (asideRef.value) {
        asideResizeObserver.observe(asideRef.value);
      }
    });

    if (typeof document !== "undefined") {
      document.addEventListener("click", closeDropdownsOnClickOutside);
    }

    if (isOverlay.value) {
      updateScroll();
      window.addEventListener("scroll", updateScroll, { passive: true });
    }
  });

  onUnmounted(() => {
    asideResizeObserver?.disconnect();
    asideResizeObserver = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("click", closeDropdownsOnClickOutside);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", updateScroll);
    }
  });
</script>

<template>
  <aside
    ref="asideRef"
    :class="[$style.aside, isOverlay && !isScrolled && $style.overlay]"
  >
    <div :class="$style.wrapper">
      <!-- Бургер: скрыт ≥$headerNavMin -->
      <button
        :class="$style.burgerBtn"
        aria-label="Открыть меню"
        :aria-expanded="isMenuOpen"
        @click="toggleMenu"
      >
        <UIcon name="iconamoon:menu-burger-horizontal-bold" :class="$style.burgerIcon" />
      </button>

      <NuxtLink :class="$style.logoBtn" to="/" aria-label="На главную">
        <LogoRadisson :class="$style.logo" />
      </NuxtLink>

      <nav :class="$style.desktopNav" aria-label="Основная навигация">
        <a
          v-for="link in navLinks"
          :key="link.url"
          :href="link.url"
          :class="$style.navLink"
          target="_blank"
          rel="noopener"
        >{{ link.text }}</a>
      </nav>

      <span :class="$style.logoPlaceholder" aria-hidden="true" />

      <!-- Кнопки: Моё бронирование + Войти / Личный кабинет -->
      <div :class="$style.buttonsGroup">
        <Button
          v-if="!authStore.isAuthenticated"
          :class="[$style.headerButton, $style.headerButtonWide]"
          unstyled
          @click="showMyBookingDialog"
        >
          Моё бронирование
        </Button>
        <Button
          v-if="!authStore.isAuthenticated"
          :class="[$style.headerButton, $style.headerButtonNarrow]"
          unstyled
          @click="showAuthDialog('login')"
        >
          Войти
        </Button>
        <Button
          v-else
          :class="[$style.headerButton, $style.headerButtonNarrow]"
          unstyled
          @click="router.push('/cabinet')"
        >
          Личный кабинет
        </Button>
      </div>

      <!-- Утилиты: Поиск + Язык + Валюта (Figma 4585:1652) -->
      <div :class="$style.utilityGroup">
        <button
          :class="$style.searchBtn"
          aria-label="Поиск"
          @click="toggleSearch"
        >
          <UIcon name="i-search" :class="$style.searchIcon" />
        </button>

        <div ref="langDropdownRef" :class="[$style.langWrap, $style.utilityPillWrap]">
          <button
            type="button"
            :class="$style.langPill"
            aria-haspopup="listbox"
            :aria-expanded="isLangOpen"
            aria-label="Выбор языка"
            @click.stop="toggleLangDropdown"
          >
            {{ localeLabel }}
            <UIcon
              name="i-chevron-down"
              :class="[$style.chevron, { [$style.chevronOpen]: isLangOpen }]"
            />
          </button>
          <Transition name="lang-dropdown">
            <div
              v-show="isLangOpen"
              :class="$style.langDropdown"
              role="listbox"
              aria-label="Язык"
            >
              <button
                v-for="opt in LOCALE_OPTIONS"
                :key="opt.code"
                type="button"
                role="option"
                :aria-selected="locale === opt.code"
                :class="[$style.langOption, locale === opt.code && $style.langOptionActive]"
                @click.stop="selectLocale(opt.code)"
              >
                {{ opt.label }}
              </button>
            </div>
          </Transition>
        </div>

        <div
          ref="currencyDropdownRef"
          :class="[$style.langWrap, $style.utilityPillWrap]"
        >
          <button
            type="button"
            :class="$style.langPill"
            aria-haspopup="listbox"
            :aria-expanded="isCurrencyOpen"
            aria-label="Выбор валюты"
            @click.stop="toggleCurrencyDropdown"
          >
            {{ currencySymbol }}
            <UIcon
              name="i-chevron-down"
              :class="[$style.chevron, { [$style.chevronOpen]: isCurrencyOpen }]"
            />
          </button>
          <Transition name="lang-dropdown">
            <div
              v-show="isCurrencyOpen"
              :class="$style.langDropdown"
              role="listbox"
              aria-label="Валюта"
            >
              <button
                v-for="opt in CURRENCY_OPTIONS"
                :key="opt.code"
                type="button"
                role="option"
                :aria-selected="currentCurrency === opt.code"
                :class="[
                  $style.langOption,
                  currentCurrency === opt.code && $style.langOptionActive,
                ]"
                @click.stop="selectCurrency(opt.code)"
              >
                {{ opt.symbol }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </aside>

  <!-- Поисковый оверлей -->
  <Transition name="search-overlay">
    <div
      v-if="isSearchOpen"
      :class="$style.searchOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Поиск"
      @click.self="toggleSearch"
    >
      <div :class="$style.searchBox">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="search"
          :class="$style.searchInput"
          placeholder="Поиск..."
          @keydown.esc="toggleSearch"
        />
        <button :class="$style.searchClose" aria-label="Закрыть поиск" @click="toggleSearch">
          <UIcon name="i-close" :class="$style.searchCloseIcon" />
        </button>
      </div>
    </div>
  </Transition>

  <!-- Выезжающее меню -->
  <UiSlideMenu
    :is-open="isMenuOpen"
    :links="navLinks"
    :top-offset="asideHeight"
    background-color="--a-mainBg"
    @close="toggleMenu"
  />

  <LayoutAuthSection
    :auth-dialog-type="authDialogType"
    :recovery-email="recoveryEmail"
    :show-my-booking-popup="showMyBookingPopup"
    @close="hideAuthDialog"
    @switch-to-register="switchAuthDialog('register')"
    @switch-to-recovery="switchAuthDialog('recovery', $event)"
    @switch-to-login="switchAuthDialog('login')"
    @login-success="hideAuthDialog"
    @my-booking-close="hideMyBookingDialog"
    @my-booking-login-success="handleMyBookingLoginSuccess"
  />
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/variables/z-index" as z;

  .aside {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    overflow-x: clip;
    background-color: var(--a-whiteBg);
    z-index: z.z("header");
  }

  /* =====================
     WRAPPER — базовая сетка
     Figma 4585:1652:
     ≤$headerCompactMax — 2 строки, без языка/валюты;
     <$desktopMin — 2 строки (search + lang + currency справа);
     ≥$desktopMin — 1 строка + бургер;
     ≥$headerNavMin — лого + nav вместо бургера
  ===================== */
  .wrapper {
    position: relative;
    display: grid;
    /* <1024: burger | placeholder | utility */
    grid-template-columns: auto 1fr auto;
    grid-template-rows: rem(70) auto;
    align-items: center;
    align-content: start;
    width: 100%;
    max-width: #{size.$desktopMax};
    min-height: rem(150);
    margin: 0 auto;
    padding: var(--ds-space-200);
    column-gap: var(--ds-space-200);
    row-gap: var(--ds-space-200);

    /* ≥1024: burger | logo | spacer | buttons | utility — одна строка */
    @media (min-width: #{size.$desktopMin}) {
      grid-template-columns: auto auto 1fr auto auto;
      grid-template-rows: rem(93);
      min-height: rem(93);
      row-gap: 0;
      align-content: center;
      padding: 0 var(--ds-space-600);
      column-gap: var(--ds-space-200);
    }

    /* ≥1880: logo | nav | buttons | utility — отступы как в Figma 93:13278 (90 / 49) */
    @media (min-width: #{size.$headerNavMin}) {
      grid-template-columns: auto minmax(0, 1fr) auto auto;
      padding: 0 rem(49) 0 rem(90);
      column-gap: var(--ds-space-500);
    }
  }

  /* =====================
     БУРГЕР
  ===================== */
  .burgerBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(30);
    height: rem(30);
    grid-row: 1;
    grid-column: 1;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--secondary);
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }

    @media (min-width: #{size.$headerNavMin}) {
      display: none;
    }
  }

  .burgerIcon {
    width: rem(30);
    height: rem(30);
  }

  /* =====================
     ЛОГОТИП
  ===================== */
  .logoBtn {
    /* <1024: абсолютный центр верхней строки (не пересекается с кнопками на row 2) */
    position: absolute;
    left: 50%;
    top: rem(35);
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    padding: 0;
    z-index: 1;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    background: transparent;
    border: none;
    flex-shrink: 0;

    /* ≥1024: в потоке сетки слева от spacer — иначе наползает на кнопки */
    @media (min-width: #{size.$desktopMin}) {
      position: static;
      transform: none;
      grid-row: 1;
      grid-column: 2;
      justify-self: start;
    }

    @media (min-width: #{size.$headerNavMin}) {
      grid-column: 1;
    }

    &:hover .logo {
      opacity: 0.85;
    }

    &:focus-visible {
      outline: rem(2) solid var(--ds-neutral-900);
      outline-offset: rem(4);
      border-radius: var(--ds-radius-sm);
    }
  }

  .logo {
    display: block;
    width: rem(152);
    height: auto;
    transition: opacity 0.3s ease;

    @media (max-width: #{size.$headerCompactMax}) {
      width: rem(118);
    }

    @media (min-width: #{size.$desktopMin}) {
      width: rem(182);
    }

    :global(path) {
      fill: var(--ds-neutral-900);
    }
  }

  /* =====================
     ДЕСКТОПНАЯ НАВИГАЦИЯ (≥$headerNavMin)
  ===================== */
  .desktopNav {
    display: none;

    /* Figma 93:13278 — track 962px, justify-between (не фиксированный gap) */
    @media (min-width: #{size.$headerNavMin}) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      justify-self: stretch;
      width: 100%;
      max-width: rem(962);
      min-width: 0;
      min-height: rem(44);
      grid-row: 1;
      grid-column: 2;
    }
  }

  .navLink {
    font-family: var(--a-font-body);
    font-size: var(--ds-typo-size-body-sm);
    font-weight: var(--ds-typo-weight-body);
    text-transform: uppercase;
    text-decoration: none;
    color: var(--ds-neutral-900);
    white-space: nowrap;
    flex-shrink: 0;
    transition: color 0.2s ease;

    &:hover {
      color: var(--ds-neutral-700);
      text-decoration: underline;
    }
  }

  /* =====================
     ПЛЕЙСХОЛДЕР ДЛЯ ЦЕНТРИРОВАНИЯ ЛОГОТИПА
  ===================== */
  .logoPlaceholder {
    grid-row: 1;
    grid-column: 2;

    @media (min-width: #{size.$desktopMin}) {
      display: none;
    }
  }

  /* =====================
     ГРУППА КНОПОК (Моё бронирование + Войти)
  ===================== */
  .buttonsGroup {
    display: flex;
    gap: var(--ds-space-200);
    align-items: center;
    justify-content: center;
    max-width: 100%;
    min-width: 0;
    flex-shrink: 0;
    /* <1024: вторая строка на всю ширину */
    grid-row: 2;
    grid-column: 1 / -1;

    @media (min-width: #{size.$desktopMin}) {
      grid-row: 1;
      grid-column: 4;
      justify-self: end;
    }

    @media (min-width: #{size.$headerNavMin}) {
      grid-column: 3;
    }
  }

  .headerButton {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: rem(44);
    height: rem(44);
    padding: rem(12) var(--ds-space-300);
    font-family: var(--a-font-body);
    font-size: var(--ds-typo-size-body-lg);
    font-weight: var(--ds-typo-weight-body);
    line-height: 1;
    background-color: var(--a-whiteBg);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-dark);
    border-radius: var(--a-borderR--btn);
    box-sizing: border-box;
    cursor: pointer;
    transition: background-color 0.3s ease;
    white-space: nowrap;

    &:hover {
      background-color: var(--a-mainBg);
    }
  }

  .headerButtonWide {
    min-width: rem(204);
  }

  .headerButtonNarrow {
    min-width: rem(150);
  }

  /* <$headerCompactMax / ~360: кнопки и текст сжимаются, чтобы «Моё бронирование» не выпадало */
  @media (max-width: #{size.$headerCompactMax}) {
    .headerButtonWide,
    .headerButtonNarrow {
      min-width: 0;
      flex: 1 1 0;
    }

    .headerButton {
      padding-inline: rem(8);
      font-size: var(--ds-typo-size-body-sm);
    }

    .buttonsGroup {
      gap: rem(8);
    }
  }

  /* =====================
     ГРУППА УТИЛИТ (Поиск + Язык + Валюта)
  ===================== */
  .utilityGroup {
    display: flex;
    align-items: center;
    min-height: rem(44);
    gap: var(--ds-space-200);
    grid-row: 1;
    grid-column: 3;
    justify-self: end;
    flex-shrink: 0;

    @media (max-width: #{size.$headerCompactMax}) {
      gap: rem(8);
      min-height: rem(32);
    }

    @media (min-width: #{size.$desktopMin}) {
      grid-column: 5;
    }

    @media (min-width: #{size.$headerNavMin}) {
      grid-column: 4;
      gap: var(--ds-space-300);
    }
  }

  /* Figma: на самом узком вьюпорте остаются бургер + лого + поиск */
  .utilityPillWrap {
    @media (max-width: #{size.$headerCompactMax}) {
      display: none;
    }
  }

  /* =====================
     ПОИСК
  ===================== */
  .searchBtn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(35);
    height: rem(35);
    flex-shrink: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--ds-neutral-700);
    transition: color 0.2s ease;

    @media (max-width: #{size.$headerCompactMax}) {
      width: rem(24);
      height: rem(24);
    }

    &:hover {
      color: var(--ds-neutral-900);
    }
  }

  .searchIcon {
    display: block;
    width: rem(35);
    height: rem(35);
    color: inherit;

    @media (max-width: #{size.$headerCompactMax}) {
      width: rem(24);
      height: rem(24);
    }
  }

  /* =====================
     ЯЗЫК / ВАЛЮТА — пилли
  ===================== */
  .langWrap {
    position: relative;
    flex-shrink: 0;
  }

  .langPill {
    display: flex;
    align-items: center;
    gap: rem(6);
    padding: rem(5) rem(12);
    background: transparent;
    border: rem(1) solid var(--ds-neutral-700);
    border-radius: rem(16);
    color: var(--ds-neutral-700);
    font-size: var(--ds-typo-size-body-sm);
    font-family: var(--a-font-body);
    font-weight: var(--ds-typo-weight-body);
    line-height: 1;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s ease, color 0.2s ease;

    &:hover {
      border-color: var(--ds-neutral-900);
      color: var(--ds-neutral-900);
    }
  }

  .chevron {
    width: rem(11);
    height: rem(11);
    transition: transform 0.2s ease;
  }

  .chevronOpen {
    transform: rotate(180deg);
  }

  .langDropdown {
    position: absolute;
    top: calc(100% + var(--ds-space-025));
    left: 0;
    min-width: 100%;
    background: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-light);
    border-radius: var(--a-borderR--btn);
    box-shadow: var(--ds-shadow-sm);
    overflow: hidden;
    z-index: 1;
  }

  /* Валюта — крайний правый пилль: дропдаун не уезжает за край */
  .utilityGroup .langWrap:last-child .langDropdown {
    left: auto;
    right: 0;
  }

  .langOption {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: rem(32);
    padding: 0 var(--ds-space-200);
    background: transparent;
    border: none;
    color: var(--secondary);
    font-size: var(--ds-typo-size-body-sm);
    font-family: var(--a-font-body);
    font-weight: var(--ds-typo-weight-body);
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease;

    &:hover {
      color: var(--a-base);
      background-color: var(--ui-color-primary-50);
    }
  }

  .langOptionActive {
    color: var(--a-text-dark);
    font-weight: var(--ds-typo-weight-medium);
  }

  /* =====================
     ПОИСКОВЫЙ ОВЕРЛЕЙ
  ===================== */
  .searchOverlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: z.z("modal", "overlay");
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ds-space-200);
  }

  .searchBox {
    display: flex;
    align-items: center;
    gap: var(--ds-space-200);
    width: 100%;
    max-width: rem(640);
  }

  .searchInput {
    flex: 1;
    height: rem(48);
    padding: 0 var(--ds-space-300);
    font-family: var(--a-font-body);
    font-size: var(--ds-typo-size-body-lg);
    line-height: var(--ds-typo-line-body-lg);
    color: var(--a-text-dark);
    background: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-dark);
    border-radius: var(--a-borderR--btn);
    outline: none;

    &::placeholder {
      color: var(--ds-neutral-500);
    }

    &:focus {
      border-color: var(--ds-neutral-900);
    }
  }

  .searchClose {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(48);
    height: rem(48);
    background: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-dark);
    border-radius: var(--a-borderR--btn);
    cursor: pointer;
    color: var(--a-text-dark);
    flex-shrink: 0;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-mainBg);
    }
  }

  .searchCloseIcon {
    width: rem(20);
    height: rem(20);
  }

  /* =====================
     OVERLAY (главная поверх героя)
  ===================== */
  .overlay {
    background-color: transparent;

    @media (max-width: #{size.$desktopMin - 1px}) {
      background-color: color-mix(in srgb, var(--a-black) 40%, transparent);
    }

    .burgerBtn,
    .searchBtn,
    .navLink,
    .langPill {
      color: var(--a-white);
    }

    .burgerBtn:hover,
    .searchBtn:hover {
      color: var(--a-white);
      opacity: 0.75;
    }

    .navLink:hover {
      color: var(--a-white);
    }

    .logo :global(path),
    .logo :global(rect),
    .logo :global(polygon) {
      fill: var(--a-white);
    }

    .logoBtn:focus-visible {
      outline-color: var(--a-white);
    }

    .headerButton {
      border-color: transparent;
    }

    .langPill {
      border-color: var(--a-white);

      &:hover {
        border-color: var(--a-white);
        color: var(--a-white);
      }
    }
  }
</style>

<style lang="scss">
  .lang-dropdown-enter-active,
  .lang-dropdown-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  .lang-dropdown-enter-from,
  .lang-dropdown-leave-to {
    opacity: 0;
    transform: translateY(rem(-4));
  }

  .search-overlay-enter-active,
  .search-overlay-leave-active {
    transition: opacity 0.2s ease;
  }

  .search-overlay-enter-from,
  .search-overlay-leave-to {
    opacity: 0;
  }
</style>
