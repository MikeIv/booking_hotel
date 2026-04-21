<script setup lang="ts">
  interface AmenityItem {
    title: string;
  }

  interface Props {
    items: readonly AmenityItem[];
    expanded?: boolean;
    limit?: number;
    size?: "md" | "lg";
  }

  const props = withDefaults(defineProps<Props>(), {
    expanded: true,
    limit: undefined,
    size: "md",
  });

  const emit = defineEmits<{
    (e: "show-more"): void;
  }>();

  const shouldLimit = computed(
    () => typeof props.limit === "number" && props.limit > 0,
  );

  const visibleItems = computed(() => {
    if (!shouldLimit.value || props.expanded) {
      return props.items;
    }

    return props.items.slice(0, props.limit);
  });

  const hiddenCount = computed(() => {
    if (!shouldLimit.value || props.expanded) {
      return 0;
    }

    return Math.max(props.items.length - props.limit, 0);
  });
</script>

<template>
  <div :class="[$style.root, $style[`size_${props.size}`]]">
    <ul :class="$style.list">
      <li
        v-for="(amenity, index) in visibleItems"
        :key="`${amenity.title}-${index}`"
        :class="$style.item"
      >
        <span>{{ amenity.title }}</span>
      </li>
    </ul>

    <div v-if="hiddenCount > 0" :class="$style.showMoreWrap">
      <UiButton
        type="button"
        unstyled
        :class="$style.showMoreButton"
        @click="emit('show-more')"
      >
        + ещё {{ hiddenCount }}
      </UiButton>
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/tools/mixins" as typo;
  @use "~/assets/styles/variables/resolutions" as size;

  .root {
    --ui-amenities-gap-row: #{rem(12)};
    --ui-amenities-gap-column: #{rem(12)};
    --ui-amenities-item-padding-y: #{rem(2)};
    --ui-amenities-item-padding-x: #{rem(22)};

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: rem(12);
    min-width: 0;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-amenities-gap-row) var(--ui-amenities-gap-column);
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .item {
    display: flex;
    align-items: center;
    padding: var(--ui-amenities-item-padding-y) var(--ui-amenities-item-padding-x);
    color: var(--a-text-dark);
    border: rem(1) solid var(--a-border-primary);
    border-radius: var(--a-borderR--dialog);
    background: var(--a-whiteBg);
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .showMoreWrap {
    display: flex;
    align-items: center;
  }

  .showMoreButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: none;
    font-weight: 500;
    color: var(--a-text-light);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--a-text-primary);
    }

    &:focus-visible {
      outline: rem(2) solid var(--a-border-primary);
      outline-offset: rem(2);
    }
  }

  .size_md {
    .item {
      @include typo.typo-body-md;
    }

    .showMoreButton {
      @include typo.typo-body-md;
    }
  }

  .size_lg {
    .item {
      font-family: var(--a-font-body);
      font-size: rem(16);
      font-weight: 400;
      line-height: normal;
    }

    .showMoreButton {
      font-family: var(--a-font-body);
      font-size: rem(16);
      line-height: normal;
    }
  }

  @media (min-width: #{size.$desktopMin}) {
    .root {
      --ui-amenities-gap-row: #{rem(8)};
      --ui-amenities-gap-column: #{rem(16)};
    }
  }
</style>
