<script setup lang="ts">
  interface Props {
    minHeight?: string;
    rootMargin?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    minHeight: "420px",
    rootMargin: "300px 0px",
  });

  const hostRef = ref<HTMLElement | null>(null);
  const mounted = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!hostRef.value) return;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        mounted.value = true;
        observer?.disconnect();
        observer = null;
      },
      { rootMargin: props.rootMargin, threshold: 0.01 },
    );

    observer.observe(hostRef.value);
  });

  onUnmounted(() => {
    observer?.disconnect();
    observer = null;
  });
</script>

<template>
  <section ref="hostRef" :class="$style.host">
    <slot v-if="mounted" />
    <div
      v-else
      :class="$style.placeholder"
      :style="{ minHeight }"
      aria-hidden="true"
    />
  </section>
</template>

<style module lang="scss">
  .host {
    width: 100%;
    contain: layout style paint;
  }

  .placeholder {
    width: 100%;
    background: linear-gradient(
      90deg,
      var(--a-landing-surface-muted) 25%,
      var(--a-gray-50) 37%,
      var(--a-landing-surface-muted) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
</style>
