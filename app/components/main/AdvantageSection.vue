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
    padding: 0 30px;
    margin: 0 0 60px;
  }

  .iconWrap {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: 74px;
    margin-bottom: 18px;
  }

  .icon {
    display: block;
    width: auto;
    height: auto;
    max-width: 74px;
    max-height: 74px;
    object-fit: contain;
  }

  .cardTitle {
    margin: 0 0 25px;
    padding: 0;
    color: var(--a-landing-ink);
    font-family: GothaProBol, Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .cardText {
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-size: 16px;
    line-height: 1.4;
    color: #121212;
    text-align: left;

    :global(p) {
      margin: 0;
    }

    :global(a) {
      color: inherit;
      text-decoration: underline;
    }
  }

  @media (max-width: 1024px) {
    .card {
      padding: 0 20px;
      margin-bottom: 40px;
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

  @media (max-width: 768px) {
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
      text-align: center;
    }

    .cardTitle {
      text-align: center;
    }
  }

</style>
