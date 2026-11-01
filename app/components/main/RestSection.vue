<script setup lang="ts">
  interface RestOfferItem {
    title: string;
    description: string;
    image: string;
    link: string;
    buttonText: string;
  }

  interface Props {
    title: string;
    items: RestOfferItem[];
  }

  const props = defineProps<Props>();

  const currentIndex = ref(0);
  const sectionRef = ref<HTMLElement | null>(null);
  const isVisible = ref(false);
  const hasManySlides = computed(() => props.items.length > 1);
  const currentItem = computed(() => props.items[currentIndex.value]);
  const autoplayMs = 6500;
  let autoplayTimer: ReturnType<typeof setInterval> | null = null;

  const goTo = (index: number) => {
    if (!props.items.length) return;
    currentIndex.value = (index + props.items.length) % props.items.length;
  };

  const goPrev = () => goTo(currentIndex.value - 1);
  const goNext = () => goTo(currentIndex.value + 1);

  const heroTrackStyle = computed(() => ({
    width: `${props.items.length * 100}%`,
    transform: `translate3d(-${(100 / props.items.length) * currentIndex.value}%, 0, 0)`,
  }));

  const visibleThumbCount = computed(() => (props.items.length >= 4 ? 4 : props.items.length));
  const visibleThumbs = computed(() => {
    if (!props.items.length) return [] as Array<{ item: RestOfferItem; index: number }>;

    const count = visibleThumbCount.value;
    const start = currentIndex.value - 1;
    const result: Array<{ item: RestOfferItem; index: number }> = [];

    for (let offset = 0; offset < count; offset += 1) {
      const index = (start + offset + props.items.length) % props.items.length;
      result.push({ item: props.items[index], index });
    }

    return result;
  });

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

  watch(
    () => props.items.length,
    () => {
      currentIndex.value = 0;
      startAutoplay();
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stopAutoplay();
  });

  onMounted(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = Boolean(entry?.isIntersecting);
        startAutoplay();
      },
      { threshold: 0.25 },
    );

    if (sectionRef.value) observer.observe(sectionRef.value);
    document.addEventListener("visibilitychange", startAutoplay);

    onUnmounted(() => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", startAutoplay);
    });
  });
</script>

