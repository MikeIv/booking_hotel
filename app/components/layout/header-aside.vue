<script setup lang="ts">
  import { useI18n } from "vue-i18n";
  import LogoRadisson from "~/assets/images/logo_radisson.svg";

  const { locale, setLocale } = useI18n();
  const authStore = useAuthStore();
  const router = useRouter();

  // --- Auth state ---
  const authDialogType = ref<"login" | "register" | "recovery" | null>(null);
  const recoveryEmail = ref("");
  const showMyBookingPopup = ref(false);
  const hasUnauthenticatedBooking = ref(false);

  const checkUnauthenticatedBooking = () => {
    if (typeof window !== "undefined") {
      hasUnauthenticatedBooking.value =
        sessionStorage.getItem("hasUnauthenticatedBooking") === "true";
    }
  };

  const route = useRoute();

  let asideResizeObserver: ResizeObserver | null = null;

  watch(
    () => route.path,
    () => {
      checkUnauthenticatedBooking();
    },
  );

  watch(
    () => authStore.isAuthenticated,
    () => {
      checkUnauthenticatedBooking();
      if (authStore.isAuthenticated) {
        showMyBookingPopup.value = false;
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("hasUnauthenticatedBooking");
        }
      }
    },
  );

  const showMyBookingDialog = () => {
    showMyBookingPopup.value = true;
  };
  const hideMyBookingDialog = () => {
    showMyBookingPopup.value = false;
  };
  const handleMyBookingLoginSuccess = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hasUnauthenticatedBooking");
    }
    hasUnauthenticatedBooking.value = false;
    hideMyBookingDialog();
  };
  const showAuthDialog = (type: "login" | "register" | "recovery", email?: string) => {
    authDialogType.value = type;
    if (email) recoveryEmail.value = email;
  };
  const hideAuthDialog = () => {
    authDialogType.value = null;
    recoveryEmail.value = "";
  };
  const switchAuthDialog = (to: "login" | "register" | "recovery", email?: string) => {
    authDialogType.value = to;
    if (email) recoveryEmail.value = email;
  };

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

  // --- Language ---
  const LOCALE_OPTIONS: { code: "ru" | "en"; label: string }[] = [
    { code: "ru", label: "Рус" },
    { code: "en", label: "Eng" },
  ];
  const isLangOpen = ref(false);
  const langDropdownRef = ref<HTMLElement | null>(null);

  const toggleLangDropdown = () => {
    isLangOpen.value = !isLangOpen.value;
  };

  const selectLocale = (code: "ru" | "en") => {
    setLocale(code);
    isLangOpen.value = false;
  };

  const localeLabel = computed(() => (locale.value === "ru" ? "Рус" : "Eng"));

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

  // --- Click outside to close dropdowns ---
  const closeDropdownsOnClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (
      isLangOpen.value &&
      langDropdownRef.value &&
      !langDropdownRef.value.contains(target)
    ) {
      isLangOpen.value = false;
    }
  };

  onMounted(() => {
    checkUnauthenticatedBooking();

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
  });

  onUnmounted(() => {
    asideResizeObserver?.disconnect();
    asideResizeObserver = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("click", closeDropdownsOnClickOutside);
    }
  });
</script>

