<script setup lang="ts">
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
        Базовые токены: корень <code>html, body</code> (размер шрифта), семейства <code>--a-font-*</code>,
        стек <code>--system-font</code> из <code>main.scss</code>, функция <code>rem()</code> (база 16px).
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
        <li :class="$style.sampleCard">
          <span :class="$style.sampleLabel">--a-font-heading</span>
          <p
            :class="$style.playfair"
            :style="{ fontFamily: 'var(--a-font-heading)' }"
          >
            Playfair Display — заголовки
          </p>
          <code :class="$style.token">var(--a-font-heading)</code>
        </li>
        <li :class="$style.sampleCard">
          <span :class="$style.sampleLabel">--a-font-body</span>
          <p
            :class="$style.inter"
            :style="{ fontFamily: 'var(--a-font-body)' }"
          >
            Inter — основной текст интерфейса
          </p>
          <code :class="$style.token">var(--a-font-body)</code>
        </li>
        <li :class="$style.sampleCard">
          <span :class="$style.sampleLabel">body (main.scss)</span>
          <p :class="$style.system">Системный стек для body</p>
          <code :class="$style.token">var(--system-font)</code>
        </li>
      </ul>
    </section>

    <section :class="$style.section">
      <h2 :class="$style.h2">Масштаб (примеры из UI)</h2>
      <ul :class="$style.scale">
        <li>
          <span :class="$style.scaleLabel">Кнопка (.btn__bs в global)</span>
          <span :class="$style.scaleSpec">18px (rem(18)), weight 400, line-height 1, Inter</span>
        </li>
        <li>
          <span :class="$style.scaleLabel">Селект / список (PrimeVue)</span>
          <span :class="$style.scaleSpec">16px (rem(16)), Inter</span>
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

  .system {
    font-family: var(--system-font);
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