<template>
  <section
    v-if="items.length"
    ref="sectionRef"
    :class="$style.restSection"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div v-if="title.trim()" :class="$style.container">
      <h2 :class="$style.sectionTitle">{{ title }}</h2>
    </div>

    <div v-if="currentItem" :class="$style.heroSlider">
      <div :class="$style.heroViewport">
        <div :class="$style.heroTrack" :style="heroTrackStyle">
          <article
            v-for="(item, index) in items"
            :key="`${item.title}-${index}`"
            :class="$style.hero"
            :style="{
              width: `${100 / items.length}%`,
              backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('${item.image}')`,
            }"
            :data-slide-index="index"
          >
            <div :class="$style.container">
              <div :class="$style.heroContent">
                <h3 :class="$style.heroTitle">{{ item.title }}</h3>
                <p :class="$style.heroDescription">{{ item.description }}</p>
                <a
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  :class="$style.cta"
                >
                  {{ item.buttonText }}
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div :class="$style.container">
      <div :class="$style.controls">
        <button
          v-if="hasManySlides"
          type="button"
          :class="[$style.arrow, $style.prev]"
          aria-label="Предыдущий слайд"
          @click="goPrev"
        >
          &#10094;
        </button>

        <div :class="$style.thumbRow">
          <button
            v-for="{ item, index } in visibleThumbs"
            :key="`${item.title}-${index}`"
            type="button"
            :class="[$style.thumb, index === currentIndex ? $style.thumbActive : '']"
            :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('${item.image}')` }"
            :aria-label="`Показать предложение ${index + 1}`"
            @click="goTo(index)"
          >
            <span :class="$style.thumbTitle">{{ item.title }}</span>
          </button>
        </div>

        <button
          v-if="hasManySlides"
          type="button"
          :class="[$style.arrow, $style.next]"
          aria-label="Следующий слайд"
          @click="goNext"
        >
          &#10095;
        </button>
      </div>

      <div v-if="hasManySlides" :class="$style.dots">
        <button
          v-for="(_, index) in items"
          :key="`dot-${index}`"
          type="button"
          :class="[$style.dot, index === currentIndex ? $style.dotActive : '']"
          :aria-label="`Перейти к слайду ${index + 1}`"
          @click="goTo(index)"
        />
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  .restSection {
    width: 100%;
    max-width: 100%;
    padding: rem(100) 0;
    background: var(--a-whiteBg);

    /* Слайдер шире вьюпорта (трек в %) — не даём странице уехать вбок после подгрузки фонов */
    overflow-x: clip;
  }

  .container {
    width: min(#{rem(1220)}, calc(100% - var(--ds-space-600)));
    margin: 0 auto;
  }

  .sectionTitle {
    margin: 0 0 rem(34);
    text-align: center;
    text-transform: uppercase;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: rem(34);
    line-height: 1.1;
    color: var(--a-landing-ink);
  }

  .hero {
    box-sizing: border-box;
    flex: 0 0 auto;
    min-width: 0;
    min-height: rem(420);
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: flex-end;
    padding: rem(34) 0;
    overflow: hidden;
  }

  .heroSlider {
    position: relative;
    width: 100%;
    max-width: 100%;
    overflow-x: clip;
  }

  .heroViewport {
    width: 100%;
    max-width: 100%;
    overflow-x: clip;
    overflow-y: hidden;
  }

  .heroTrack {
    display: flex;
    min-width: 0;
    transition: transform 0.6s ease;
    will-change: transform;
  }

  .heroContent {
    max-width: min(#{rem(680)}, 100%);
    color: var(--a-white);
    overflow-wrap: break-word;
  }

  .heroTitle {
    margin: 0 0 rem(14);
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: rem(38);
    line-height: 1.1;
    text-transform: uppercase;
  }

  .heroDescription {
    margin: 0 0 rem(20);
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: rem(22);
    line-height: 1.35;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: rem(190);
    min-height: rem(52);
    padding: rem(10) var(--ds-space-300);
    border: rem(1) solid var(--a-white);
    color: var(--a-white);
    text-transform: lowercase;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: rem(22);
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background: var(--a-whiteBg);
      color: var(--a-landing-text);
    }
  }

  .controls {
    display: flex;
    align-items: center;
    gap: rem(12);
    margin-top: rem(20);
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .thumbRow {
    display: flex;
    align-items: stretch;
    gap: rem(14);
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .thumb {
    flex: 0 0 calc((100% - #{rem(42)}) / 4);
    min-height: rem(108);
    border: 0;
    position: relative;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    transition: transform 0.35s ease, opacity 0.35s ease;
    opacity: 0.82;
  }

  .thumbTitle {
    position: absolute;
    left: rem(10);
    right: rem(10);
    bottom: rem(10);
    text-align: left;
    color: var(--a-white);
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: rem(13);
    line-height: 1.2;
    text-transform: uppercase;
  }

  .thumbActive {
    outline: rem(2) solid var(--a-white);
    box-shadow: inset 0 0 0 rem(1) color-mix(in srgb, var(--a-white) 55%, transparent);
    transform: scale(1.02);
    opacity: 1;
  }

  .arrow {
    position: static;
    width: rem(36);
    height: rem(36);
    border: 0;
    border-radius: 50%;
    background: color-mix(in srgb, var(--ds-neutral-300) 82%, transparent);
    color: var(--a-white);
    font-size: rem(18);
    line-height: 1;
    cursor: pointer;
  }

  .prev {
    flex: 0 0 auto;
  }

  .next {
    flex: 0 0 auto;
  }

  .dots {
    display: flex;
    justify-content: center;
    gap: rem(10);
    margin-top: rem(14);
  }

  .dot {
    width: var(--ds-space-100);
    height: var(--ds-space-100);
    border: 0;
    border-radius: 50%;
    background: var(--a-landing-muted);
    padding: 0;
    cursor: pointer;
  }

  .dotActive {
    background: var(--a-landing-accent-deep);
  }

  @media (max-width: rem(1100)) {
    .restSection {
      padding: rem(76) 0;
    }

    .hero {
      min-height: rem(340);
    }

    .heroTitle {
      font-size: rem(30);
    }

    .heroDescription {
      font-size: rem(18);
    }

    .cta {
      min-height: rem(46);
      font-size: rem(18);
    }
  }

  @media (max-width: rem(700)) {
    .restSection {
      padding: var(--ds-space-600) 0;
    }

    .container {
      width: calc(100% - var(--ds-space-400));
    }

    .sectionTitle {
      font-size: rem(28);
      margin-bottom: rem(22);
    }

    .hero {
      min-height: rem(260);
      padding: rem(22) 0;
    }

    .heroTitle {
      font-size: rem(22);
    }

    .heroDescription {
      font-size: rem(15);
      margin-bottom: rem(14);
    }

    .cta {
      min-width: rem(148);
      min-height: var(--ds-space-500);
      font-size: rem(15);
    }

    .thumbRow {
      gap: rem(10);
    }

    .thumb {
      flex-basis: calc((100% - #{rem(10)}) / 2);
      min-height: rem(86);
    }

    .controls {
      gap: var(--ds-space-100);
      margin-top: rem(12);
    }

    .arrow {
      width: rem(30);
      height: rem(30);
      font-size: rem(16);
    }
  }
</style>
