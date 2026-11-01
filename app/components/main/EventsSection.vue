<script setup lang="ts">
  interface EventItem {
    title: string;
    detailsHtml: string;
    image: string;
    link: string;
    buttonText: string;
  }

  interface Props {
    title: string;
    items: EventItem[];
  }

  const props = defineProps<Props>();

  const currentIndex = ref(0);
  const viewportWidth = ref(1440);
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  const visibleCount = computed(() => {
    if (viewportWidth.value < 700) return 1;
    if (viewportWidth.value < 1100) return 2;
    return 4;
  });

  const hasManySlides = computed(() => props.items.length > visibleCount.value);

  const visibleItems = computed(() => {
    if (!props.items.length) return [] as Array<{ item: EventItem; index: number }>;
    const count = Math.min(visibleCount.value, props.items.length);
    const result: Array<{ item: EventItem; index: number }> = [];

    for (let offset = 0; offset < count; offset += 1) {
      const index = (currentIndex.value + offset) % props.items.length;
      result.push({ item: props.items[index], index });
    }

    return result;
  });

  const goTo = (index: number) => {
    if (!props.items.length) return;
    currentIndex.value = (index + props.items.length) % props.items.length;
  };

  const goPrev = () => goTo(currentIndex.value - 1);
  const goNext = () => goTo(currentIndex.value + 1);

  const syncViewport = () => {
    viewportWidth.value = window.innerWidth;
  };

  const syncViewportThrottled = () => {
    if (resizeTimer) return;
    resizeTimer = setTimeout(() => {
      syncViewport();
      resizeTimer = null;
    }, 150);
  };

  onMounted(() => {
    syncViewport();
    window.addEventListener("resize", syncViewportThrottled, { passive: true });
  });

  onUnmounted(() => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }
    window.removeEventListener("resize", syncViewportThrottled);
  });
</script>

<template>
  <section v-if="items.length" :class="$style.eventsSection">
    <div :class="$style.container">
      <h2 :class="$style.sectionTitle">{{ title }}</h2>
    </div>

    <div :class="$style.sliderWrap">
      <button
        v-if="hasManySlides"
        type="button"
        :class="[$style.arrow, $style.prev]"
        aria-label="Предыдущий слайд"
        @click="goPrev"
      >
        &#10094;
      </button>

      <div :class="$style.container">
        <div :class="$style.row">
          <article
            v-for="{ item, index } in visibleItems"
            :key="`${item.title}-${index}`"
            :class="$style.card"
            :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('${item.image}')` }"
          >
            <a
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              :class="$style.cardLink"
            >
              <h3 :class="$style.cardTitle">{{ item.title }}</h3>
              <div :class="$style.cardText" v-html="item.detailsHtml" />
              <span :class="$style.cardButton">{{ item.buttonText }}</span>
            </a>
          </article>
        </div>
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
  </section>
</template>

<style module lang="scss">
  .eventsSection {
    width: 100%;
    padding: rem(100) 0;
    background: var(--a-landing-surface-muted);
  }

  .container {
    width: min(#{rem(1220)}, calc(100% - var(--ds-space-600)));
    margin: 0 auto;
  }

  .sectionTitle {
    margin: 0 0 var(--ds-space-400);
    text-align: center;
    text-transform: uppercase;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: rem(34);
    line-height: 1.1;
    color: var(--a-landing-ink);
  }

  .sliderWrap {
    position: relative;
    width: min(#{rem(1220)}, calc(100% - var(--ds-space-600)));
    margin: 0 auto;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--ds-space-200);
  }

  .card {
    min-height: rem(300);
    background-size: cover;
    background-position: center;
  }

  .cardLink {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: rem(22) rem(18);
    color: var(--a-white);
  }

  .cardTitle {
    margin: 0;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: rem(15);
    line-height: 1.15;
    text-transform: uppercase;
  }

  .cardText {
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: rem(13);
    line-height: 1.3;
    margin-top: var(--ds-space-100);

    :global(p) {
      margin: 0 0 var(--ds-space-025);
    }
  }

  .cardButton {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    align-self: flex-start;
    min-width: rem(110);
    min-height: rem(34);
    border: rem(1) solid color-mix(in srgb, var(--a-white) 88%, transparent);
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: rem(12);
    text-transform: lowercase;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    width: rem(34);
    height: rem(34);
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--a-landing-accent);
    font-size: rem(34);
    line-height: 1;
    cursor: pointer;
  }

  .prev {
    left: rem(-28);
  }

  .next {
    right: rem(-28);
  }

  @media (max-width: rem(1100)) {
    .eventsSection {
      padding: rem(76) 0;
    }

    .sectionTitle {
      font-size: rem(30);
    }

    .row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .sliderWrap {
      width: min(#{rem(1220)}, calc(100% - var(--ds-space-800)));
    }
  }

  @media (max-width: rem(700)) {
    .eventsSection {
      padding: var(--ds-space-600) 0;
    }

    .sectionTitle {
      font-size: rem(28);
      margin-bottom: rem(22);
    }

    .sliderWrap {
      width: calc(100% - var(--ds-space-400));
    }

    .row {
      grid-template-columns: 1fr;
    }

    .card {
      min-height: rem(260);
    }

    .arrow {
      width: rem(30);
      height: rem(30);
      font-size: rem(28);
    }

    .prev {
      left: rem(-12);
    }

    .next {
      right: rem(-12);
    }
  }
</style>