<template>
  <aside ref="asideRef" :class="$style.aside">
    <div :class="$style.wrapper">
      <!-- Бургер (скрыт на ≥$desktop) -->
      <button
        :class="$style.burgerBtn"
        aria-label="Открыть меню"
        :aria-expanded="isMenuOpen"
        @click="toggleMenu"
      >
        <UIcon name="iconamoon:menu-burger-horizontal-bold" :class="$style.burgerIcon" />
      </button>

      <!-- Логотип: ссылка на главную; центрируется абсолютно на <$desktop, статичен слева на ≥$desktop -->
      <NuxtLink :class="$style.logoBtn" to="/" aria-label="На главную">
        <LogoRadisson :class="$style.logo" />
      </NuxtLink>

      <!-- Десктопная навигация (только ≥$desktop) -->
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

      <!-- Плейсхолдер для центрирования логотипа на <$desktop -->
      <span :class="$style.logoPlaceholder" aria-hidden="true" />

      <!-- Кнопки: Моё бронирование + Войти / Личный кабинет -->
      <div :class="$style.buttonsGroup">
        <Button
          v-if="!authStore.isAuthenticated && hasUnauthenticatedBooking"
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

      <!-- Утилиты: Поиск + Язык -->
      <div :class="$style.utilityGroup">
        <button
          :class="$style.searchBtn"
          aria-label="Поиск"
          @click="toggleSearch"
        >
          <UIcon name="i-search" :class="$style.searchIcon" />
        </button>

        <div ref="langDropdownRef" :class="$style.langWrap">
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

  <!-- Попапы авторизации -->
  <BookingLoginPopup
    :visible="authDialogType === 'login'"
    @close="hideAuthDialog"
    @switch-to-register="switchAuthDialog('register')"
    @switch-to-recovery="switchAuthDialog('recovery', $event)"
    @login-success="hideAuthDialog"
  />
  <BookingRegisterPopup
    :visible="authDialogType === 'register'"
    @close="hideAuthDialog"
    @switch-to-login="switchAuthDialog('login')"
  />
  <BookingPasswordRecoveryPopup
    :visible="authDialogType === 'recovery'"
    :initial-email="recoveryEmail"
    @close="hideAuthDialog"
    @switch-to-login="switchAuthDialog('login')"
  />
  <BookingMyBookingPopup
    :visible="showMyBookingPopup"
    @close="hideMyBookingDialog"
    @login-success="handleMyBookingLoginSuccess"
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
    background-color: var(--a-whiteBg);
    z-index: z.z("header");
  }

  /* =====================
     WRAPPER — базовая сетка
  ===================== */
  .wrapper {
    position: relative;
    display: grid;
    /* mobile/tablet default: burger | placeholder | utility */
    grid-template-columns: auto 1fr auto;
    grid-template-rows: rem(70) auto;
    align-items: center;
    align-content: start;
    width: 100%;
    max-width: rem(1920);
    min-height: rem(150);
    margin: 0 auto;
    padding: var(--ds-space-200);
    column-gap: var(--ds-space-200);
    row-gap: var(--ds-space-200);

    /* medium desktop: 1024–1641px — одна строка */
    @media (min-width: #{size.$desktopMin}) {
      grid-template-columns: auto 1fr auto auto;
      grid-template-rows: rem(94);
      min-height: rem(94);
      row-gap: 0;
      align-content: center;
      padding: 0 var(--ds-space-300);
    }

    /* large desktop: ≥1642px — одна строка с навигацией */
    @media (min-width: #{size.$desktop}) {
      padding: 0 var(--ds-space-500);
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

    @media (min-width: #{size.$desktop}) {
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

    @media (min-width: #{size.$desktopMin}) {
      top: 50%;
    }

    @media (min-width: #{size.$desktop}) {
      position: static;
      transform: none;
      grid-row: 1;
      grid-column: 1;
      justify-self: start;
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

    @media (min-width: #{size.$desktopMin}) {
      width: rem(182);
    }

    :global(path) {
      fill: var(--ds-neutral-900);
    }
  }

  /* =====================
     ДЕСКТОПНАЯ НАВИГАЦИЯ (≥$desktop только)
  ===================== */
  .desktopNav {
    display: none;

    @media (min-width: #{size.$desktop}) {
      display: flex;
      align-items: center;
      gap: var(--ds-space-500);
      grid-row: 1;
      grid-column: 2;
      justify-self: start;
    }
  }

  .navLink {
    font-family: var(--a-font-body);
    font-size: var(--ds-typo-size-body-sm);
    font-weight: var(--ds-typo-weight-body);
    text-transform: uppercase;
    text-decoration: none;
    letter-spacing: rem(1);
    color: var(--ds-neutral-900);
    white-space: nowrap;
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

    @media (min-width: #{size.$desktop}) {
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
    /* мобайл/планшет: вторая строка на всю ширину */
    grid-row: 2;
    grid-column: 1 / -1;

    @media (min-width: #{size.$desktopMin}) {
      grid-row: 1;
      grid-column: 3;
      justify-self: end;
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

  /* =====================
     ГРУППА УТИЛИТ (Поиск + Язык)
  ===================== */
  .utilityGroup {
    display: flex;
    align-items: center;
    gap: var(--ds-space-200);
    grid-row: 1;
    grid-column: 3;
    justify-self: end;

    @media (min-width: #{size.$desktopMin}) {
      grid-column: 4;
      gap: var(--ds-space-300);
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
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--ds-neutral-700);
    transition: color 0.2s ease;

    &:hover {
      color: var(--ds-neutral-900);
    }
  }

  .searchIcon {
    width: rem(35);
    height: rem(35);
  }

  /* =====================
     ЯЗЫКОВОЙ ПИЛЬ
  ===================== */
  .langWrap {
    position: relative;
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
