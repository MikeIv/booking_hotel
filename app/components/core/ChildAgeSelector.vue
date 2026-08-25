<script setup lang="ts">
import { getAgeOptions, childAgeLabel } from "~/utils/age";

interface Props {
  modelValue: number;
  totalChildren: number;
  childIndex: number; // 1-based index
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const ageOptions = computed(() => getAgeOptions());
const label = computed(() => childAgeLabel(props.totalChildren, props.childIndex));
</script>

<template>
  <div :class="$style.childAgeRow">
    <span :class="$style.name">{{ label }}</span>
    <div :class="$style.selectBlock">
      <Select
        :class="$style.ageSelect"
        :model-value="modelValue"
        :options="ageOptions"
        option-label="label"
        option-value="value"
        placeholder="Возраст"
        :pt="{
          overlay: { class: 'child-age-select-overlay' },
          panel: { class: 'child-age-select-overlay' },
          option: { class: $style.ageOption },
          item: { class: $style.ageOption },
        }"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<style module lang="scss">
@use "~/assets/styles/variables/resolutions" as size;

.childAgeRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.name {
  font-family: var(--a-font-body);
  font-size: var(--ds-typo-size-body-lg);
  color: var(--a-text-dark);
  text-wrap: wrap;

  @media (min-width: #{size.$desktopMin}) {
    font-size: var(--ds-typo-size-h3);
  }
}

.selectBlock {
  display: flex;
  align-items: center;
}

.ageSelect {
  display: flex;
  align-items: center;
  width: rem(120);
  height: rem(36);
  padding: 0 var(--ds-space-200);
  font-size: var(--ds-typo-size-h3);
  line-height: var(--ds-typo-line-select);
  font-family: var(--a-font-body);
  color: var(--a-text-dark);
  background-color: var(--a-whiteBg);
  border: rem(1) solid var(--a-border-primary);
  border-radius: var(--a-borderR--input);
  cursor: pointer;
  transition: border-color 0.3s ease;

  @media (min-width: #{size.$desktopMin}) {
    width: rem(148);
  }

  &:focus {
    outline: none;
    border-color: var(--a-accentBg);
  }

  :global(.p-select-label) {
    font-size: inherit;
    line-height: inherit;
    font-family: inherit;
  }

  :global(.p-select-label.p-placeholder) {
    color: var(--a-text-light);
  }
}

.ageOption {
  padding: var(--ds-space-100);
}
</style>

<style lang="scss">
.child-age-select-overlay {
  .p-select-list-container,
  .p-select-option-label {
    font-size: var(--ds-typo-size-h3);
    line-height: var(--ds-typo-line-default);
    font-family: var(--a-font-body);
  }
}
</style>
