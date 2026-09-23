/**
 * Header `position: fixed` только ≥ `$desktopMin` (1024px) в header-aside.
 * Ниже — в потоке документа, без компенсационного margin у контента.
 */
export const HEADER_FIXED_MIN_PX = 1024;
/** Sync with `$headerCompactMax` — язык/валюта уходят из шапки в SlideMenu */
export const HEADER_COMPACT_MAX_PX = 588;

function queryHeaderAside(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const headerSection = document.querySelector("section[class*='section']");
  return (headerSection?.querySelector("aside") as HTMLElement | null) ?? null;
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
