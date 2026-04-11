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
    padding: 100px 0;
    background: #fff;
    /* Слайдер шире вьюпорта (трек в %) — не даём странице уехать вбок после подгрузки фонов */
    overflow-x: clip;
  }

  .container {
    width: min(1220px, calc(100% - 48px));
    margin: 0 auto;
  }

  .sectionTitle {
    margin: 0 0 34px;
    text-align: center;
    text-transform: uppercase;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: 34px;
    line-height: 1.1;
    color: #0b0f1b;
  }

  .hero {
    box-sizing: border-box;
    flex: 0 0 auto;
    min-width: 0;
    min-height: 420px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: flex-end;
    padding: 34px 0;
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
    max-width: min(680px, 100%);
    color: #fff;
    overflow-wrap: break-word;
  }

  .heroTitle {
    margin: 0 0 14px;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: 38px;
    line-height: 1.1;
    text-transform: uppercase;
  }

  .heroDescription {
    margin: 0 0 20px;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 22px;
    line-height: 1.35;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 190px;
    min-height: 52px;
    padding: 10px 24px;
    border: 1px solid #fff;
    color: #fff;
    text-transform: lowercase;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 22px;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background: #fff;
      color: #111;
    }
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .thumbRow {
    display: flex;
    align-items: stretch;
    gap: 14px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .thumb {
    flex: 0 0 calc((100% - 42px) / 4);
    min-height: 108px;
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
    left: 10px;
    right: 10px;
    bottom: 10px;
    text-align: left;
    color: #fff;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: 13px;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .thumbActive {
    outline: 2px solid #fff;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 55%);
    transform: scale(1.02);
    opacity: 1;
  }

  .arrow {
    position: static;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 50%;
    background: rgb(185 185 185 / 82%);
    color: #fff;
    font-size: 18px;
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
    gap: 10px;
    margin-top: 14px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border: 0;
    border-radius: 50%;
    background: #c8c8c8;
    padding: 0;
    cursor: pointer;
  }

  .dotActive {
    background: #7a2a2a;
  }

  @media (max-width: 1100px) {
    .restSection {
      padding: 76px 0;
    }

    .hero {
      min-height: 340px;
    }

    .heroTitle {
      font-size: 30px;
    }

    .heroDescription {
      font-size: 18px;
    }

    .cta {
      min-height: 46px;
      font-size: 18px;
    }
  }

  @media (max-width: 700px) {
    .restSection {
      padding: 48px 0;
    }

    .container {
      width: calc(100% - 32px);
    }

    .sectionTitle {
      font-size: 28px;
      margin-bottom: 22px;
    }

    .hero {
      min-height: 260px;
      padding: 22px 0;
    }

    .heroTitle {
      font-size: 22px;
    }

    .heroDescription {
      font-size: 15px;
      margin-bottom: 14px;
    }

    .cta {
      min-width: 148px;
      min-height: 40px;
      font-size: 15px;
    }

    .thumbRow {
      gap: 10px;
    }

    .thumb {
      flex-basis: calc((100% - 10px) / 2);
      min-height: 86px;
    }

    .controls {
      gap: 8px;
      margin-top: 12px;
    }

    .arrow {
      width: 30px;
      height: 30px;
      font-size: 16px;
    }
  }
</style>
