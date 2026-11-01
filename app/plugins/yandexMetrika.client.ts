interface YandexMetrikaFn {
  (...args: unknown[]): void;
  a?: unknown[];
  l?: number;
}

declare global {
  interface Window {
    ym?: YandexMetrikaFn;
    dataLayer?: unknown[];
  }
}

function getYm(): YandexMetrikaFn {
  if (typeof window.ym === "function") {
    return window.ym;
  }

  const ym: YandexMetrikaFn = function (...args: unknown[]) {
    (ym.a = ym.a || []).push(args);
  };
  ym.l = Date.now();
  window.ym = ym;
  return ym;
}

export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    return;
  }

  const counterId = Number(useRuntimeConfig().public.yandexMetrikaId);
  if (!Number.isInteger(counterId) || counterId <= 0) {
    return;
  }

  window.dataLayer ??= [];
  getYm();

  // Всегда window.ym: после загрузки tag.js stub заменяется настоящей функцией.
  window.ym?.(counterId, "init", {
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });

  const router = useRouter();
  let isInitialNavigation = true;
  router.afterEach((to, from) => {
    if (isInitialNavigation) {
      isInitialNavigation = false;
      return;
    }

    window.ym?.(counterId, "hit", to.fullPath, {
      title: document.title,
      referer: from.fullPath,
    });
  });
});
