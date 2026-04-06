<script setup lang="ts">
  type ColorItem = { name: string; token: string };
  type ShadowItem = { name: string; token: string };
  type Section =
    | { title: string; kind: "colors"; items: ColorItem[] }
    | { title: string; kind: "shadows"; items: ShadowItem[] };

  /** Синхронизируйте с `app/assets/styles/variables/_colors.scss`. */
  const sections: Section[] = [
    {
      title: "Семантика и палитра",
      kind: "colors",
      items: [
        { name: "primary", token: "--primary" },
        { name: "secondary", token: "--secondary" },
        { name: "success", token: "--success" },
        { name: "info", token: "--info" },
        { name: "ui-bgAccent", token: "--ui-bgAccent" },
        { name: "ui-bgDark", token: "--ui-bgDark" },
      ],
    },
    {
      title: "Шкала primary / secondary / accent",
      kind: "colors",
      items: [
        { name: "ui-color-primary-50", token: "--ui-color-primary-50" },
        { name: "ui-color-primary-100", token: "--ui-color-primary-100" },
        { name: "ui-color-primary-300", token: "--ui-color-primary-300" },
        { name: "ui-color-primary-600", token: "--ui-color-primary-600" },
        { name: "ui-color-primary-700", token: "--ui-color-primary-700" },
        { name: "ui-color-secondary-50", token: "--ui-color-secondary-50" },
        { name: "ui-color-secondary-200", token: "--ui-color-secondary-200" },
        { name: "ui-color-secondary-300", token: "--ui-color-secondary-300" },
        { name: "ui-color-secondary-500", token: "--ui-color-secondary-500" },
        { name: "ui-color-secondary-950", token: "--ui-color-secondary-950" },
        { name: "ui-color-accent-a30", token: "--ui-color-accent-a30" },
      ],
    },
    {
      title: "Базовые",
      kind: "colors",
      items: [
        { name: "a-white", token: "--a-white" },
        { name: "a-black", token: "--a-black" },
        { name: "a-base", token: "--a-base" },
        { name: "a-primary (alias)", token: "--a-primary" },
      ],
    },
    {
      title: "Текст",
      kind: "colors",
      items: [
        { name: "a-text-white", token: "--a-text-white" },
        { name: "a-text-primary", token: "--a-text-primary" },
        { name: "a-text-light", token: "--a-text-light" },
        { name: "a-text-dark", token: "--a-text-dark" },
        { name: "a-text-accent", token: "--a-text-accent" },
        { name: "a-text-error", token: "--a-text-error" },
      ],
    },
    {
      title: "Фоны",
      kind: "colors",
      items: [
        { name: "a-whiteBg", token: "--a-whiteBg" },
        { name: "a-blackBg", token: "--a-blackBg" },
        { name: "a-mainBg", token: "--a-mainBg" },
        { name: "a-primaryBg", token: "--a-primaryBg" },
        { name: "a-lightBg", token: "--a-lightBg" },
        { name: "a-lightPrimaryBg", token: "--a-lightPrimaryBg" },
        { name: "a-accentBg", token: "--a-accentBg" },
        { name: "a-accentLightBg", token: "--a-accentLightBg" },
        { name: "a-accentDarkBg", token: "--a-accentDarkBg" },
        { name: "a-btnAccentBg", token: "--a-btnAccentBg" },
      ],
    },
    {
      title: "Фоны баннеров",
      kind: "colors",
      items: [
        { name: "a-banner-alert-bg", token: "--a-banner-alert-bg" },
        { name: "a-banner-info-bg", token: "--a-banner-info-bg" },
        { name: "a-banner-warning-bg", token: "--a-banner-warning-bg" },
      ],
    },
    {
      title: "Границы",
      kind: "colors",
      items: [
        { name: "a-border", token: "--a-border" },
        { name: "a-border-white", token: "--a-border-white" },
        { name: "a-border-primary", token: "--a-border-primary" },
        { name: "a-border-primary-accent", token: "--a-border-primary-accent" },
        { name: "a-border-dark", token: "--a-border-dark" },
        { name: "a-border-light", token: "--a-border-light" },
        { name: "a-border-accent", token: "--a-border-accent" },
      ],
    },
    {
      title: "Серые вспомогательные",
      kind: "colors",
      items: [
        { name: "a-gray-50", token: "--a-gray-50" },
        { name: "a-gray-200", token: "--a-gray-200" },
        { name: "a-gray-300", token: "--a-gray-300" },
      ],
    },
    {
      title: "Прочее (PrimeVue toast)",
      kind: "colors",
      items: [{ name: "p-toast-warn-border-color", token: "--p-toast-warn-border-color" }],
    },
    {
      title: "Тени (цвет и готовые пресеты)",
      kind: "shadows",
      items: [
        { name: "a-shadow-color", token: "--a-shadow-color" },
        { name: "a-shadow-color-strong", token: "--a-shadow-color-strong" },
        { name: "a-shadow-card", token: "--a-shadow-card" },
        { name: "a-shadow-summary", token: "--a-shadow-summary" },
        { name: "a-shadow-summary-inner", token: "--a-shadow-summary-inner" },
        { name: "a-shadow-weekday", token: "--a-shadow-weekday" },
      ],
    },
  ];
