<script setup lang="ts">
  type ShadowToken = {
    name: string;
    token: string;
    css: string;
    usage: string;
  };

  type MappingItem = {
    style: string;
    projectToken: string;
    note: string;
  };

  const shadowTokens: ShadowToken[] = [
    {
      name: "shadow-sm",
      token: "--ds-shadow-sm",
      css: "0 0 10px rgba(0, 0, 0, 0.1)",
      usage: "базовые карточки и popover",
    },
    {
      name: "shadow-inner",
      token: "--ds-shadow-inner",
      css: "0 0 10px rgba(0, 0, 0, 0.1)",
      usage: "внутренние summary-блоки",
    },
    {
      name: "shadow-md",
      token: "--ds-shadow-md",
      css: "4px 4px 30px -10px rgba(0, 0, 0, 0.1)",
      usage: "summary и выделенные блоки",
    },
    {
      name: "shadow-lg",
      token: "--ds-shadow-lg",
      css: "4px 4px 102px -10px rgba(0, 0, 0, 0.1)",
      usage: "крупные акцентные контейнеры",
    },
  ];

  const mapping: MappingItem[] = [
    { style: "shadow-sm", projectToken: "--a-shadow-card", note: "legacy alias" },
    { style: "shadow-inner", projectToken: "--a-shadow-summary-inner", note: "legacy alias" },
    { style: "shadow-md", projectToken: "--a-shadow-summary", note: "legacy alias" },
    { style: "shadow-lg", projectToken: "--a-shadow-weekday", note: "legacy alias" },
  ];
</script>

<template>
  <div :class="$style.root">
    <header :class="$style.header">
      <h1 :class="$style.title">Shadows</h1>
      <p :class="$style.lead">
        Синхронизировано с Figma (`Design system / 1.5 Тени`). Для scale используются только
        <code>shadow-sm</code>, <code>shadow-md</code>, <code>shadow-lg</code>.
      </p>
    </header>

    <section :class="$style.section">
      <h2 :class="$style.sectionTitle">Токены</h2>
      <ul :class="$style.list">
        <li
          v-for="token in shadowTokens"
          :key="token.token"
          :class="$style.item"
        >
          <div :class="$style.meta">
            <span :class="$style.name">{{ token.name }}</span>
            <code :class="$style.code">{{ token.token }}</code>
            <span :class="$style.usage">{{ token.usage }}</span>
            <span :class="$style.cssValue">{{ token.css }}</span>
          </div>

          <div :class="$style.preview">
            <div
              :class="$style.shadowBox"
              :style="{ boxShadow: `var(${token.token})` }"
            />
          </div>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.sectionTitle">Соответствие проектным алиасам</h2>
      <ul :class="$style.mapping">
        <li
          v-for="item in mapping"
          :key="item.projectToken"
          :class="$style.mappingItem"
        >
          <strong>{{ item.style }}</strong>
          <code>{{ item.projectToken }}</code>
          <span>{{ item.note }}</span>
        </li>
      </ul>
    </section>
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

  .section {
    margin-bottom: var(--a-space-4);
  }

  .sectionTitle {
    margin: 0 0 var(--a-space-2);
    font-size: var(--ds-typo-size-body-lg);
    line-height: var(--ds-typo-line-body-lg);
    color: var(--a-text-primary);
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

  .code,
  .usage,
  .cssValue {
    font-size: var(--ds-typo-size-body-sm);
    color: var(--a-text-light);
  }

  .preview {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .shadowBox {
    width: rem(180);
    height: rem(92);
    background: var(--a-whiteBg);
    border: rem(1) solid var(--a-border);
    border-radius: var(--a-borderR--x10);
  }

  .mapping {
    display: grid;
    gap: var(--a-space-2);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .mappingItem {
    display: grid;
    grid-template-columns: rem(110) rem(220) 1fr;
    gap: var(--a-space-2);
    align-items: center;
    padding: var(--a-space-2);
    border: rem(1) solid var(--a-border);
    border-radius: var(--a-borderR--x10);
  }
</style>
