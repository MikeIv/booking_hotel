<template>
  <nav :class="[$style.tabs, $style[`tabs_${mode}`]]" role="group" :aria-label="ariaLabel">
    <button
      v-for="item in items"
      :key="item.value"
      :type="buttonType"
      :class="[
        $style.tab,
        { [$style.tab_active]: item.value === modelValue },
        item.disabled && $style.tab_disabled,
      ]"
      :disabled="item.disabled"
      :aria-pressed="item.value === modelValue"
      @click="handleSelect(item.value)"
    >
      {{ item.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
interface UiTabsItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  items: UiTabsItem[];
  modelValue: string;
  ariaLabel: string;
  mode?: "tariff" | "personal";
  buttonType?: "button" | "submit" | "reset";
}

interface Emits {
  (e: "update:modelValue", value: string): void;
}

withDefaults(defineProps<Props>(), {
  mode: "tariff",
  buttonType: "button",
});

const emit = defineEmits<Emits>();

const handleSelect = (value: string) => {
  emit("update:modelValue", value);
};
</script>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;
  @use "~/assets/styles/tools/mixins" as typo;

  .tabs {
    --ui-tabs-padding-inline: #{rem(42)};

    display: flex;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .tabs_tariff {
    flex-direction: column;
    gap: rem(20);
    margin-bottom: rem(24);

    @media (min-width: #{size.$tabletMin}) {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
  }

  .tabs_personal {
    flex-direction: column;
    gap: rem(24);
    margin-bottom: rem(25);

    @media (min-width: #{size.$tablet}) {
      flex-direction: row;
    }
  }

  .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-width: fit-content;
    height: rem(48);
    padding: 0 var(--ui-tabs-padding-inline);
    border: rem(1) solid var(--a-border-primary);
    border-radius: rem(39);
    background: var(--a-whiteBg);
    color: var(--a-text-dark);
    text-align: center;
    cursor: pointer;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
    @include typo.typo-body-lg;

    &:hover:not(:disabled) {
      color: var(--a-text-white);
      background: var(--a-primaryBg);
      border-color: var(--a-primaryBg);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-primaryBg);
      outline-offset: rem(2);
    }
  }

  .tabs_tariff .tab {
    flex: 0 0 auto;
  }

  .tabs_personal .tab {
    flex: 0 0 auto;
  }

  .tab_active {
    background: var(--a-primaryBg);
    color: var(--a-text-white);
    border-color: var(--a-primaryBg);

    &:hover:not(:disabled) {
      color: var(--a-text-white);
      border-color: var(--a-primaryBg);
      background: var(--a-primaryBg);
    }
  }

  .tab_disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
