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
    padding: 100px 0;
    background: #efefef;
  }

  .container {
    width: min(1220px, calc(100% - 48px));
    margin: 0 auto;
  }

  .sectionTitle {
    margin: 0 0 32px;
    text-align: center;
    text-transform: uppercase;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: 34px;
    line-height: 1.1;
    color: #0b0f1b;
  }

  .sliderWrap {
    position: relative;
    width: min(1220px, calc(100% - 48px));
    margin: 0 auto;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .card {
    min-height: 300px;
    background-size: cover;
    background-position: center;
  }

  .cardLink {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 22px 18px;
    color: #fff;
  }

  .cardTitle {
    margin: 0;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: 15px;
    line-height: 1.15;
    text-transform: uppercase;
  }

  .cardText {
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 13px;
    line-height: 1.3;
    margin-top: 8px;

    :global(p) {
      margin: 0 0 4px;
    }
  }

  .cardButton {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    align-self: flex-start;
    min-width: 110px;
    min-height: 34px;
    border: 1px solid rgb(255 255 255 / 88%);
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 12px;
    text-transform: lowercase;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 3;
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #8f2727;
    font-size: 34px;
    line-height: 1;
    cursor: pointer;
  }

  .prev {
    left: -28px;
  }

  .next {
    right: -28px;
  }

  @media (max-width: 1100px) {
    .eventsSection {
      padding: 76px 0;
    }

    .sectionTitle {
      font-size: 30px;
    }

    .row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .sliderWrap {
      width: min(1220px, calc(100% - 64px));
    }
  }

  @media (max-width: 700px) {
    .eventsSection {
      padding: 48px 0;
    }

    .sectionTitle {
      font-size: 28px;
      margin-bottom: 22px;
    }

    .sliderWrap {
      width: calc(100% - 32px);
    }

    .row {
      grid-template-columns: 1fr;
    }

    .card {
      min-height: 260px;
    }

    .arrow {
      width: 30px;
      height: 30px;
      font-size: 28px;
    }

    .prev {
      left: -12px;
    }

    .next {
      right: -12px;
    }
  }
</style>