</script>

<template>
  <div :class="$style.root">
    <header :class="$style.header">
      <h1 :class="$style.title">Цвета</h1>
      <p :class="$style.lead">
        CSS-переменные из <code>_colors.scss</code> (и связанные токены теней). Образцы читают
        значение через <code>var(--token)</code>.
      </p>
    </header>

    <section
      v-for="(block, i) in sections"
      :key="i"
      :class="$style.section"
    >
      <h2 :class="$style.sectionTitle">{{ block.title }}</h2>

      <ul
        v-if="block.kind === 'colors'"
        :class="$style.grid"
      >
        <li
          v-for="item in block.items"
          :key="item.token"
          :class="$style.card"
        >
          <div
            :class="$style.swatch"
            :style="{ background: `var(${item.token})` }"
          />
          <div :class="$style.meta">
            <span :class="$style.name">{{ item.name }}</span>
            <code :class="$style.code">{{ item.token }}</code>
          </div>
        </li>
      </ul>

      <ul
        v-else
        :class="$style.grid"
      >
        <li
          v-for="item in block.items"
          :key="item.token"
          :class="$style.card"
        >
          <div
            v-if="item.token.includes('shadow-color')"
            :class="$style.swatch"
            :style="{ background: `var(${item.token})` }"
          />
          <div
            v-else
            :class="$style.shadowDemo"
            :style="{ boxShadow: `var(${item.token})` }"
          />
          <div :class="$style.meta">
            <span :class="$style.name">{{ item.name }}</span>
            <code :class="$style.code">{{ item.token }}</code>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .root {
    max-width: rem(960);
    padding: rem(24);
    margin: 0 auto;
    font-family: var(--a-font-body);
    color: var(--a-text-dark);
    background: var(--a-whiteBg);
  }

  .header {
    margin-bottom: rem(32);
  }

  .title {
    margin: 0 0 rem(8);
    font-family: var(--a-font-heading);
    font-size: rem(32);
    font-weight: 600;
    color: var(--a-text-primary);
  }

  .lead {
    margin: 0;
    font-size: rem(16);
    line-height: 1.5;
    color: var(--a-text-light);

    code {
      padding: rem(2) rem(6);
      font-size: rem(14);
      background: var(--a-mainBg);
      border-radius: rem(4);
    }
  }

  .section {
    margin-bottom: rem(40);
  }

  .sectionTitle {
    margin: 0 0 rem(16);
    font-family: var(--a-font-heading);
    font-size: rem(22);
    font-weight: 600;
    color: var(--a-text-primary);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(rem(200), 1fr));
    gap: rem(16);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .card {
    overflow: hidden;
    border: rem(1) solid var(--a-border);
    border-radius: var(--a-borderR--x10);
  }

  .swatch {
    height: rem(72);
    border-bottom: rem(1) solid var(--a-border);
  }

  .shadowDemo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: rem(72);
    background: var(--a-whiteBg);
    border-bottom: rem(1) solid var(--a-border);
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: rem(4);
    padding: rem(10) rem(12);
    background: var(--a-whiteBg);
  }

  .name {
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-dark);
  }

  .code {
    font-size: rem(12);
    color: var(--a-text-light);
    word-break: break-all;
  }
</style>
