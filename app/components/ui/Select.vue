<script setup lang="ts">
  import { useAttrs } from "vue";

  const props = withDefaults(
    defineProps<{
      label?: string;
      valueText?: string;
      disabled?: boolean;
      invalid?: boolean;
      iconName?: string;
      open?: boolean;
      ariaLabel?: string;
      variant?: "default" | "booking";
      rotateIconOnOpen?: boolean;
    }>(),
    {
      label: "",
      valueText: "",
      disabled: false,
      invalid: false,
      iconName: "i-chevron-down",
      open: false,
      ariaLabel: "",
      variant: "default",
      rotateIconOnOpen: true,
    },
  );

  const emit = defineEmits<{
    click: [event: MouseEvent];
  }>();

  const attrs = useAttrs();
</script>

<template>
  <button
    type="button"
    :disabled="props.disabled"
    :aria-expanded="props.open || undefined"
    :aria-label="props.ariaLabel || props.valueText"
    :aria-invalid="props.invalid || undefined"
    :class="[
      $style.root,
      $style[props.variant],
      { [$style.invalid]: props.invalid, [$style.disabled]: props.disabled },
    ]"
    v-bind="attrs"
    @click="emit('click', $event)"
  >
    <span :class="$style.content">
      <span v-if="props.label" :class="$style.label">{{ props.label }}</span>
      <span :class="$style.value">{{ props.valueText }}</span>
    </span>
    <UIcon
      :name="props.iconName"
      :class="[
        $style.icon,
        {
          [$style.iconChevronSelect]: props.iconName === 'i-chevron-down-select',
          [$style.iconCalendar]: props.iconName === 'i-calendar',
          [$style.iconOpen]: props.open && props.rotateIconOnOpen,
        },
      ]"
      aria-hidden="true"
    />
  </button>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;

  .root {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(8);
    width: 100%;
    min-height: rem(67);
    padding: rem(8) rem(12);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--input);
    background: var(--a-whiteBg);
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:hover:not(.disabled) {
      border-color: var(--a-border-primary-accent);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-border-primary-accent);
      outline-offset: rem(1);
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    min-width: 0;
  }

  .label {
    font-family: var(--a-font-body);
    font-size: rem(12);
    line-height: 1.2;
    color: var(--a-text-light);
  }

  .value {
    margin-top: rem(4);
    font-family: var(--a-font-body);
    font-size: rem(16);
    line-height: 1.2;
    color: var(--a-text-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon {
    width: rem(22);
    height: rem(22);
    color: var(--a-primaryBg);
    flex-shrink: 0;
    transition: transform 0.2s ease, color 0.2s ease;
  }

  .invalid {
    border-color: var(--a-border-accent);
  }

  .disabled {
    border-color: var(--a-border);
    background: var(--a-lightBg);
    cursor: not-allowed;

    .label,
    .value,
    .icon {
      color: var(--a-text-light);
    }
  }

  .iconOpen {
    transform: rotate(180deg);
  }

  .booking {
    .label {
      font-family: var(--a-font-heading);
      font-size: rem(16);
      color: var(--a-text-secondary);
    }

    .value {
      margin-top: rem(2);
      font-family: var(--a-font-heading);
      font-size: rem(26);
      line-height: 1;
      color: var(--a-text-primary);
    }

    .icon {
      color: var(--a-text-secondary);
    }

    .iconChevronSelect {
      width: rem(22);
      height: rem(9);
      transform: translateY(rem(2));
    }

    .iconCalendar {
      width: rem(31);
      height: rem(33);
    }
  }

  .root.booking:hover:not(.disabled) {
    .icon {
      color: var(--a-text-primary);
    }
  }

  .root:hover:not(.disabled) {
    .icon {
      color: var(--a-text-primary);
    }
  }
</style>
