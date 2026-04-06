<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      variant?: "primary" | "dark" | "ghost" | "danger";
      round?: boolean;
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
    }>(),
    {
      variant: "primary",
      round: false,
      disabled: false,
      type: "button",
    },
  );
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="[
      $style.btn,
      $style[props.variant],
      { [$style.round]: props.round },
    ]"
  >
    <slot />
  </button>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: rem(44);
    padding: rem(12) rem(44);
    font-family: var(--a-font-body);
    font-size: rem(18);
    font-weight: 400;
    line-height: 1;
    border: none;
    border-radius: var(--a-borderR--btn);
    box-sizing: border-box;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
      pointer-events: none;
    }
  }

  .round {
    border-radius: var(--a-borderR--dialog);
  }

  .primary {
    color: var(--a-text-white);
    background-color: var(--a-primaryBg);

    &:hover:not(:disabled) {
      background-color: var(--a-blackBg);
    }
  }

  .dark {
    color: var(--a-text-white);
    background-color: var(--a-blackBg);

    &:hover:not(:disabled) {
      background-color: var(--a-btnAccentBg);
    }
  }

  .ghost {
    color: var(--a-text-primary);
    background-color: var(--a-whiteBg);
    border: rem(1) solid var(--a-border-primary);

    &:hover:not(:disabled) {
      color: var(--a-text-white);
      background-color: var(--a-primaryBg);
    }
  }

  .danger {
    color: var(--a-text-white);
    background-color: var(--a-btnAccentBg);

    &:hover:not(:disabled) {
      background-color: var(--a-blackBg);
    }
  }
</style>
