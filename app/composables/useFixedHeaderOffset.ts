/**
 * Header `position: fixed` только ≥ `$desktopMin` (1024px).
 * Solid <1024 — relative в потоке (белый фон).
 * Overlay <1024 — absolute в герое (прозрачный, уезжает со скроллом).
 * Источник брейкпоинтов для стилей — `resolutions.scss`.
 */
export const HEADER_FIXED_MIN_PX = 1024;

const HEADER_SELECTOR = "[data-app-header]";

function queryHeaderAside(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(HEADER_SELECTOR);
}

export function useFixedHeaderOffset() {
  const headerHeight = ref(0);
  let resizeObserver: ResizeObserver | null = null;

  const isHeaderFixed = () =>
    typeof window !== "undefined" &&
    window.matchMedia(`(min-width: ${HEADER_FIXED_MIN_PX}px)`).matches;

  const updateHeaderHeight = () => {
    if (typeof window === "undefined") return;

    if (!isHeaderFixed()) {
      headerHeight.value = 0;
      return;
    }

    const headerElement = queryHeaderAside();
    if (!headerElement) return;

    const height = headerElement.offsetHeight;
    if (height > 0) {
      headerHeight.value = height;
    }
  };

  const contentStyle = computed(() => ({
    marginTop: `${headerHeight.value}px`,
    "--header-height": `${headerHeight.value}px`,
  }));

  onMounted(() => {
    nextTick(() => {
      updateHeaderHeight();

      resizeObserver = new ResizeObserver(updateHeaderHeight);
      const headerElement = queryHeaderAside();
      if (headerElement) {
        resizeObserver.observe(headerElement);
      }

      window.addEventListener("resize", updateHeaderHeight);
    });
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", updateHeaderHeight);
    }
  });

  return {
    contentStyle,
  };
}
