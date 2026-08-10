<script setup lang="ts">
  interface AdvantageItem {
    image?: string;
    title?: string;
    descriptionHtml: string;
  }

  interface Props {
    title: string;
    items: AdvantageItem[];
  }

  defineProps<Props>();

  const LOCAL_ICONS = [
    "/images/ukraina/advantage/1.png",
    "/images/ukraina/advantage/2.png",
    "/images/ukraina/advantage/3.png",
    "/images/ukraina/advantage/4.png",
    "/images/ukraina/advantage/5.png",
    "/images/ukraina/advantage/6.png",
  ] as const;
</script>

<template>
  <section v-if="items.length" :class="$style.advantage">
    <div :class="$style.container">
      <h2 :class="$style.sectionTitle">{{ title }}</h2>
      <div :class="$style.grid">
        <article
          v-for="(item, index) in items"
          :key="`${index}-${item.descriptionHtml.slice(0, 24)}`"
          :class="$style.card"
        >
          <div :class="$style.iconWrap">
            <img
              :src="LOCAL_ICONS[index] ?? item.image ?? ''"
              alt=""
              loading="lazy"
              decoding="async"
              :class="$style.icon"
            >
          </div>
          <h4 v-if="item.title" :class="$style.cardTitle">{{ item.title }}</h4>
          <div :class="$style.cardText" v-html="item.descriptionHtml" />
        </article>
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .advantage {
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 0;
    row-gap: 0;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 0 rem(30);
    margin: 0 0 rem(60);
  }

  .iconWrap {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: rem(74);
    margin-bottom: rem(18);
  }

  .icon {
    display: block;
    width: auto;
    height: auto;
    max-width: rem(74);
    max-height: rem(74);
    object-fit: contain;
  }

  .cardTitle {
    margin: 0 0 rem(24);
    padding: 0;
    color: var(--a-landing-ink);
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: rem(18);
    font-weight: 600;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .cardText {
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: rem(16);
    line-height: 1.4;
    color: var(--a-landing-text);
    text-align: left;

    :global(p) {
      margin: 0;
    }

    :global(a) {
      color: inherit;
      text-decoration: underline;
    }
  }

  @media (max-width: #{size.$desktopMin}) {
    .card {
      padding: 0 var(--ds-space-200);
      margin-bottom: var(--ds-space-500);
    }
  }

  @media (max-width: #{rem(1100)}) {
    .advantage {
      padding: rem(76) 0;
    }

    .sectionTitle {
      font-size: rem(30);
    }

    .cardText {
      font-size: rem(15);
    }
  }

  @media (max-width: #{rem(900)}) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: #{size.$tablet}) {
    .advantage {
      padding: var(--ds-space-600) 0;
    }

    .container {
      width: calc(100% - var(--ds-space-400));
    }

    .grid {
      grid-template-columns: 1fr;
      row-gap: rem(26);
    }

    .card {
      align-items: center;
      text-align: center;
    }

    .iconWrap {
      justify-content: center;
    }

    .sectionTitle {
      font-size: rem(28);
      margin-bottom: var(--ds-space-200);
    }

    .cardText {
      font-size: rem(15);
      text-align: center;
    }

    .cardTitle {
      text-align: center;
    }
  }
</style>
