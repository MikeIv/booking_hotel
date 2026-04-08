<script setup lang="ts">
  interface AdvantageItem {
    image: string;
    title: string;
    descriptionHtml: string;
  }

  interface Props {
    title: string;
    items: AdvantageItem[];
  }

  defineProps<Props>();
  const loadedImages = ref<Set<string>>(new Set());
  const failedImages = ref<Set<string>>(new Set());
  const FALLBACK_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='74' height='74' viewBox='0 0 74 74'%3E%3Ccircle cx='37' cy='37' r='37' fill='%23ececec'/%3E%3Cpath d='M22 47l10-10 7 7 13-13' stroke='%23909090' stroke-width='3' fill='none'/%3E%3Ccircle cx='27' cy='27' r='4' fill='%23909090'/%3E%3C/svg%3E";

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
</script>

<template>
  <section v-if="items.length" :class="$style.advantage">
    <div :class="$style.container">
      <h2 :class="$style.sectionTitle">{{ title }}</h2>
      <div :class="$style.grid">
        <article
          v-for="(item, index) in items"
          :key="`${item.title}-${index}`"
          :class="$style.card"
        >
          <div :class="$style.iconWrap">
            <div v-if="!isLoaded(item.image)" :class="$style.placeholder" />
            <img
              :src="item.image"
              alt=""
              :loading="index < 3 ? 'eager' : 'lazy'"
              :fetchpriority="index < 3 ? 'high' : 'auto'"
              decoding="async"
              @load="markLoaded(item.image)"
              @error="markFailed(item.image, $event)"
            >
          </div>
          <div :class="$style.cardText" v-html="item.descriptionHtml" />
        </article>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  .advantage {
    width: 100%;
    padding: 100px 0;
    background: #fff;
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

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 42px;
    row-gap: 34px;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .iconWrap {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: 74px;
    margin-bottom: 18px;

    img {
      width: 74px;
      height: 74px;
      object-fit: contain;
    }
  }

  .placeholder {
    width: 74px;
    height: 74px;
    border-radius: 50%;
    background: linear-gradient(90deg, #ececec 25%, #f7f7f7 37%, #ececec 63%);
    background-size: 400% 100%;
    animation: shimmer 1.2s ease infinite;
  }

  .cardTitle {
    margin: 0 0 12px;
    text-align: center;
    text-transform: uppercase;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: 18px;
    line-height: 1.2;
    color: #0b0f1b;
  }

  .cardText {
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 16px;
    line-height: 1.35;
    color: #121212;
    text-align: left;

    :global(p) {
      margin: 0 0 10px;
    }

    :global(a) {
      color: inherit;
      text-decoration: underline;
    }
  }

  @media (max-width: 1100px) {
    .advantage {
      padding: 76px 0;
    }

    .sectionTitle {
      font-size: 30px;
    }

    .cardText {
      font-size: 15px;
    }
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 700px) {
    .advantage {
      padding: 48px 0;
    }

    .container {
      width: calc(100% - 32px);
    }

    .grid {
      grid-template-columns: 1fr;
      row-gap: 26px;
    }

    .card {
      align-items: center;
      text-align: center;
    }

    .iconWrap {
      justify-content: center;
    }

    .sectionTitle {
      font-size: 28px;
      margin-bottom: 20px;
    }

    .cardText {
      font-size: 15px;
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

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
</style>
