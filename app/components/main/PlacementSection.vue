<script setup lang="ts">
  interface PlacementItem {
    title: string;
    detailsHtml: string;
    image: string;
    link: string;
    buttonText: string;
  }

  interface Props {
    title: string;
    items: PlacementItem[];
  }

  const props = defineProps<Props>();

  const initialVisibleCount = 4;
  const expanded = ref(false);

  const visibleItems = computed(() => {
    if (expanded.value) return props.items;
    return props.items.slice(0, initialVisibleCount);
  });

  const canShowMore = computed(() => props.items.length > initialVisibleCount);

  const revealAll = () => {
    expanded.value = true;
  };
</script>

<template>
  <section v-if="items.length" :class="$style.placementSection">
    <div :class="$style.container">
      <h2 :class="$style.sectionTitle">{{ title }}</h2>
    </div>

    <div :class="$style.container">
      <div :class="$style.grid">
        <article
          v-for="(item, index) in visibleItems"
          :key="`${item.title}-${index}`"
          :class="$style.card"
          :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), url('${item.image}')` }"
        >
          <div :class="$style.cardContent">
            <h3 :class="$style.cardTitle">{{ item.title }}</h3>
            <div :class="$style.cardDetails" v-html="item.detailsHtml" />
            <a
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              :class="$style.cardButton"
            >
              {{ item.buttonText }}
            </a>
          </div>
        </article>
      </div>

      <div v-if="canShowMore && !expanded" :class="$style.showMoreWrap">
        <button type="button" :class="$style.showMore" @click="revealAll">
          Показать ещё
        </button>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  .placementSection {
    width: 100%;
    padding: rem(100) 0;
    background: var(--a-whiteBg);
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

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: rem(20);
  }

  .card {
    min-height: rem(280);
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: stretch;
  }

  .cardContent {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    padding: rem(30) var(--ds-space-300) rem(22);
    color: var(--a-white);
  }

  .cardTitle {
    margin: 0 0 rem(14);
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: rem(18);
    line-height: 1.2;
    text-transform: uppercase;
  }

  .cardDetails {
    margin-bottom: rem(22);
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: rem(15);
    line-height: 1.3;

    :global(p) {
      margin: 0 0 var(--ds-space-025);
    }
  }

  .cardButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    min-width: rem(170);
    min-height: rem(38);
    padding: 0 rem(18);
    border: rem(1) solid color-mix(in srgb, var(--a-white) 85%, transparent);
    color: var(--a-white);
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: rem(14);
    text-transform: lowercase;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background: var(--a-whiteBg);
      color: var(--a-landing-text);
    }
  }

  .showMoreWrap {
    display: flex;
    justify-content: center;
    margin-top: rem(22);
  }

  .showMore {
    border: 0;
    background: transparent;
    color: var(--a-landing-text-soft);
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: rem(22);
    cursor: pointer;
  }

  @media (max-width: rem(1100)) {
    .placementSection {
      padding: rem(76) 0;
    }

    .card {
      min-height: rem(240);
    }

    .cardTitle {
      font-size: rem(17);
    }

    .cardDetails {
      font-size: rem(14);
    }
  }

  @media (max-width: rem(700)) {
    .placementSection {
      padding: var(--ds-space-600) 0;
    }

    .container {
      width: calc(100% - var(--ds-space-400));
    }

    .sectionTitle {
      font-size: rem(28);
      margin-bottom: rem(22);
    }

    .grid {
      grid-template-columns: 1fr;
      gap: var(--ds-space-200);
    }

    .card {
      min-height: rem(250);
    }

    .cardContent {
      padding: rem(20) rem(18);
    }

    .cardTitle {
      font-size: rem(18);
    }

    .cardDetails {
      font-size: rem(14);
      margin-bottom: var(--ds-space-200);
    }

    .cardButton {
      min-width: rem(136);
      min-height: rem(36);
      font-size: rem(13);
    }

    .showMore {
      font-size: rem(20);
    }
  }
</style>
