<script setup lang="ts">
  interface Props {
    iconName: string;
    ariaLabel?: string;
    ariaExpanded?: boolean;
    dataPopupButton?: boolean;
  }

  const _props = withDefaults(defineProps<Props>(), {
    ariaLabel: "",
    ariaExpanded: undefined,
    dataPopupButton: false,
  });

  const emit = defineEmits<{
    (e: "click", event: MouseEvent): void;
  }>();

  const handleClick = (event: MouseEvent) => {
    emit("click", event);
  };
</script>

<template>
  <UiButton
    type="button"
    variant="icon"
    size="icon40"
    :class="$style.infoButton"
    :aria-label="ariaLabel || undefined"
    :aria-expanded="ariaExpanded !== undefined ? ariaExpanded : undefined"
    :data-popup-button="dataPopupButton ? '' : undefined"
    @click="handleClick"
  >
    <UIcon :name="iconName" :class="$style.icon" />
  </UiButton>
</template>

<style module lang="scss">
  .infoButton {
    line-height: 0;

    :global(span) {
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
  }

  .icon {
    display: block;
    width: rem(26);
    height: rem(26);
    color: currentcolor;
  }
</style>
