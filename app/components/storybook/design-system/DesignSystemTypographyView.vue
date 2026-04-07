<script setup lang="ts">
  type FontToken = { token: string; value: string; note: string };
  type ScaleToken = { token: string; value: string; sample: string; line: string; weight: string };

  const fontTokens: FontToken[] = [
    { token: "--ds-typo-family-heading", value: "Gotham Pro", note: "Заголовки и акценты" },
    { token: "--ds-typo-family-body", value: "Inter", note: "Основной UI-текст" },
    { token: "--a-font-heading", value: "alias -> --ds-typo-family-heading", note: "Обратная совместимость" },
    { token: "--a-font-body", value: "alias -> --ds-typo-family-body", note: "Обратная совместимость" },
  ];

  const weightTokens: FontToken[] = [
    { token: "--ds-typo-weight-light", value: "300", note: "Light" },
    { token: "--ds-typo-weight-regular", value: "400", note: "Regular" },
    { token: "--ds-typo-weight-medium", value: "500", note: "Medium" },
    { token: "--ds-typo-weight-semibold", value: "600", note: "SemiBold" },
    { token: "--ds-typo-weight-bold", value: "700", note: "Bold" },
    { token: "--ds-typo-weight-black", value: "900", note: "Black" },
  ];

  const scaleTokens: ScaleToken[] = [
    {
      token: "--ds-typo-size-h1",
      value: "2.125rem / 34px",
      sample: "h1 — Заголовок страницы (Gotham Pro)",
      line: "var(--ds-typo-line-h1) / 42px",
      weight: "var(--ds-typo-weight-h) / 700",
    },
    {
      token: "--ds-typo-size-h2",
      value: "1.75rem / 28px",
      sample: "h2 — Заголовок секции (Gotham Pro)",
      line: "var(--ds-typo-line-h2) / 34px",
      weight: "var(--ds-typo-weight-h) / 700",
    },
    {
      token: "--ds-typo-size-h3",
      value: "1.375rem / 22px",
      sample: "h3 — Подзаголовок (Gotham Pro)",
      line: "var(--ds-typo-line-h3) / 28px",
      weight: "var(--ds-typo-weight-h) / 700",
    },
    {
      token: "--ds-typo-size-body-lg",
      value: "1.125rem / 18px",
      sample: "body-lg — основной текст (Inter)",
      line: "var(--ds-typo-line-body-lg) / 27px",
      weight: "var(--ds-typo-weight-body) / 400",
    },
    {
      token: "--ds-typo-size-body-md",
      value: "1rem / 16px",
      sample: "body-md — базовый UI-текст (Inter)",
      line: "var(--ds-typo-line-body-md) / 24px",
      weight: "var(--ds-typo-weight-body) / 400",
    },
    {
      token: "--ds-typo-size-body-sm",
      value: "0.875rem / 14px",
      sample: "body-sm — вторичный текст (Inter)",
      line: "var(--ds-typo-line-body-sm) / 20px",
      weight: "var(--ds-typo-weight-body) / 400",
    },
    {
      token: "--ds-typo-size-caption",
      value: "0.75rem / 12px",
      sample: "caption — подписи (Inter)",
      line: "var(--ds-typo-line-caption) / 16px",
      weight: "var(--ds-typo-weight-caption) / 500",
    },
  ];

  const rhythmTokens: FontToken[] = [
    { token: "--ds-typo-line-tight", value: "1", note: "Плотные UI-лейблы" },
    { token: "--ds-typo-line-default", value: "1.3", note: "Заголовки" },
    { token: "--ds-typo-line-comfort", value: "1.5", note: "Параграфы" },
    { token: "--ds-typo-tracking-caps", value: "0.04em", note: "Uppercase labels" },
  ];

  const radiusTokens = [
    { name: "--a-borderR--x6", note: "блок" },
    { name: "--a-borderR--x8", note: "чипы, теги" },
    { name: "--a-borderR--x10", note: "блок" },
    { name: "--a-borderR--btn", note: "кнопки" },
    { name: "--a-borderR--input", note: "инпуты" },
    { name: "--a-borderR--x20", note: "20px" },
    { name: "--a-borderR--card", note: "карточки" },
    { name: "--a-borderR--select", note: "селекты" },
    { name: "--a-borderR--x30", note: "блок / баннер (частично)" },
    { name: "--p-banner-border-radius", note: "баннер PrimeVue" },
    { name: "--a-borderR--pill", note: "табы, pill" },
    { name: "--a-borderR--dialog", note: "формы, диалоги" },
  ];
</script>

