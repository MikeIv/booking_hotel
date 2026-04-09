<script setup lang="ts">
  import { computed } from "vue";

  const props = withDefaults(
    defineProps<{
      variant?: "primary" | "dark" | "ghost" | "danger";
      size?: "m" | "l" | "xl";
      radius?: "default" | "round";
      round?: boolean;
      disabled?: boolean;
      unstyled?: boolean;
      type?: "button" | "submit" | "reset";
    }>(),
    {
      variant: "primary",
      size: "m",
      radius: "default",
      round: false,
      disabled: false,
      unstyled: false,
      type: "button",
    },
  );

  const radiusClass = computed(() => {
    if (props.round || props.radius === "round") {
      return "round";
    }

    return "radiusDefault";
  });
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="[
      props.unstyled
        ? undefined
        : [
            $style.btn,
            $style[props.variant],
            $style[props.size],
            $style[radiusClass],
          ],
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
    font-family: var(--a-font-body);
    font-weight: 400;
    line-height: 1;
    border: none;
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

  .m {
    min-height: rem(44);
    padding: rem(12) rem(44);
    font-size: rem(18);
  }

  .l {
    min-height: rem(54);
    padding: rem(16) rem(48);
    font-size: rem(20);
  }

  .xl {
    min-height: rem(64);
    padding: rem(20) rem(56);
    font-size: rem(24);
  }

  .radiusDefault {
    border-radius: var(--a-borderR--btn);
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
