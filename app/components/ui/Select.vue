<script setup lang="ts">
  import { useAttrs } from "vue";

  const props = withDefaults(
    defineProps<{
      label?: string;
      valueText?: string;
      placeholder?: string;
      disabled?: boolean;
      invalid?: boolean;
      iconName?: string;
      open?: boolean;
      ariaLabel?: string;
      variant?: "default" | "booking" | "personal";
      rotateIconOnOpen?: boolean;
    }>(),
    {
      label: "",
      valueText: "",
      placeholder: "",
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
  const resolvedValueText = computed(() =>
    props.valueText || props.placeholder || "",
  );
  const isPlaceholder = computed(
    () => !props.valueText && Boolean(props.placeholder),
  );
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
      <span :class="[$style.value, isPlaceholder && $style.valuePlaceholder]">{{
        resolvedValueText
      }}</span>
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
    flex: 1 1 0;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    overflow: hidden;
    text-align: left;
  }

  .label {
    font-family: var(--a-font-body);
    font-size: rem(12);
    line-height: 1.2;
    color: var(--a-text-light);
  }

  .value {
    margin-top: rem(4);
    width: 100%;
    overflow: hidden;
    font-family: var(--a-font-body);
    font-size: rem(16);
    line-height: 1.2;
    color: var(--a-text-dark);
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .valuePlaceholder {
    color: var(--a-text-dark);
    opacity: 0.3;
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
    container-type: inline-size;

    .label {
      font-family: var(--a-font-heading);
      font-size: rem(16);
      color: var(--a-text-secondary);
    }

    .value {
      margin-top: rem(2);
      font-family: var(--a-font-select);
      font-size: var(--ds-typo-size-select-fluid);
      line-height: var(--ds-typo-line-select);
      font-weight: var(--ds-typo-weight-select);
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
      width: clamp(rem(22), 8cqi, rem(31));
      height: clamp(rem(22), 8.5cqi, rem(33));
    }
  }

  .personal {
    min-height: rem(58);
    padding: 0 rem(32);
    border-color: var(--a-border-dark);
    border-radius: rem(22);
    box-shadow: var(--a-shadow-summary);

    .value {
      margin-top: 0;
      font-family: var(--a-font-body);
      font-size: rem(16);
      line-height: 1.2;
      color: var(--a-text-dark);
    }

    .icon {
      color: var(--a-text-dark);
      opacity: 0.3;
    }

    .iconChevronSelect {
      width: rem(20);
      height: rem(9);
      transform: translateY(rem(1));
    }
  }

  // Keep invalid border consistent with personal input styles.
  .root.personal.invalid {
    border-color: var(--a-border-accent);
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
