<script setup lang="ts">
  interface SlideItem {
    image: string;
    link?: string;
  }

  interface Props {
    items: SlideItem[];
  }

  const props = defineProps<Props>();

  const currentIndex = ref(0);
  const autoplayMs = 5000;
  let autoplayTimer: ReturnType<typeof setInterval> | null = null;
  const sectionRef = ref<HTMLElement | null>(null);
  const isVisible = ref(false);
  const loadedImages = ref<Set<string>>(new Set());
  const failedImages = ref<Set<string>>(new Set());
  let observer: IntersectionObserver | null = null;
  const FALLBACK_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Crect width='1200' height='700' fill='%23e9e9e9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23909090' font-family='Arial' font-size='28'%3EImage unavailable%3C/text%3E%3C/svg%3E";

  const hasManySlides = computed(() => props.items.length > 1);
  const safeCurrentIndex = computed(() =>
    props.items.length > 0 ? currentIndex.value % props.items.length : 0,
  );

  const prevIndex = computed(() => {
    if (!props.items.length) return 0;
    return (safeCurrentIndex.value - 1 + props.items.length) % props.items.length;
  });

  const nextIndex = computed(() => {
    if (!props.items.length) return 0;
    return (safeCurrentIndex.value + 1) % props.items.length;
  });

  const goTo = (index: number) => {
    if (!props.items.length) return;
    currentIndex.value = (index + props.items.length) % props.items.length;
  };

  const goNext = () => goTo(safeCurrentIndex.value + 1);
  const goPrev = () => goTo(safeCurrentIndex.value - 1);

  const slideAlt = (index: number) =>
    `Фотогалерея, слайд ${index + 1} из ${props.items.length}`;

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (!hasManySlides.value || !isVisible.value || document.hidden) return;

    autoplayTimer = setInterval(() => {
      goNext();
    }, autoplayMs);
  };

  const markLoaded = (image: string) => {
    const next = new Set(loadedImages.value);
    next.add(image);
    loadedImages.value = next;
  };

  const isLoaded = (image: string) => loadedImages.value.has(image);
  const isFailed = (image: string) => failedImages.value.has(image);

  const markFailed = (image: string, event: Event) => {
    if (isFailed(image)) return;
    const next = new Set(failedImages.value);
    next.add(image);
    failedImages.value = next;

    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = FALLBACK_IMAGE;
    }
    markLoaded(image);
  };

  watch(
    () => props.items.length,
    () => {
      currentIndex.value = 0;
      startAutoplay();
    },
    { immediate: true },
  );

  onUnmounted(() => {
    observer?.disconnect();
    observer = null;
    stopAutoplay();
  });

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = Boolean(entry?.isIntersecting);
        startAutoplay();
      },
      { threshold: 0.2 },
    );

    if (sectionRef.value) observer.observe(sectionRef.value);

    document.addEventListener("visibilitychange", startAutoplay);
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", startAutoplay);
  });
</script>

