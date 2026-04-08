<script setup lang="ts">
  interface Props {
    html: string;
    cssText: string;
  }

  const props = defineProps<Props>();

  const host = ref<HTMLElement | null>(null);
  let shadowRootRef: ShadowRoot | null = null;
  const styleElementRef = ref<HTMLStyleElement | null>(null);
  const supportsAdoptedStyleSheets =
    typeof CSSStyleSheet !== "undefined" && "adoptedStyleSheets" in Document.prototype;
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

  const renderShadowContent = () => {
    if (!host.value) return;
    if (!shadowRootRef) {
      shadowRootRef = host.value.attachShadow({ mode: "open" });
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
      return;
    }

    if (!styleElementRef.value) {
      const styleEl = document.createElement("style");
      shadowRootRef.prepend(styleEl);
      styleElementRef.value = styleEl;
    }

    styleElementRef.value.textContent = props.cssText;
  };

  onMounted(() => {
    renderShadowContent();
  });

  watch(
    () => [props.html, props.cssText],
    () => {
      renderShadowContent();
    },
  );
</script>

<template>
  <div ref="host" />
</template>