<template>
  <div :class="$style.root">
    <header :class="$style.header">
      <h1 :class="$style.title">Типографика</h1>
      <p :class="$style.lead">
        Секция синхронизирована с типографическими токенами дизайн-системы из Figma (node 6037:3):
        канонические переменные <code>--ds-typo-*</code> и проектные алиасы <code>--a-font-*</code>.
      </p>
    </header>

    <section :class="$style.section">
      <h2 :class="$style.h2">Базовый размер</h2>
      <dl :class="$style.dl">
        <div :class="$style.row">
          <dt>Корень документа</dt>
          <dd><code>16px</code> — <code>app/assets/styles/variables/_base-font-size.scss</code></dd>
        </div>
        <div :class="$style.row">
          <dt>Функция rem()</dt>
          <dd>
            <code>app/assets/styles/tools/_functions.scss</code> — делитель базы <strong>16</strong>
          </dd>
        </div>
      </dl>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.h2">Семейства шрифтов</h2>
      <ul :class="$style.samples">
        <li
          v-for="f in fontTokens"
          :key="f.token"
          :class="$style.sampleCard"
        >
          <span :class="$style.sampleLabel">{{ f.token }}</span>
          <p
            :class="$style.inter"
            :style="{ fontFamily: `var(${f.token})` }"
          >
            Aa Бронирование номера
          </p>
          <code :class="$style.token">{{ f.value }}</code>
        </li>
        <li :class="$style.sampleCard">
          <span :class="$style.sampleLabel">Пример heading</span>
          <p
            :class="$style.playfair"
            :style="{ fontFamily: 'var(--a-font-heading)' }"
          >
            Gotham Pro — заголовки
          </p>
          <code :class="$style.token">var(--a-font-heading), weight 600</code>
        </li>
        <li :class="$style.sampleCard">
          <span :class="$style.sampleLabel">Пример body</span>
          <p
            :class="$style.inter"
            :style="{ fontFamily: 'var(--a-font-body)' }"
          >
            Inter — основной текст интерфейса
          </p>
          <code :class="$style.token">var(--a-font-body), weight 400</code>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.h2">Веса и ритм</h2>
      <ul :class="$style.scale">
        <li
          v-for="w in weightTokens"
          :key="w.token"
        >
          <span :class="$style.scaleLabel">{{ w.token }}</span>
          <span :class="$style.scaleSpec">{{ w.value }} — {{ w.note }}</span>
        </li>
      </ul>
      <ul :class="$style.scale">
        <li
          v-for="r in rhythmTokens"
          :key="r.token"
        >
          <span :class="$style.scaleLabel">{{ r.token }}</span>
          <span :class="$style.scaleSpec">{{ r.value }} — {{ r.note }}</span>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.h2">Масштаб</h2>
      <ul :class="$style.scale">
        <li
          v-for="s in scaleTokens"
          :key="s.token"
        >
          <span :class="$style.scaleLabel">{{ s.token }}</span>
          <span :class="$style.scaleSpec">{{ s.value }} — {{ s.sample }}</span>
          <span :class="$style.scaleSpec">line-height: {{ s.line }}</span>
          <span :class="$style.scaleSpec">font-weight: {{ s.weight }}</span>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.h2">Скругления (связанные токены)</h2>
      <p :class="$style.note">Из <code>_rounding.scss</code> — используются вместе с типографикой в компонентах.</p>
      <ul :class="$style.radiusList">
        <li
          v-for="r in radiusTokens"
          :key="r.name"
        >
          <code>{{ r.name }}</code>
          <span>{{ r.note }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .root {
    max-width: rem(720);
    padding: rem(24);
    margin: 0 auto;
    font-family: var(--a-font-body);
    color: var(--a-text-dark);
    background: var(--a-whiteBg);
  }

  .header {
    margin-bottom: rem(28);
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
    line-height: 1.55;
    color: var(--a-text-light);

    code {
      padding: rem(2) rem(6);
      font-size: rem(14);
      background: var(--a-mainBg);
      border-radius: rem(4);
    }
  }

  .section {
    margin-bottom: rem(36);
  }

  .h2 {
    margin: 0 0 rem(12);
    font-family: var(--a-font-heading);
    font-size: rem(22);
    font-weight: 600;
    color: var(--a-text-primary);
  }

  .dl {
    margin: 0;
  }

  .row {
    display: grid;
    gap: rem(4);
    padding: rem(12) 0;
    border-bottom: rem(1) solid var(--a-border);

    dt {
      font-size: rem(14);
      font-weight: 600;
      color: var(--a-text-primary);
    }

    dd {
      margin: 0;
      font-size: rem(15);
      line-height: 1.5;
      color: var(--a-text-light);
    }
  }

  .samples {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .sampleCard {
    padding: rem(16);
    border: rem(1) solid var(--a-border);
    border-radius: var(--a-borderR--x10);
  }

  .sampleLabel {
    display: block;
    margin-bottom: rem(8);
    font-size: rem(12);
    font-weight: 600;
    color: var(--a-text-light);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .playfair,
  .inter,
  .system {
    margin: 0 0 rem(8);
    font-size: rem(22);
    line-height: 1.3;
    color: var(--a-text-dark);
  }

  .token {
    font-size: rem(13);
    color: var(--a-text-light);
  }

  .scale {
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      display: flex;
      flex-direction: column;
      gap: rem(4);
      padding: rem(12) 0;
      border-bottom: rem(1) solid var(--a-border);
    }
  }

  .scaleLabel {
    font-size: rem(14);
    font-weight: 600;
    color: var(--a-text-primary);
  }

  .scaleSpec {
    font-size: rem(14);
    color: var(--a-text-light);
  }

  .note {
    margin: 0 0 rem(12);
    font-size: rem(14);
    line-height: 1.5;
    color: var(--a-text-light);

    code {
      font-size: rem(13);
    }
  }

  .radiusList {
    padding: 0;
    margin: 0;
    font-size: rem(14);
    line-height: 1.6;
    list-style: none;

    li {
      display: flex;
      flex-wrap: wrap;
      gap: rem(8);
      align-items: baseline;
      padding: rem(6) 0;
      color: var(--a-text-light);

      code {
        min-width: rem(220);
        color: var(--a-text-dark);
      }
    }
  }
</style>
