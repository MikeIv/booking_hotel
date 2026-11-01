<script setup lang="ts">
  type RoundingToken = {
    name: string;
    token: string;
    px: number;
    usage: string;
  };

  type UsageRule = {
    component: string;
    token: string;
    value: string;
    note: string;
  };

  const roundingTokens: RoundingToken[] = [
    { name: "radius/sm", token: "--ds-radius-sm", px: 4, usage: "мелкие элементы / микро-радиус" },
    { name: "radius/md", token: "--ds-radius-md", px: 8, usage: "кнопки" },
    { name: "radius/lg", token: "--ds-radius-lg", px: 12, usage: "карточки" },
    { name: "radius/xl", token: "--ds-radius-xl", px: 16, usage: "модалки (базовый xl)" },
    {
      name: "radius/xl-strong",
      token: "--ds-radius-xl-strong",
      px: 20,
      usage: "модалки (крупные, допустимое усиление)",
    },
  ];

  const usageRules: UsageRule[] = [
    { component: "Button", token: "radius-md", value: "8px", note: "по умолчанию для всех видов кнопок" },
    { component: "Card", token: "radius-lg", value: "12px", note: "контейнеры карточек" },
    { component: "Modal", token: "radius-xl", value: "16px / 20px", note: "16px базово, 20px для крупных модалок" },
  ];
</script>

<template>
  <div :class="$style.root">
    <header :class="$style.header">
      <h1 :class="$style.title">Rounding</h1>
      <p :class="$style.lead">
        Секция синхронизирована с Figma (`Design system / 1.4 Скругления`) и фиксирует
        токены радиусов и правила применения.
      </p>
    </header>

    <section :class="$style.section">
      <h2 :class="$style.sectionTitle">Токены</h2>
      <ul :class="$style.list">
        <li
          v-for="token in roundingTokens"
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
              :class="$style.radiusBox"
              :style="{ borderRadius: `var(${token.token})` }"
            />
            <span :class="$style.value">{{ token.px }}px</span>
          </div>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.sectionTitle">Закрепление по компонентам</h2>
      <ul :class="$style.rules">
        <li
          v-for="rule in usageRules"
          :key="rule.component"
          :class="$style.rule"
        >
          <strong :class="$style.ruleComponent">{{ rule.component }}</strong>
          <code :class="$style.ruleToken">{{ rule.token }}</code>
          <span :class="$style.ruleValue">{{ rule.value }}</span>
          <span :class="$style.ruleNote">{{ rule.note }}</span>
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

  .radiusBox {
    width: rem(90);
    height: rem(48);
    background: var(--a-lightPrimaryBg);
    border: rem(1) solid var(--a-border-primary);
  }

  .value {
    min-width: rem(54);
    font-size: var(--ds-typo-size-body-sm);
    color: var(--a-text-primary);
    text-align: right;
  }

  .rules {
    display: grid;
    gap: var(--a-space-2);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .rule {
    display: grid;
    grid-template-columns: rem(96) rem(140) rem(120) 1fr;
    gap: var(--a-space-2);
    align-items: center;
    padding: var(--a-space-2);
    border: rem(1) solid var(--a-border);
    border-radius: var(--a-borderR--x10);
  }

  .ruleComponent {
    font-size: var(--ds-typo-size-body-md);
    color: var(--a-text-primary);
  }

  .ruleToken {
    font-size: var(--ds-typo-size-body-sm);
    color: var(--a-text-light);
  }

  .ruleValue {
    font-size: var(--ds-typo-size-body-sm);
    color: var(--a-text-dark);
  }

  .ruleNote {
    font-size: var(--ds-typo-size-body-sm);
    color: var(--a-text-light);
  }
</style>
