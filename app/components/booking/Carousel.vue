<script setup lang="ts">
  interface PlaceholderSlide {
    placeholder: true;
    label?: string;
  }

  type CarouselItem = string | PlaceholderSlide;
  type ControlsVisibility = "always" | "hover" | "never";

  const isPlaceholderSlide = (item: CarouselItem): item is PlaceholderSlide => {
    return typeof item === "object" && item?.placeholder === true;
  };
  const isCarouselItem = (item: unknown): item is CarouselItem => {
    if (typeof item === "string") {
      return true;
    }

    if (typeof item !== "object" || item === null) {
      return false;
    }

    return "placeholder" in item && item.placeholder === true;
  };
  const normalizeCarouselItem = (item: unknown): CarouselItem => {
    if (isCarouselItem(item)) {
      return item;
    }

    return {
      placeholder: true,
      label: "Room Photo",
    };
  };
  const getImageSrc = (item: CarouselItem) =>
    typeof item === "string" ? item : "";
  const getPlaceholderLabel = (item: CarouselItem) =>
    isPlaceholderSlide(item) ? item.label ?? "Room Photo" : "Room Photo";

  interface Props {
    images: CarouselItem[];
    altPrefix: string;
    altText: string;
    height?: string;
    showNavigators?: boolean;
    showIndicators?: boolean;
    controlsVisibility?: ControlsVisibility;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: "auto",
    showNavigators: undefined,
    showIndicators: true,
    controlsVisibility: "always",
  });

  const imageLoadedState = ref<Record<number, boolean>>({});
  const hasRealImages = computed(() =>
    props.images.some((image) => typeof image === "string" && image.length > 0),
  );

  const imageLoaded = (index: number) => {
    imageLoadedState.value = {
      ...imageLoadedState.value,
      [index]: true,
    };
  };

  const imageError = (index: number) => {
    imageLoaded(index);
  };

  watch(
    () => props.images,
    () => {
      imageLoadedState.value = {};
    },
    { immediate: true },
  );

  const showSkeleton = (item: CarouselItem, index: number) =>
    hasRealImages.value && typeof item === "string" && !imageLoadedState.value[index];
  const showNavigatorsValue = computed(
    () => props.showNavigators ?? props.images.length > 1,
  );
</script>

<template>
  <UiSlider
    :items="images"
    :show-indicators="props.showIndicators"
    :show-controls="showNavigatorsValue"
    :controls-visibility="props.controlsVisibility"
    aria-label="Галерея изображений"
    :class="$style.carouselBlock"
  >
    <template #default="{ item, index }">
      <div :class="$style.carouselItem">
        <template v-if="!isPlaceholderSlide(normalizeCarouselItem(item))">
          <img
            :src="getImageSrc(normalizeCarouselItem(item))"
            :alt="`${altPrefix} ${altText}`"
            :class="[$style.carouselImage, { [$style.loaded]: imageLoadedState[index] }]"
            :style="{ height }"
            :loading="index <= 1 ? 'eager' : 'lazy'"
            @load="imageLoaded(index)"
            @error="imageError(index)"
          >
          <div
            v-if="showSkeleton(normalizeCarouselItem(item), index)"
            :class="$style.skeletonLoader"
            :style="{ height }"
          />
        </template>
        <div
          v-else
          :class="$style.placeholderSlide"
          :style="{ height: props.height }"
        >
          <span>{{ getPlaceholderLabel(normalizeCarouselItem(item)) }}</span>
        </div>
      </div>
    </template>
  </UiSlider>
</template>

<style module lang="scss">
  .carouselBlock {
    height: 100%;
    --ui-slider-control-side-offset: var(--a-space-1);
    --ui-slider-control-color: var(--a-accentDarkBg);
    --ui-slider-control-hover-color: var(--a-text-dark);
    --ui-slider-indicator-track-color: var(--a-text-light);
    --ui-slider-indicator-active-color: var(--a-primary);
    --ui-slider-indicator-track-height: var(--a-space-1);
    --ui-slider-indicator-track-radius: var(--a-borderR--btn);
  }

  .carouselItem {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .carouselImage {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: rem(8);
    opacity: 0;
    transition: opacity 0.3s ease;

    &.loaded {
      opacity: 1;
    }
  }

  .placeholderSlide {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: rem(8);
    background-color: var(--a-accentLightBg);
    color: var(--a-text-light);
    font-family: var(--a-font-body);
    font-size: rem(16);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .skeletonLoader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(
      45deg,
      var(--a-lightBg) 25%,
      var(--ui-color-secondary-50) 50%,
      var(--ui-color-secondary-200) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: rem(8);
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }
</style>
