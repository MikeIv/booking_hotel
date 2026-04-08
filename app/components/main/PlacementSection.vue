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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .card {
    min-height: 280px;
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
    padding: 30px 24px 22px;
    color: #fff;
  }

  .cardTitle {
    margin: 0 0 14px;
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: 18px;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .cardDetails {
    margin-bottom: 22px;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 15px;
    line-height: 1.3;

    :global(p) {
      margin: 0 0 4px;
    }
  }

  .cardButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    min-width: 170px;
    min-height: 38px;
    padding: 0 18px;
    border: 1px solid rgb(255 255 255 / 85%);
    color: #fff;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 14px;
    text-transform: lowercase;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background: #fff;
      color: #111;
    }
  }

  .showMoreWrap {
    display: flex;
    justify-content: center;
    margin-top: 22px;
  }

  .showMore {
    border: 0;
    background: transparent;
    color: #1a1a1a;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 22px;
    cursor: pointer;
  }

  @media (max-width: 1100px) {
    .placementSection {
      padding: 76px 0;
    }

    .card {
      min-height: 240px;
    }

    .cardTitle {
      font-size: 17px;
    }

    .cardDetails {
      font-size: 14px;
    }
  }

  @media (max-width: 700px) {
    .placementSection {
      padding: 48px 0;
    }

    .container {
      width: calc(100% - 32px);
    }

    .sectionTitle {
      font-size: 28px;
      margin-bottom: 22px;
    }

    .grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .card {
      min-height: 250px;
    }

    .cardContent {
      padding: 20px 18px;
    }

    .cardTitle {
      font-size: 18px;
    }

    .cardDetails {
      font-size: 14px;
      margin-bottom: 16px;
    }

    .cardButton {
      min-width: 136px;
      min-height: 36px;
      font-size: 13px;
    }

    .showMore {
      font-size: 20px;
    }
  }
</style>
