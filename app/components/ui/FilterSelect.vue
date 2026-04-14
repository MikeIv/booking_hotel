<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      modelValue: number | string | null | undefined;
      options: ReadonlyArray<Record<string, unknown>>;
      optionLabel: string;
      optionValue: string;
      placeholder?: string;
      disabled?: boolean;
    }>(),
    {
      placeholder: "",
      disabled: false,
    },
  );

  const emit = defineEmits<{
    "update:modelValue": [value: number | string | null | undefined];
  }>();

  const triggerRef = ref<HTMLButtonElement | null>(null);
  const popoverRef = ref<{
    toggle: (event: Event) => void;
    hide: (event: Event) => void;
  } | null>(null);

  const isOpen = ref(false);
  const panelMinWidth = ref("min(100vw - 2rem, 368px)");

  const triggerId = useId();
  const listId = useId();

  function readValue(opt: Record<string, unknown>): unknown {
    return opt[props.optionValue];
  }

  function readLabel(opt: Record<string, unknown>): string {
    const raw = opt[props.optionLabel];
    if (raw === null || raw === undefined) {
      return "";
    }
    return String(raw);
  }

  function optionKey(opt: Record<string, unknown>, index: number): string | number {
    const v = readValue(opt);
    if (v === null || v === undefined) {
      return `opt-${index}`;
    }
    return typeof v === "string" || typeof v === "number" ? v : `opt-${index}`;
  }

  function isSelected(opt: Record<string, unknown>): boolean {
    return Object.is(readValue(opt), props.modelValue);
  }

  const displayText = computed(() => {
    const found = props.options.find((o) => isSelected(o));
    if (found) {
      return readLabel(found);
    }
    return props.placeholder || "";
  });

  const isTriggerDisabled = computed(
    () => props.disabled || props.options.length === 0,
  );

  function onTriggerClick(event: Event) {
    if (isTriggerDisabled.value) {
      return;
    }
    if (triggerRef.value) {
      panelMinWidth.value = `${triggerRef.value.offsetWidth}px`;
    }
    popoverRef.value?.toggle(event);
  }

  function selectOption(opt: Record<string, unknown>, event: Event) {
    const next = readValue(opt);
    emit("update:modelValue", next as number | string | null | undefined);
    popoverRef.value?.hide(event);
  }

  const popoverPt = computed(() => ({
    content: {
      style: {
        padding: "0",
        minWidth: panelMinWidth.value,
        maxWidth: "min(100vw - 2rem, 368px)",
      },
    },
  }));
</script>

<template>
  <div :class="$style.root">
    <button
      :id="triggerId"
      ref="triggerRef"
      type="button"
      :class="$style.trigger"
      :disabled="isTriggerDisabled"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listId"
      @click="onTriggerClick"
    >
      <span :class="$style.label">{{ displayText }}</span>
      <UIcon
        name="i-chevron-down-select"
        :class="$style.chevron"
        aria-hidden="true"
      />
    </button>

    <Popover
      ref="popoverRef"
      append-to="body"
      :class="$style.popover"
      :pt="popoverPt"
      @show="isOpen = true"
      @hide="isOpen = false"
    >
      <ul
        :id="listId"
        role="listbox"
        :class="$style.list"
        :aria-labelledby="triggerId"
      >
        <li
          v-for="(opt, idx) in options"
          :key="optionKey(opt, idx)"
          role="presentation"
        >
          <button
            type="button"
            role="option"
            :class="[$style.item, isSelected(opt) && $style.itemSelected]"
            :aria-selected="isSelected(opt)"
            @click="selectOption(opt, $event)"
          >
            {{ readLabel(opt) }}
          </button>
        </li>
      </ul>
    </Popover>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/functions" as *;
  @use "~/assets/styles/tools/mixins" as *;

  .root {
    @include booking-filter-select-ui;
  }

  .popover {
    :global(.p-popover-content) {
      border-radius: var(--a-borderR--input);
      box-shadow: var(--a-shadow-card);
    }
  }

  .list {
    margin: 0;
    padding: rem(8) 0;
    list-style: none;
    max-height: rem(320);
    overflow-y: auto;
    background: var(--a-text-white);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--input);

    &::-webkit-scrollbar {
      width: rem(3);
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: rem(1.5);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--a-text-light);
      border-radius: rem(1.5);

      &:hover {
        background: var(--a-text-dark);
      }
    }

    scrollbar-width: thin;
    scrollbar-color: var(--a-text-light) transparent;
  }

  .item {
    display: block;
    width: 100%;
    padding: rem(10) rem(24);
    border: none;
    background: transparent;
    font-family: var(--a-font-select);
    font-size: var(--ds-typo-size-select);
    line-height: var(--ds-typo-line-select);
    font-weight: var(--ds-typo-weight-select);
    color: var(--a-black);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover,
    &:focus-visible {
      background: var(--a-gray-50);
      color: var(--a-text-accent);
      outline: none;
    }
  }

  .itemSelected {
    color: var(--a-text-accent);
  }
</style>
