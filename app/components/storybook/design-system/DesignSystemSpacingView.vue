<script setup lang="ts">
  type SpacingToken = {
    name: string;
    token: string;
    px: number;
    usage: string;
  };

  const spacingTokens: SpacingToken[] = [
    { name: "space/0", token: "--ds-space-0", px: 0, usage: "сброс отступов" },
    { name: "space/025", token: "--ds-space-025", px: 4, usage: "микро-коррекция (редко)" },
    { name: "space/100", token: "--ds-space-100", px: 8, usage: "базовый шаг, плотные группы" },
    { name: "space/200", token: "--ds-space-200", px: 16, usage: "внутренние отступы карточек/форм" },
    { name: "space/300", token: "--ds-space-300", px: 24, usage: "базовый padding контейнеров" },
    { name: "space/400", token: "--ds-space-400", px: 32, usage: "разделение крупных блоков" },
    { name: "space/500", token: "--ds-space-500", px: 40, usage: "межсекционные интервалы" },
    { name: "space/600", token: "--ds-space-600", px: 48, usage: "межсекционные интервалы" },
    { name: "space/700", token: "--ds-space-700", px: 56, usage: "большие экраны / hero" },
    { name: "space/800", token: "--ds-space-800", px: 64, usage: "большие экраны / hero" },
    { name: "space/900", token: "--ds-space-900", px: 80, usage: "крупные отступы layout" },
    { name: "space/1000", token: "--ds-space-1000", px: 96, usage: "крупные отступы layout" },
  ];
</script>

<template>
  <div :class="$style.root">
    <header :class="$style.header">
      <h1 :class="$style.title">Grid & Spacing</h1>
      <p :class="$style.lead">
        Токены синхронизированы с Figma (`Booking / Spacing`) и используются для
        постепенной миграции компонентов на шаг 8px.
      </p>
    </header>

    <ul :class="$style.list">
      <li
        v-for="token in spacingTokens"
        :key="token.token"
        :class="$style.item"
      >
        <div :class="$style.meta">
          <span :class="$style.name">{{ token.name }}</span>
          <code :class="$style.code">{{ token.token }}</code>
          <span :class="$style.usage">{{ token.usage }}</span>
        </div>

        <div :class="$style.preview">
          <div
            :class="$style.bar"
            :style="{ width: token.px ? `${token.px * 2}px` : '0px' }"
          />
          <span :class="$style.value">{{ token.px }}px</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .root {
    max-width: rem(920);
    padding: rem(24);
    margin: 0 auto;
    color: var(--a-text-dark);
    background: var(--a-whiteBg);
  }

  .header {
    margin-bottom: var(--a-space-4);
  }

  .title {
    margin: 0 0 var(--a-space-1);
    font-family: var(--a-font-heading);
    font-size: var(--ds-typo-size-h2);
    line-height: var(--ds-typo-line-h2);
    color: var(--a-text-primary);
  }

  .lead {
    margin: 0;
    font-size: var(--ds-typo-size-body-md);
    line-height: var(--ds-typo-line-body-md);
    color: var(--a-text-light);
  }

  .list {
    padding: 0;
    margin: 0;
    list-style: none;
    border: rem(1) solid var(--a-border);
    border-radius: var(--a-borderR--x10);
    overflow: hidden;
  }

  .item {
    display: grid;
    grid-template-columns: 1fr rem(280);
    gap: var(--a-space-3);
    align-items: center;
    padding: var(--a-space-2);
    border-bottom: rem(1) solid var(--a-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .meta {
    display: grid;
    gap: var(--a-space-1);
  }

  .name {
    font-size: var(--ds-typo-size-body-md);
    font-weight: 600;
    color: var(--a-text-primary);
  }

  .code {
    font-size: var(--ds-typo-size-caption);
    color: var(--a-text-light);
  }

  .usage {
    font-size: var(--ds-typo-size-body-sm);
    line-height: var(--ds-typo-line-body-sm);
    color: var(--a-text-light);
  }

  .preview {
    display: flex;
    gap: var(--a-space-2);
    align-items: center;
    justify-content: flex-end;
  }

  .bar {
    height: rem(12);
    background: var(--a-primaryBg);
    border-radius: var(--a-borderR--x8);
  }

  .value {
    min-width: rem(46);
    font-size: var(--ds-typo-size-body-sm);
    color: var(--a-text-primary);
    text-align: right;
  }
</style>
