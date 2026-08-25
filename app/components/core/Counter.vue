<script setup lang="ts">
interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: Infinity,
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

function updateValue(delta: number) {
  if (props.disabled) return;
  const newValue = props.modelValue + delta;
  if (newValue >= props.min && newValue <= props.max) {
    emit("update:modelValue", newValue);
  }
}

const canDecrease = computed(() => props.modelValue > props.min && !props.disabled);
const canIncrease = computed(() => props.modelValue < props.max && !props.disabled);
</script>

<template>
  <div :class="$style.counter">
    <Button
      type="button"
      unstyled
      :class="$style.setButton"
      :disabled="!canDecrease"
      aria-label="Уменьшить"
      @click="updateValue(-1)"
    >
      <span :class="$style.sign" aria-hidden="true" />
    </Button>
    <span :class="$style.count">{{ modelValue }}</span>
    <Button
      type="button"
      unstyled
      :class="$style.setButton"
      :disabled="!canIncrease"
      aria-label="Увеличить"
      @click="updateValue(1)"
    >
      <span :class="[$style.sign, $style.signPlus]" aria-hidden="true" />
    </Button>
  </div>
</template>

<style module lang="scss">
.counter {
  display: flex;
  align-items: center;
  gap: rem(8);
  min-width: rem(128);
  margin-left: rem(20);
}

.setButton {
  display: flex;
  justify-content: center;
  align-items: center;
  width: rem(36);
  height: rem(36);
  padding: 0;
  color: var(--a-white);
  background-color: var(--a-lightBg);
  border-radius: 50%;
  cursor: pointer;
  border: none;

  &:hover:not(:disabled),
  &:focus-visible {
    background-color: var(--ds-primary-300);
  }

  &:disabled,
  &[data-p-disabled="true"] {
    cursor: not-allowed;
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
  }
}

.sign {
  position: relative;
  display: block;
  width: rem(16);
  height: rem(16);
  flex-shrink: 0;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: rem(2);
    background-color: currentColor;
    transform: translateY(-50%);
  }
}

.signPlus::after {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: rem(2);
  height: 100%;
  background-color: currentColor;
  transform: translateX(-50%);
}

.count {
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--ds-space-500);
  height: var(--ds-space-500);
  font-size: var(--ds-typo-size-h3);
  line-height: var(--ds-typo-line-tight);
  color: var(--a-black);
}
</style>