<template>
  <section
    v-if="items.length > 0"
    ref="sectionRef"
    :class="$style.temporarySection"
    aria-label="Промо-слайдер"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div :class="$style.slider">
      <button
        type="button"
        :class="[$style.arrow, $style.prev]"
        aria-label="Предыдущий слайд"
        @click="goPrev"
      >
        &#10094;
      </button>

      <div :class="$style.track">
        <a
          v-if="items[prevIndex]"
          :href="items[prevIndex].link || '#'"
          :class="[$style.slide, $style.side]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div v-if="!isLoaded(items[prevIndex].image)" :class="$style.placeholder" />
          <img
            :src="items[prevIndex].image"
            :alt="slideAlt(prevIndex)"
            loading="lazy"
            decoding="async"
            @load="markLoaded(items[prevIndex].image)"
            @error="markFailed(items[prevIndex].image, $event)"
          >
        </a>

        <a
          v-if="items[safeCurrentIndex]"
          :href="items[safeCurrentIndex].link || '#'"
          :class="[$style.slide, $style.center]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div v-if="!isLoaded(items[safeCurrentIndex].image)" :class="$style.placeholder" />
          <img
            :src="items[safeCurrentIndex].image"
            :alt="slideAlt(safeCurrentIndex)"
            :loading="safeCurrentIndex === 0 ? 'eager' : 'lazy'"
            :fetchpriority="safeCurrentIndex === 0 ? 'high' : 'auto'"
            decoding="async"
            @load="markLoaded(items[safeCurrentIndex].image)"
            @error="markFailed(items[safeCurrentIndex].image, $event)"
          >
        </a>

        <a
          v-if="items[nextIndex]"
          :href="items[nextIndex].link || '#'"
          :class="[$style.slide, $style.side]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div v-if="!isLoaded(items[nextIndex].image)" :class="$style.placeholder" />
          <img
            :src="items[nextIndex].image"
            :alt="slideAlt(nextIndex)"
            loading="lazy"
            decoding="async"
            @load="markLoaded(items[nextIndex].image)"
            @error="markFailed(items[nextIndex].image, $event)"
          >
        </a>
      </div>

      <button
        type="button"
        :class="[$style.arrow, $style.next]"
        aria-label="Следующий слайд"
        @click="goNext"
      >
        &#10095;
      </button>
    </div>

    <div :class="$style.dots">
      <button
        v-for="(slide, index) in items"
        :key="`${slide.image}-${index}`"
        type="button"
        :class="[$style.dot, index === safeCurrentIndex ? $style.activeDot : '']"
        :aria-label="`Показать слайд ${index + 1}`"
        @click="goTo(index)"
      />
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .temporarySection {
    width: 100%;
    margin-top: rem(46);
    margin-bottom: rem(36);
    overflow: hidden;
  }

  .slider {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(#{rem(1260)}, calc(100% - var(--ds-space-1000)));
    margin: 0 auto;
  }

  .track {
    display: grid;
    grid-template-columns: 0.92fr 1.52fr 0.92fr;
    gap: rem(18);
    align-items: center;
    width: 100%;
  }

  .slide {
    position: relative;
    display: block;
    border-radius: 0;
    overflow: hidden;
    transition: transform 0.4s ease, opacity 0.4s ease, filter 0.4s ease;

    img {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  .placeholder {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--ds-neutral-100) 25%,
      var(--a-gray-50) 37%,
      var(--ds-neutral-100) 63%
    );
    background-size: 400% 100%;
    animation: shimmer 1.2s ease infinite;
  }

  .center {
    transform: scale(1);
    opacity: 1;
    filter: none;
  }

  .side {
    transform: scale(0.89);
    opacity: 0.88;
    filter: brightness(0.84);
  }

  .side::after {
    content: "";
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--a-black) 17%, transparent);
    pointer-events: none;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    width: rem(31);
    height: rem(31);
    border: none;
    border-radius: 50%;
    color: var(--a-text-white);
    background: var(--ds-neutral-300);
    font-size: rem(18);
    line-height: 1;
    cursor: pointer;
  }

  .prev {
    left: rem(-14);
  }

  .next {
    right: rem(-14);
  }

  .dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: rem(11);
    margin-top: rem(14);
  }

  .dot {
    width: rem(7);
    height: rem(7);
    border: none;
    border-radius: 50%;
    padding: 0;
    background: var(--a-landing-muted);
    cursor: pointer;
  }

  .activeDot {
    background: var(--a-landing-accent-deep);
  }

  @media (max-width: calc(#{size.$tabletMax} - #{rem(1)})) {
    .temporarySection {
      margin-top: rem(28);
      margin-bottom: var(--ds-space-400);
    }

    .track {
      grid-template-columns: 1fr;
      width: 100%;
    }

    .side {
      display: none;
    }

    .slider {
      width: calc(100% - var(--ds-space-400));
    }

    .arrow {
      width: rem(36);
      height: rem(36);
    }

    .prev {
      left: var(--ds-space-100);
    }

    .next {
      right: var(--ds-space-100);
    }
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
