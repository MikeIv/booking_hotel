<script setup lang="ts">
  interface Props {
    html: string;
    cssText: string;
  }

  const props = defineProps<Props>();

  const { locale, setLocale } = useI18n();

  const host = ref<HTMLElement | null>(null);
  let shadowRootRef: ShadowRoot | null = null;
  const styleElementRef = ref<HTMLStyleElement | null>(null);
  const supportsAdoptedStyleSheets =
    typeof CSSStyleSheet !== "undefined" &&
    "adoptedStyleSheets" in Document.prototype;
  const cacheKey = "__ukraina_shadow_styles__";
  const styleSheetCache = (() => {
    const root = globalThis as typeof globalThis & {
      [cacheKey]?: Map<string, CSSStyleSheet>;
    };
    if (!root[cacheKey]) {
      root[cacheKey] = new Map<string, CSSStyleSheet>();
    }
    return root[cacheKey];
  })();

  /** Ссылки языка в скрапленном HTML ведут на ukraina-hotel.ru — перехватываем в Vue i18n. */
  const resolveLocaleFromHref = (href: string): "ru" | "en" | null => {
    if (/setlocale\/en|(?:^|\/\/|\/)en(?:\/|$|\?)/i.test(href)) return "en";
    if (/setlocale\/ru|(?:^|\/\/|\/)ru(?:\/|$|\?)/i.test(href)) return "ru";
    return null;
  };

  const syncLangUi = () => {
    if (!shadowRootRef) return;
    const code = locale.value;
    shadowRootRef.querySelectorAll(".lang_li").forEach((el) => {
      el.classList.toggle("selected-lang", el.classList.contains(code));
    });
  };

  const onShadowClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href") ?? "";
    const nextLocale = resolveLocaleFromHref(href);
    if (!nextLocale) return;

    event.preventDefault();
    event.stopPropagation();
    void setLocale(nextLocale);
  };

  const renderShadowContent = () => {
    if (!host.value) return;
    if (!shadowRootRef) {
      shadowRootRef = host.value.attachShadow({ mode: "open" });
      shadowRootRef.addEventListener("click", onShadowClick);
    }

    shadowRootRef.innerHTML = props.html;

    if (supportsAdoptedStyleSheets) {
      let cachedSheet = styleSheetCache.get(props.cssText);

      if (!cachedSheet) {
        cachedSheet = new CSSStyleSheet();
        cachedSheet.replaceSync(props.cssText);
        styleSheetCache.set(props.cssText, cachedSheet);
      }

      shadowRootRef.adoptedStyleSheets = [cachedSheet];
      styleElementRef.value = null;
    } else {
      if (!styleElementRef.value) {
        const styleEl = document.createElement("style");
        shadowRootRef.prepend(styleEl);
        styleElementRef.value = styleEl;
      }
      styleElementRef.value.textContent = props.cssText;
    }

    syncLangUi();
  };

  onMounted(() => {
    renderShadowContent();
  });

  onUnmounted(() => {
    shadowRootRef?.removeEventListener("click", onShadowClick);
  });

  watch(
    () => [props.html, props.cssText] as const,
    () => {
      renderShadowContent();
    },
  );

  watch(locale, () => {
    syncLangUi();
  });
</script>

<template>
  <div ref="host" />
</template>
